import { Router } from 'express';
import { AdminAppointmentController } from './admin-appointment.controller.js';
import { requireAuth, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { adminRateLimiter } from '../../common/middleware/rate-limit.middleware.js';

const router = Router();
const controller = new AdminAppointmentController();

// Every admin route must apply BOTH requireAuth and requireAdmin — never just one.
// Rate-limit admin traffic to blunt brute-force / enumeration attempts.
router.use(adminRateLimiter);
router.use(requireAuth);
router.use(requireAdmin);

router.get('/appointments',                   (req, res) => controller.listAll(req, res));
router.get('/appointments/users',             (req, res) => controller.listUsers(req, res));
router.get('/appointments/users/:id/vehicles',(req, res) => controller.listVehiclesByUser(req, res));
router.post('/appointments',                  (req, res) => controller.createAppointment(req, res));
router.put('/appointments/:id',               (req, res) => controller.updateAppointment(req, res));
router.delete('/appointments/:id',            (req, res) => controller.deleteAppointment(req, res));

export default router;
