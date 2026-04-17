import { Request, Response } from 'express';
import { TransactionService } from './transaction.service.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';

const service = new TransactionService();

export class TransactionController {
  async create(req: AuthRequest, res: Response) {
    try {
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: 'Unable to save transaction' });
    }
  }

  async listForAppointment(req: AuthRequest, res: Response) {
    const { appointmentId } = req.params;
    const list = await service.findByAppointment(+appointmentId);
    res.json(list);
  }
}
