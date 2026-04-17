import { Router } from 'express';
import { VehicleController } from './vehicle.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new VehicleController();

router.use(requireAuth);
router.get('/lookup', (req, res) => controller.lookup(req, res));  // must be before /:id
router.post('/',      (req, res) => controller.create(req, res));
router.get('/',       (req, res) => controller.list(req, res));
router.put('/:id',    (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
