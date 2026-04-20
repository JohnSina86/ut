import { Router } from 'express';
import { TransactionController } from './transaction.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new TransactionController();

router.use(requireAuth);
router.post('/', (req, res) => controller.create(req, res));
router.post('/pay-in-person', (req, res) => controller.payInPerson(req, res));
router.get('/appointment/:appointmentId', (req, res) => controller.listForAppointment(req, res));

export default router;
