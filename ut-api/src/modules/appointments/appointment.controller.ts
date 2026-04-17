import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { AppointmentService } from './appointment.service.js';
import { Response } from 'express';

const service = new AppointmentService();

export class AppointmentController {
  async list(req: AuthRequest, res: Response) {
    const items = await service.findByUser(req.user.id);
    res.json(items);
  }

  async bookedSlots(req: AuthRequest, res: Response) {
    try {
      const date  = req.query.date as string;
      const slots = await service.findBookedSlots(date);
      res.json(slots);
    } catch (err) {
      res.status(500).json({ error: 'Unable to fetch booked slots' });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const item = await service.create({ ...req.body, user_id: req.user.id });
      res.status(201).json(item);
    } catch (err: any) {
      const status  = err.statusCode ?? 500;
      const message = status === 409 ? err.message : 'Unable to save appointment';
      res.status(status).json({ error: message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const item = await service.findById(parseInt(req.params.id, 10));
      if (!item) return res.status(404).json({ error: 'Appointment not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const updated = await service.update(parseInt(req.params.id, 10), req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Unable to update appointment' });
    }
  }
}
