import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text: body,
    html: `<div>${body}</div>`
  });
}
