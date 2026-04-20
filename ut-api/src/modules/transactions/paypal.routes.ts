import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { PaypalController } from './paypal.controller.js';

const router = Router();
const controller = new PaypalController();

// Apply `requireAuth` per-route rather than at the router level: all payment
// sub-routers mount under `/api/payments`, so a router-level middleware would
// run for any request that hits this mount point — even one destined for a
// sibling router (e.g. the public GoCardless callback/webhook).
router.post('/paypal/create-order',  requireAuth, (req, res) => controller.createOrder(req, res));
router.post('/paypal/capture-order', requireAuth, (req, res) => controller.captureOrder(req, res));

export default router;
