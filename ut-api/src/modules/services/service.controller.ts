import { Request, Response } from 'express';
import { ServiceService } from './service.service.js';

const service = new ServiceService();

export class ServiceController {
  async list(req: Request, res: Response) {
    const items = await service.list();
    res.json(items);
  }

  async create(req: Request, res: Response) {
    try {
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: 'Unable to save service' });
    }
  }
}
