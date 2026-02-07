# ReachInbox Email Scheduler

Production-grade email scheduler with BullMQ, Redis, PostgreSQL, and React - built for the ReachInbox hiring assignment.

## Live Demo

- Frontend: https://reachinboxa.onrender.com
- Backend API: https://reachinbox-assignment-4fx6.onrender.com
- GitHub Repository: https://github.com/Sumant3086/ReachInbox_Assignment

Note: Free tier services may take 30-50 seconds to wake up on first request.

## Overview

This is a full-stack email scheduler application that allows users to schedule and send emails at specific times with rate limiting and concurrency control. The system uses BullMQ with Redis for job scheduling (no cron jobs) and persists data in PostgreSQL.

## Key Features

- BullMQ + Redis for persistent job scheduling (no cron)
- Survives server restarts without losing scheduled jobs
- Rate limiting with configurable hourly limits per sender
- Worker concurrency for parallel email processing
- Delay between emails to mimic provider throttling
- Real Google OAuth authentication
- Clean React UI with Tailwind CSS
- PostgreSQL database for data persistence
- Ethereal Email SMTP for testing

## Technical Stack

Backend:
- TypeScript
- Express.js
- BullMQ
- Redis (Upstash)
- PostgreSQL
- Nodemailer
- Passport.js (Google OAuth)

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

Deployment:
- Render (Frontend & Backend)
- Upstash (Redis)
- Render PostgreSQL

## Architecture

### Scheduling System
- Uses BullMQ delayed jobs backed by Redis
- Each email is stored in PostgreSQL with a unique ID
- Jobs are scheduled with delays calculated from start time
- Redis ensures jobs persist across restarts

### Rate Limiting
- Implemented using PostgreSQL counters keyed by hour_window + sender_email
- When hourly limit is reached, jobs are rescheduled to next hour
- Safe across multiple workers using database transactions

### Persistence
- All email jobs stored in PostgreSQL emails table
- BullMQ stores job state in Redis
- On restart, BullMQ automatically recovers pending jobs from Redis
- Database tracks sent/failed status to prevent duplicates

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL or MySQL
- Redis
- Docker (optional, for Redis)

### Step 1: Clone Repository
```bash
git clone https://github.com/Sumant3086/ReachInbox_Assignment.git
cd ReachInbox_Assignment
```

### Step 2: Setup Redis

Option A - Using Docker:
```bash
docker run -d -p 6379:6379 --name reachinbox-redis redis:alpine
```

Option B - Using Upstash:
1. Sign up at https://console.upstash.com/
2. Create a Redis database
3. Copy connection details

### Step 3: Setup Database

For PostgreSQL:
```bash
createdb reachinbox
```

For MySQL:
```bash
mysql -u root -e "CREATE DATABASE reachinbox;"
```

### Step 4: Setup Ethereal Email
1. Visit https://ethereal.email/create
2. Copy the username and password

### Step 5: Setup Google OAuth
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI: http://localhost:3001/auth/google/callback
6. Copy Client ID and Secret

### Step 6: Configure Backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit backend/.env with your credentials:
```
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
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

### Step 7: Start Backend
```bash
cd backend
npm run dev
```

### Step 8: Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 9: Access Application
Open http://localhost:3000 in your browser

## Usage

1. Login with Google OAuth
2. Click "Compose New Email"
3. Fill in subject and body
4. Upload CSV/TXT file with email addresses
5. Set start time, delay between emails, and hourly limit
6. Click "Schedule Emails"
7. View scheduled emails in "Scheduled Emails" tab
8. View sent emails in "Sent Emails" tab
9. Check Ethereal inbox at https://ethereal.email/messages

## Testing Restart Persistence

1. Schedule emails for 5 minutes in the future
2. Stop the backend server (Ctrl+C)
3. Wait 1 minute
4. Start the backend server again
5. Emails will still be sent at the scheduled time

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, Passport configuration
│   ├── middleware/      # Authentication middleware
│   ├── queue/           # BullMQ worker and queue setup
│   ├── routes/          # API endpoints
│   ├── services/        # Email sending logic
│   └── server.ts        # Express app entry
└── package.json

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Login and Dashboard pages
│   ├── api.ts           # API client
│   ├── types.ts         # TypeScript interfaces
│   └── App.tsx          # Root component
└── package.json
```

## API Endpoints

Authentication:
- GET /auth/google - Initiate Google OAuth
- GET /auth/google/callback - OAuth callback
- GET /auth/user - Get current user
- POST /auth/logout - Logout

Emails:
- POST /api/emails/schedule - Schedule emails (multipart/form-data)
- GET /api/emails/scheduled - Get scheduled emails
- GET /api/emails/sent - Get sent emails

## Environment Variables

Backend Required Variables:
- PORT - Server port
- REDIS_HOST - Redis hostname
- REDIS_PORT - Redis port
- REDIS_PASSWORD - Redis password (if using Upstash)
- DB_HOST - Database hostname
- DB_PORT - Database port
- DB_USER - Database username
- DB_PASSWORD - Database password
- DB_NAME - Database name
- SMTP_HOST - SMTP server host
- SMTP_PORT - SMTP server port
- SMTP_USER - SMTP username
- SMTP_PASS - SMTP password
- GOOGLE_CLIENT_ID - Google OAuth client ID
- GOOGLE_CLIENT_SECRET - Google OAuth client secret
- GOOGLE_CALLBACK_URL - Google OAuth callback URL
- SESSION_SECRET - Session secret key
- FRONTEND_URL - Frontend URL
- WORKER_CONCURRENCY - Number of concurrent workers
- EMAIL_DELAY_MS - Delay between emails in milliseconds
- MAX_EMAILS_PER_HOUR - Maximum emails per hour

## Deployment

The application is deployed on Render:
- Frontend: Static Site
- Backend: Web Service
- Database: PostgreSQL
- Redis: Upstash

Deployment URLs:
- Application: https://reachinboxa.onrender.com
- API: https://reachinbox-assignment-4fx6.onrender.com

## Design Decisions

1. BullMQ over Cron: Better for delayed jobs, has built-in persistence and retry logic
2. PostgreSQL over MongoDB: Need ACID transactions for rate limiting, better for structured data
3. Ethereal Email: Safe testing without spamming real inboxes
4. Session Auth: Simpler for demo, production would use JWT

## Limitations and Future Improvements

Current Limitations:
- Single tenant (one user per session)
- Basic error messages
- No email templates
- Session store in memory

Future Enhancements:
- Email templates with variables
- Campaign management
- Analytics dashboard
- Click tracking
- Unit and integration tests
- Monitoring with Prometheus
- Better error handling and logging

## Contact

- Developer: Sumant Yadav
- GitHub: https://github.com/Sumant3086
- Repository: https://github.com/Sumant3086/ReachInbox_Assignment
- Live Demo: https://reachinboxa.onrender.com

## Acknowledgments

Built for the ReachInbox hiring assignment. All code is original and written specifically for this project.

Technologies and Services:
- BullMQ - Job queue (https://docs.bullmq.io/)
- Render - Deployment platform (https://render.com/)
- Upstash - Redis hosting (https://upstash.com/)
- Ethereal Email - Email testing (https://ethereal.email/)
- Google OAuth - Authentication (https://developers.google.com/identity/protocols/oauth2)

## License

This project is created for the ReachInbox hiring assignment.
