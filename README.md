# 📧 ReachInbox Email Scheduler

Hey there! This is my submission for the ReachInbox assignment - a production-ready email scheduler that can handle scheduling and sending emails at scale.

## 🎯 What Does This Do?

Think of it as a mini version of what ReachInbox does under the hood. You can:
- Schedule emails to be sent at specific times
- Upload a list of recipients via CSV/TXT file
- Control how fast emails go out (rate limiting)
- See all your scheduled and sent emails in a clean dashboard
- Rest easy knowing your scheduled emails won't disappear if the server restarts

## ✨ Key Features

### The Cool Stuff
- **No Cron Jobs**: Uses BullMQ with Redis for smart job scheduling
- **Survives Restarts**: Schedule emails, restart the server, they still send on time
- **Rate Limiting**: Won't spam - respects hourly limits and delays between emails
- **Real Google Login**: Actual OAuth, not a mock
- **Clean UI**: Built with React and Tailwind CSS to match the Figma design

### Under the Hood
- **Backend**: TypeScript + Express.js + BullMQ + Redis + MySQL
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Email Testing**: Ethereal Email (fake SMTP for safe testing)

## 🚀 Quick Start

### What You Need
- Node.js 18 or higher
- MySQL running locally
- Docker (for Redis)
- A Google account (for OAuth)

### Step 1: Get Redis Running
```bash
docker run -d -p 6379:6379 --name reachinbox-redis redis:alpine
```

### Step 2: Setup Ethereal Email
1. Go to https://ethereal.email/create
2. Copy the username and password you get

### Step 3: Setup Google OAuth
1. Head to https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Go to "APIs & Services" → "Credentials"
4. Create "OAuth 2.0 Client ID"
5. Add this redirect URI: `http://localhost:3001/auth/google/callback`
6. Save your Client ID and Secret

### Step 4: Configure Backend
```bash
cd backend
npm install
cp .env.example .env
```

Now edit `backend/.env` with your credentials (Ethereal email, Google OAuth, etc.)

### Step 5: Start Backend
```bash
cd backend
npm run dev
```

### Step 6: Start Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### Step 7: Try It Out!
Open http://localhost:3000 in your browser and login with Google!

## 📝 How to Use

1. **Login**: Click "Continue with Google"
2. **Compose**: Hit the "Compose New Email" button
3. **Fill Details**:
   - Write your subject and message
   - Upload a CSV/TXT file with email addresses
   - Pick when to start sending
   - Set delay between emails (in seconds)
   - Set hourly limit
4. **Schedule**: Click "Schedule Emails"
5. **Watch**: Check the "Scheduled Emails" tab, then "Sent Emails" after they go out
6. **Verify**: Login to https://ethereal.email/messages to see the actual emails

## 🧪 Testing the Restart Feature

Want to see the magic? Here's how:

1. Schedule some emails for 5 minutes from now
2. Stop the backend server (Ctrl+C)
3. Wait a couple minutes
4. Start the backend again
5. Watch as emails still send at the right time - no duplicates, no lost jobs!

## 🏗️ How It Works

### Scheduling
- Uses BullMQ to create delayed jobs in Redis
- Each email gets a unique ID and is stored in MySQL
- When it's time to send, the worker picks it up automatically

### Rate Limiting
- Tracks emails sent per hour in MySQL
- If you hit the limit, jobs get rescheduled to the next hour
- No emails are dropped or lost

### Persistence
- Redis keeps the job queue
- MySQL keeps the email records
- On restart, BullMQ loads pending jobs from Redis
- Database prevents duplicate sends

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, OAuth setup
│   ├── middleware/      # Auth checks
│   ├── queue/           # BullMQ worker
│   ├── routes/          # API endpoints
│   ├── services/        # Email sending logic
│   └── server.ts        # Main entry point
└── package.json

frontend/
├── src/
│   ├── components/      # Reusable UI pieces
│   ├── pages/           # Login & Dashboard
│   ├── api.ts           # Backend communication
│   └── types.ts         # TypeScript definitions
└── package.json
```

## 🔧 Tech Stack

**Backend**
- TypeScript for type safety
- Express.js for the API
- BullMQ for job scheduling
- Redis for job persistence
- MySQL for data storage
- Nodemailer for sending emails
- Passport.js for Google OAuth

**Frontend**
- React for the UI
- TypeScript for type safety
- Vite for fast builds
- Tailwind CSS for styling
- Axios for API calls

## 💡 Design Decisions

- **Why BullMQ?** Better than cron for delayed jobs, has built-in persistence and retry logic
- **Why MySQL?** Need ACID transactions for rate limiting, better for structured data
- **Why Ethereal?** Safe testing without spamming real inboxes
- **Why Session Auth?** Simpler for demo, production would use JWT

## 🎓 What I Learned

Building this taught me a lot about:
- Job queues and background processing
- Rate limiting at scale
- Handling server restarts gracefully
- Building production-ready APIs
- React state management
- OAuth flows

## 📦 Sample Files

Check out `sample-emails.txt` for an example email list format.

## 🐛 Troubleshooting

**Backend won't start?**
- Make sure Redis is running: `docker ps`
- Check MySQL is running and credentials are correct
- Verify all environment variables in `.env`

**Can't login?**
- Double-check Google OAuth credentials
- Make sure redirect URI matches exactly
- Check if Google+ API is enabled

**Emails not sending?**
- Verify Ethereal credentials
- Check backend logs for errors
- Make sure Redis and MySQL are connected

## 🙏 Acknowledgments

Built for the ReachInbox hiring assignment. All code is original and written specifically for this project.

---

Made with ☕ and lots of debugging
