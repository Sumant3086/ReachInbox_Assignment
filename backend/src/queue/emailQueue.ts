import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { sendEmail } from '../services/emailService';
import { pool } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5');
const EMAIL_DELAY_MS = parseInt(process.env.EMAIL_DELAY_MS || '2000');
const MAX_EMAILS_PER_HOUR = parseInt(process.env.MAX_EMAILS_PER_HOUR || '200');

interface EmailJobData {
  emailId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  senderEmail: string;
}

export const emailQueue = new Queue('email-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 }
  }
});

async function checkRateLimit(senderEmail: string): Promise<boolean> {
  const hourKey = new Date().toISOString().slice(0, 13);
  const client = await pool.connect();
  
  try {
    await client.query(
      `INSERT INTO rate_limits (hour_key, sender_email, count) 
       VALUES ($1, $2, 1) 
       ON CONFLICT (hour_key, sender_email) 
       DO UPDATE SET count = rate_limits.count + 1`,
      [hourKey, senderEmail]
    );
    
    const result = await client.query(
      'SELECT count FROM rate_limits WHERE hour_key = $1 AND sender_email = $2',
      [hourKey, senderEmail]
    );
    
    return result.rows[0].count <= MAX_EMAILS_PER_HOUR;
  } finally {
    client.release();
  }
}

export const emailWorker = new Worker<EmailJobData>(
  'email-queue',
  async (job: Job<EmailJobData>) => {
    const { emailId, recipientEmail, subject, body, senderEmail } = job.data;
    
    const canSend = await checkRateLimit(senderEmail);
    
    if (!canSend) {
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const delayMs = nextHour.getTime() - Date.now();
      
      await emailQueue.add('send-email', job.data, { delay: delayMs });
      return { rescheduled: true, nextAttempt: nextHour };
    }
    
    await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS));
    
    try {
      await sendEmail(recipientEmail, subject, body);
      
      await pool.query(
        'UPDATE emails SET status = $1, sent_at = NOW() WHERE id = $2',
        ['sent', emailId]
      );
      
      return { success: true, emailId };
    } catch (error: any) {
      await pool.query(
        'UPDATE emails SET status = $1, error_message = $2 WHERE id = $3',
        ['failed', error.message, emailId]
      );
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: WORKER_CONCURRENCY,
    limiter: { max: 1, duration: EMAIL_DELAY_MS }
  }
);

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err.message);
});
