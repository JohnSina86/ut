import { Response } from 'express';
import { VehicleService } from './vehicle.service.js';
import { VehicleLookupService } from '../vehicle-lookup-cache/vehicle-lookup.service.js';
import { VehicleSpecService } from '../vehicle-specs/vehicle-spec.service.js';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';

const service       = new VehicleService();
const lookupService = new VehicleLookupService();
const specService   = new VehicleSpecService();

export class VehicleController {

  async lookup(req: AuthRequest, res: Response) {
    const reg = (req.query.reg as string)?.trim();
    if (!reg) return res.status(400).json({ error: 'reg query param required' });
    try {
      const result = await lookupService.lookup(reg);
      res.json(result);
    } catch (err: any) {
      res.status(502).json({ error: err.message || 'Lookup failed' });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const vehicle = await service.create({ ...req.body, user_id: req.user.id });
      // Fire-and-forget spec fetch after save
      if (vehicle.make && vehicle.model) {
        specService.fetchAndCacheSpecs(vehicle.id, vehicle.make, vehicle.model, vehicle.year, vehicle.engine_size)
          .catch(() => {});
      }
      res.status(201).json(vehicle);
    } catch (err) {
      res.status(500).json({ error: 'Unable to save vehicle' });
    }
  }

  async list(req: AuthRequest, res: Response) {
    const list = await service.findByUser(req.user.id);
    res.json(list);
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const updated = await service.update(req.params.id, req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Unable to update vehicle' });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await service.delete(req.params.id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Unable to delete vehicle' });
    }
  }
}
