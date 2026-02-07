import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import { initDatabase } from './config/database';
import authRoutes from './routes/auth';
import emailRoutes from './routes/emails';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/emails', emailRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  try {
    await initDatabase();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
