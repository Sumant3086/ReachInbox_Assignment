import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { pool } from '../config/database';
import { emailQueue } from '../queue/emailQueue';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/schedule', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const { subject, body, startTime, delayBetweenEmails, hourlyLimit } = req.body;
    const user = req.user as any;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Email list file required' });
    }
    
    const fileContent = file.buffer.toString('utf-8');
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = fileContent.match(emailRegex) || [];
    
    if (emails.length === 0) {
      return res.status(400).json({ error: 'No valid emails found' });
    }
    
    const startDate = new Date(startTime);
    const delayMs = parseInt(delayBetweenEmails) * 1000;
    
    const scheduledEmails = [];
    
    for (let i = 0; i < emails.length; i++) {
      const emailId = uuidv4();
      const scheduledAt = new Date(startDate.getTime() + i * delayMs);
      
      await pool.query(
        'INSERT INTO emails (id, user_email, recipient_email, subject, body, scheduled_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [emailId, user.email, emails[i], subject, body, scheduledAt, 'scheduled']
      );
      
      const delay = scheduledAt.getTime() - Date.now();
      
      await emailQueue.add(
        'send-email',
        {
          emailId,
          recipientEmail: emails[i],
          subject,
          body,
          senderEmail: user.email
        },
        { delay: delay > 0 ? delay : 0, jobId: emailId }
      );
      
      scheduledEmails.push({ emailId, recipient: emails[i], scheduledAt });
    }
    
    res.json({ success: true, count: emails.length, emails: scheduledEmails });
  } catch (error: any) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/scheduled', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const [rows] = await pool.query(
      'SELECT id, recipient_email, subject, scheduled_at, status FROM emails WHERE user_email = ? AND status = ? ORDER BY scheduled_at DESC',
      [user.email, 'scheduled']
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sent', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const [rows] = await pool.query(
      'SELECT id, recipient_email, subject, sent_at, status, error_message FROM emails WHERE user_email = ? AND status IN (?, ?) ORDER BY sent_at DESC',
      [user.email, 'sent', 'failed']
    );
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
