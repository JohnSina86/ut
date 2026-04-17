import { Request, Response } from 'express';
import { BusinessSettingService } from './business-setting.service.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';

const service = new BusinessSettingService();

export class BusinessSettingController {
  async get(req: Request, res: Response) {
    const { key } = req.params;
    const item = await service.get(key);
    res.json(item);
  }

  async set(req: AuthRequest, res: Response) {
    const { key, value } = req.body;
    const item = await service.set(key, value);
    res.json(item);
  }
}
