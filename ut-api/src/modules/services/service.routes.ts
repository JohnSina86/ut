import { Router } from 'express';
import { ServiceController } from './service.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new ServiceController();

// public list
router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));

// protected create
router.post('/', requireAuth, (req, res) => controller.create(req, res));

router.put('/:id', requireAuth, (req, res) => controller.update(req, res));
router.delete('/:id', requireAuth, (req, res) => controller.remove(req, res));

export default router;
