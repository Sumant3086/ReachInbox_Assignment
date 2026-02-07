# ReachInbox Email Scheduler

Production-grade email scheduler service with BullMQ, Redis, and MySQL/PostgreSQL.

## Features

### Backend
- **BullMQ + Redis** for persistent job scheduling (no cron)
- **MySQL/PostgreSQL** database for email storage
- **Ethereal Email** SMTP for testing
- **Rate limiting** with configurable hourly limits per sender
- **Worker concurrency** for parallel email processing
- **Delay between emails** to mimic provider throttling
- **Persistence across restarts** - scheduled emails survive server restarts
- **Idempotency** - emails are never sent twice

### Frontend
- **Google OAuth** authentication
- **Compose email** with CSV/TXT file upload
- **Scheduled emails** table view
- **Sent emails** table view with status
- Clean UI with Tailwind CSS

## Architecture

### Scheduling System
- Uses **BullMQ delayed jobs** backed by Redis
- Each email is stored in MySQL with a unique ID
- Jobs are scheduled with delays calculated from start time
- Redis ensures jobs persist across restarts

### Rate Limiting
- Implemented using MySQL counters keyed by `hour_window + sender_email`
- When hourly limit is reached, jobs are rescheduled to next hour
- Safe across multiple workers using database transactions

### Concurrency & Throttling
- Worker concurrency: Configurable via `WORKER_CONCURRENCY` (default: 5)
- Email delay: Minimum `EMAIL_DELAY_MS` between sends (default: 2000ms)
- BullMQ limiter ensures controlled throughput

### Persistence
- All email jobs stored in MySQL `emails` table
- BullMQ stores job state in Redis
- On restart, BullMQ automatically recovers pending jobs from Redis
- Database tracks sent/failed status to prevent duplicates

## Setup

### Prerequisites
- Node.js 18+
- MySQL or PostgreSQL
- Redis
- Docker (optional, for Redis/MySQL)

### 1. Start Redis and MySQL (Docker)

```bash
docker run -d -p 6379:6379 redis:alpine
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=reachinbox mysql:8
```

### 2. Setup Ethereal Email

Visit https://ethereal.email/ and create a test account. Note the credentials.

### 3. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
6. Note the Client ID and Secret

### 4. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=reachinbox

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user
SMTP_PASS=your-ethereal-pass

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

SESSION_SECRET=your-random-secret
FRONTEND_URL=http://localhost:3000

WORKER_CONCURRENCY=5
EMAIL_DELAY_MS=2000
MAX_EMAILS_PER_HOUR=200
```

Start backend:
```bash
npm run dev
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## Usage

1. Open http://localhost:3000
2. Click "Continue with Google"
3. After login, click "Compose New Email"
4. Fill in:
   - Subject and body
   - Upload CSV/TXT file with emails (one per line or comma-separated)
   - Set start time
   - Set delay between emails (seconds)
   - Set hourly limit
5. Click "Schedule Emails"
6. View scheduled/sent emails in respective tabs

## Testing Restart Scenario

1. Schedule emails for 5 minutes in the future
2. Stop the backend server (Ctrl+C)
3. Wait 1 minute
4. Start the backend server again
5. Emails will still be sent at the scheduled time

## Rate Limiting Behavior

When hourly limit is reached:
- Jobs are not dropped or failed
- They are rescheduled to the next hour window
- Order is preserved as much as possible
- Uses database counters for accuracy across workers

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # MySQL connection & schema
│   │   ├── redis.ts         # Redis connection
│   │   └── passport.ts      # Google OAuth config
│   ├── middleware/
│   │   └── auth.ts          # Authentication middleware
│   ├── queue/
│   │   └── emailQueue.ts    # BullMQ worker & queue
│   ├── routes/
│   │   ├── auth.ts          # Auth endpoints
│   │   └── emails.ts        # Email API endpoints
│   ├── services/
│   │   └── emailService.ts  # SMTP email sending
│   └── server.ts            # Express app entry
└── package.json

frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Top navigation
│   │   └── ComposeModal.tsx # Email compose form
│   ├── pages/
│   │   ├── Login.tsx        # Google login page
│   │   └── Dashboard.tsx    # Main dashboard
│   ├── api.ts               # API client
│   ├── types.ts             # TypeScript types
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
└── package.json
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/user` - Get current user
- `POST /auth/logout` - Logout

### Emails
- `POST /api/emails/schedule` - Schedule emails (multipart/form-data)
- `GET /api/emails/scheduled` - Get scheduled emails
- `GET /api/emails/sent` - Get sent emails

## Trade-offs & Assumptions

1. **Single tenant**: Simplified to one user per session (can extend to multi-tenant)
2. **Ethereal Email**: Used for testing; production would use real SMTP providers
3. **Rate limiting**: Global per sender; could be extended to per-domain or per-campaign
4. **File parsing**: Simple regex for email extraction; production would validate more strictly
5. **Error handling**: Basic error messages; production would have detailed logging and monitoring
6. **Security**: Session-based auth; production would use JWT or more robust session store

## Technologies Used

- **Backend**: TypeScript, Express.js, BullMQ, Redis, MySQL, Nodemailer, Passport.js
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Axios
- **Infrastructure**: Docker (optional)
