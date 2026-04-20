import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { PaypalController } from './paypal.controller.js';

const router = Router();
const controller = new PaypalController();

router.use(requireAuth);

router.post('/paypal/create-order',  (req, res) => controller.createOrder(req, res));
router.post('/paypal/capture-order', (req, res) => controller.captureOrder(req, res));

export default router;
