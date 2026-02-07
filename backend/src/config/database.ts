import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST?.includes('render.com') ? { rejectUnauthorized: false } : undefined
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id VARCHAR(36) PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        scheduled_at TIMESTAMP NOT NULL,
        sent_at TIMESTAMP NULL,
        status VARCHAR(20) DEFAULT 'scheduled',
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_status ON emails(status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_scheduled_at ON emails(scheduled_at)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        hour_key VARCHAR(50) NOT NULL,
        sender_email VARCHAR(255) NOT NULL,
        count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (hour_key, sender_email)
      )
    `);
  } finally {
    client.release();
  }
}
