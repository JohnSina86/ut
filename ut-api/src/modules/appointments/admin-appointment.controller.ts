import { Response } from 'express';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { AdminAppointmentService } from './admin-appointment.service.js';
import { AdminAuditService } from '../../common/audit/admin-audit.service.js';

const service = new AdminAppointmentService();
const audit = new AdminAuditService();

/**
 * HTTP handlers for the /api/admin/appointments routes.
 * Every route in this controller must already have been guarded by
 * requireAuth + requireAdmin at the router level.
 */
export class AdminAppointmentController {
  async listAll(_req: AuthRequest, res: Response) {
    try {
      const items = await service.findAll();
      res.json(items);
    } catch {
      res.status(500).json({ error: 'Unable to load appointments' });
    }
  }

  async listUsers(_req: AuthRequest, res: Response) {
    try {
      const users = await service.findAllUsers();
      res.json(users);
    } catch {
      res.status(500).json({ error: 'Unable to load users' });
    }
  }

  async listVehiclesByUser(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (Number.isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user id' });
      }
      const vehicles = await service.findVehiclesByUser(userId);
      res.json(vehicles);
    } catch {
      res.status(500).json({ error: 'Unable to load vehicles' });
    }
  }

  async createAppointment(req: AuthRequest, res: Response) {
    try {
      const item = await service.createForUser(req.body);
      audit.log(req.user?.id, 'appointment.create', { appointmentId: item.id, body: req.body });
      res.status(201).json(item);
    } catch (err: any) {
      const status = err.statusCode ?? 500;
      const message = status < 500 ? err.message : 'Unable to save appointment';
      res.status(status).json({ error: message });
    }
  }

  async updateAppointment(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid appointment id' });
      }
      const updated = await service.updateById(id, req.body);
      audit.log(req.user?.id, 'appointment.update', { appointmentId: id, body: req.body });
      res.json(updated);
    } catch (err: any) {
      const status = err.statusCode ?? 500;
      const message = status < 500 ? err.message : 'Unable to update appointment';
      res.status(status).json({ error: message });
    }
  }

  async deleteAppointment(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid appointment id' });
      }
      const result = await service.deleteById(id);
      audit.log(req.user?.id, 'appointment.delete', { appointmentId: id });
      res.json(result);
    } catch (err: any) {
      const status = err.statusCode ?? 500;
      const message = status < 500 ? err.message : 'Unable to delete appointment';
      res.status(status).json({ error: message });
    }
  }
}
