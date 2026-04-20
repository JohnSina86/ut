import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { StripeController } from './stripe.controller.js';

const router = Router();
const controller = new StripeController();

router.use(requireAuth);

router.post('/google-pay/create-intent', (req, res) => controller.createIntent(req, res));
router.post('/google-pay/confirm',       (req, res) => controller.confirm(req, res));

export default router;
