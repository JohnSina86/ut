import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import passport from '../../config/passport.js';

const router = Router();
const controller = new AuthController();

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed` }),
  (req, res) => {
    const { token, user } = req.user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userData = encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
    }));
    res.redirect(`${frontendUrl}/oauth/callback?token=${token}&user=${userData}`);
  }
);

// Protected endpoints
router.get('/profile', requireAuth, (req, res) => controller.profile(req, res));
router.put('/profile', requireAuth, (req, res) => controller.updateProfile(req, res));
router.put('/password', requireAuth, (req, res) => controller.changePassword(req, res));
router.delete('/delete', requireAuth, (req, res) => controller.deleteAccount(req, res));

export default router;
