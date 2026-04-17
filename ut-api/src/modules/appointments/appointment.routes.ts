import { Router } from 'express';
import { AppointmentController } from './appointment.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new AppointmentController();

router.use(requireAuth);
router.get('/booked',  (req, res) => controller.bookedSlots(req, res));
router.get('/',        (req, res) => controller.list(req, res));
router.post('/',       (req, res) => controller.create(req, res));
router.get('/:id',     (req, res) => controller.getById(req, res));
router.put('/:id',     (req, res) => controller.update(req, res));

export default router;
