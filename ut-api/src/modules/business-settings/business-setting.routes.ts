import { Router } from 'express';
import { BusinessSettingController } from './business-setting.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new BusinessSettingController();

router.get('/:key', (req, res) => controller.get(req, res));
router.post('/', requireAuth, (req, res) => controller.set(req, res));

export default router;
