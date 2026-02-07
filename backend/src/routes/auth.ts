import { Router } from 'express';
import passport from '../config/passport';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/dashboard');
  }
);

router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

export default router;
