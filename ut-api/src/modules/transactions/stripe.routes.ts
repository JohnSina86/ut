import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { StripeController } from './stripe.controller.js';

const router = Router();
const controller = new StripeController();

// Apply `requireAuth` per-route (see `paypal.routes.ts` for the explanation).
router.post('/google-pay/create-intent', requireAuth, (req, res) => controller.createIntent(req, res));
router.post('/google-pay/confirm',       requireAuth, (req, res) => controller.confirm(req, res));

export default router;
