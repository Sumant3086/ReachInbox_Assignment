import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

export async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id VARCHAR(36) PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        scheduled_at DATETIME NOT NULL,
        sent_at DATETIME NULL,
        status ENUM('scheduled', 'sent', 'failed') DEFAULT 'scheduled',
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_scheduled_at (scheduled_at)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hour_key VARCHAR(50) NOT NULL,
        sender_email VARCHAR(255) NOT NULL,
        count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_hour_sender (hour_key, sender_email)
      )
    `);
  } finally {
    connection.release();
  }
}
