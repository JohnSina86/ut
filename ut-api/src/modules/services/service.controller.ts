import { Request, Response } from 'express';
import { ServiceService } from './service.service.js';

const service = new ServiceService();

export class ServiceController {
  async list(req: Request, res: Response) {
    const items = await service.list();
    res.json(items);
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid service id' });
      const item = await service.findById(id);
      if (!item) return res.status(404).json({ error: 'Service not found' });
      res.json(item);
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: 'Unable to save service' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      const item = await service.update(id, req.body);
      if (!item) return res.status(404).json({ error: 'Service not found' });
      res.json(item);
    } catch { res.status(500).json({ error: 'Server error' }); }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      await service.remove(id);
      res.status(204).send();
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
}