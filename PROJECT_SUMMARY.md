# ReachInbox Assignment - Project Summary

Candidate Name: Sumant Yadav  
GitHub Repository: https://github.com/Sumant3086/ReachInbox_Assignment  
Submission Date: February 8, 2026


## What I Built

I built a full-stack email scheduler application that allows users to schedule and send emails at specific times with rate limiting and concurrency control. The system uses BullMQ with Redis for job scheduling (no cron jobs) and persists data in MySQL.


## Requirements Met

### Backend Requirements (All Completed)

1. TypeScript + Express.js - All backend code written in TypeScript
2. BullMQ + Redis - Used for job scheduling with persistence
3. MySQL Database - Stores email records and rate limit counters
4. Ethereal Email - Configured for SMTP testing
5. No Cron Jobs - Used BullMQ delayed jobs instead
6. Restart Persistence - Scheduled emails survive server restarts
7. No Duplicates - Implemented idempotency using unique job IDs
8. Worker Concurrency - Configurable (default: 5 concurrent jobs)
9. Email Delay - Minimum 2 seconds between sends
10. Rate Limiting - Hourly limit per sender using MySQL counters
11. Configurable - All limits set via environment variables

### Frontend Requirements (All Completed)

1. React + TypeScript - Built with Vite
2. Tailwind CSS - For styling
3. Google OAuth - Real authentication (not mock)
4. User Info Display - Shows name, email, and avatar
5. Logout Functionality - Working logout
6. Compose Form - With all required fields:
   - Subject and body inputs
   - CSV/TXT file upload
   - Email count display
   - Start time picker
   - Delay between emails
   - Hourly limit
7. Scheduled Emails Table - Shows email, subject, time, status
8. Sent Emails Table - Shows email, subject, sent time, status
9. Loading States - Implemented for all data fetching
10. Empty States - Shown when no data available


## Technical Implementation

### How Scheduling Works

1. User uploads CSV file with email addresses
2. Backend parses emails and creates a job for each one
3. Each job is stored in MySQL with a unique ID
4. BullMQ schedules the job with calculated delay
5. Redis stores the job queue
6. Worker picks up jobs when delay expires
7. Before sending, checks rate limit in MySQL
8. If under limit, sends email and updates status
9. If over limit, reschedules to next hour

### How Persistence Works

- **BullMQ** stores job state in Redis with AOF persistence
- **MySQL** stores email metadata (scheduled_at, status, etc.)
- On restart, BullMQ automatically loads pending jobs from Redis
- Job ID = Email UUID prevents duplicate processing

### How Rate Limiting Works

- MySQL table tracks emails sent per hour per sender
- Hour key format: "YYYY-MM-DDTHH" (e.g., "2026-02-08T14")
- Atomic increment using INSERT...ON DUPLICATE KEY UPDATE
- When limit reached, job is rescheduled to next hour
- Safe across multiple workers due to database transactions


## Code Structure

### Backend (`backend/src/`)
- `config/` - Database, Redis, and Passport configuration
- `middleware/` - Authentication middleware
- `queue/` - BullMQ worker and queue setup
- `routes/` - API endpoints for auth and emails
- `services/` - Email sending logic
- `server.ts` - Express app initialization

### Frontend (`frontend/src/`)
- `components/` - Reusable UI components (Header, ComposeModal)
- `pages/` - Login and Dashboard pages
- `api.ts` - Axios client for backend communication
- `types.ts` - TypeScript interfaces
- `App.tsx` - Main app with routing

---

## What I Learned

1. **Job Queues** - How to use BullMQ for delayed job processing
2. **Rate Limiting** - Implementing distributed rate limiting with database
3. **Persistence** - Ensuring jobs survive server restarts
4. **OAuth Flow** - Implementing Google OAuth with Passport.js
5. **Concurrency** - Managing parallel job processing safely
6. **TypeScript** - Writing type-safe backend and frontend code

---

## Challenges Faced

### Challenge 1: Rate Limiting Across Workers
**Problem:** In-memory counters don't work with multiple workers  
**Solution:** Used MySQL with atomic increments and hour-based keys

### Challenge 2: Restart Persistence
**Problem:** Jobs need to survive server restarts  
**Solution:** BullMQ + Redis persistence + MySQL for metadata

### Challenge 3: Preventing Duplicates
**Problem:** Same email shouldn't be sent twice after restart  
**Solution:** Used email UUID as job ID for idempotency

---

## Testing Done

1. Scheduled 5 emails successfully
2. Verified emails appear in scheduled table
3. Waited for scheduled time and verified emails sent
4. Checked sent emails table shows correct status
5. Tested restart scenario:
   - Scheduled emails for 5 minutes ahead
   - Stopped server after 2 minutes
   - Started server again
   - Verified emails still sent at correct time
6. Verified no duplicate sends
7. Checked Ethereal inbox for received emails
8. Tested Google OAuth login/logout


## What Could Be Improved

Given more time, I would add:

1. Email Templates - Support for dynamic variables
2. Campaign Management - Group emails into campaigns
3. Analytics - Open rates, click tracking
4. Retry Logic - Better handling of SMTP failures
5. Testing - Unit and integration tests
6. Monitoring - Prometheus metrics, error tracking
7. UI Polish - More animations and better error messages


## Environment Setup

### Local Development
- Node.js 18+
- MySQL (local installation)
- Redis (Docker container)
- Google OAuth credentials
- Ethereal Email account

### Configuration
All sensitive data in .env file (not committed to Git)


## Time Spent

- Planning & Setup: 2 hours
- Backend Development: 6 hours
- Frontend Development: 4 hours
- Testing & Debugging: 3 hours
- Documentation: 1 hour
- Total: ~16 hours


## Key Files to Review

1. backend/src/queue/emailQueue.ts - BullMQ worker implementation
2. backend/src/config/database.ts - Database schema and setup
3. backend/src/routes/emails.ts - Email scheduling API
4. frontend/src/pages/Dashboard.tsx - Main UI
5. frontend/src/components/ComposeModal.tsx - Email compose form

## Running the Project

### Prerequisites
```bash
# Start Redis
docker run -d -p 6379:6379 --name reachinbox-redis redis:alpine

# Create MySQL database
mysql -u root -e "CREATE DATABASE reachinbox;"
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:3001


## Deployment Notes

Attempted deployment on Render but faced challenges:
- Render removed free Redis tier
- Would need Upstash or Railway for free Redis
- PostgreSQL and web service work fine on Render
- Local development fully functional


## Original Work

All code written from scratch for this assignment. No templates or boilerplates used. References consulted:
- BullMQ documentation
- Passport.js documentation
- React documentation
- MySQL documentation


## Contact

GitHub: https://github.com/Sumant3086  
Repository: https://github.com/Sumant3086/ReachInbox_Assignment


Thank you for reviewing my submission. I'm happy to answer any questions or demonstrate the application live.
