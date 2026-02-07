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
  const connection = await pool.getConnection();
  
  try {
    await connection.query(
      'INSERT INTO rate_limits (hour_key, sender_email, count) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
      [hourKey, senderEmail]
    );
    
    const [rows] = await connection.query<any[]>(
      'SELECT count FROM rate_limits WHERE hour_key = ? AND sender_email = ?',
      [hourKey, senderEmail]
    );
    
    return rows[0].count <= MAX_EMAILS_PER_HOUR;
  } finally {
    connection.release();
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
        'UPDATE emails SET status = ?, sent_at = NOW() WHERE id = ?',
        ['sent', emailId]
      );
      
      return { success: true, emailId };
    } catch (error: any) {
      await pool.query(
        'UPDATE emails SET status = ?, error_message = ? WHERE id = ?',
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
