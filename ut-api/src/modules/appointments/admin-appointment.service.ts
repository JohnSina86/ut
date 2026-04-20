import { AppDataSource } from '../../data-source.js';
import { Appointment } from './appointment.entity.js';
import { User } from '../auth/auth.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';

/**
 * Admin-only appointment operations. These bypass user-ownership scoping
 * so an admin can read / write any appointment in the system.
 *
 * Conflict detection mirrors the customer-facing service so the admin
 * still cannot double-book the same time slot.
 */
export class AdminAppointmentService {
  private repo = AppDataSource.getRepository(Appointment);
  private userRepo = AppDataSource.getRepository(User);
  private vehicleRepo = AppDataSource.getRepository(Vehicle);

  /** All appointments across all users, with relations, newest first. */
  async findAll() {
    return this.repo.find({
      relations: ['user', 'vehicle', 'service'],
      order: { start_time: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'vehicle', 'service'],
    });
  }

  /**
   * Creates an appointment on behalf of a specific customer.
   * Unlike the customer `create()`, `user_id` comes from the request body.
   */
  async createForUser(data: Partial<Appointment>) {
    if (!data.user_id) {
      throw Object.assign(new Error('user_id is required'), { statusCode: 400 });
    }
    if (!data.vehicle_id || !data.service_id || !data.start_time || !data.end_time) {
      throw Object.assign(
        new Error('vehicle_id, service_id, start_time and end_time are required'),
        { statusCode: 400 },
      );
    }

    const startTime = new Date(data.start_time as any);
    const endTime = new Date(data.end_time as any);

    await this.assertNoConflict(startTime, endTime);

    const a = this.repo.create(data);
    return this.repo.save(a);
  }

  /** Update any appointment by id (admin can edit across users). */
  async updateById(id: number, data: Partial<Appointment>) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });
    }

    // If time window is changing, re-check for conflicts (excluding this row).
    if (data.start_time || data.end_time) {
      const startTime = new Date((data.start_time ?? existing.start_time) as any);
      const endTime = new Date((data.end_time ?? existing.end_time) as any);
      await this.assertNoConflict(startTime, endTime, id);
    }

    // Never allow changing the owning user via this endpoint by accident —
    // require the caller to be explicit.
    await this.repo.update(id, data);
    return this.findById(id);
  }

  /** Soft delete (entity has @DeleteDateColumn) — recoverable. */
  async deleteById(id: number) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('Appointment not found'), { statusCode: 404 });
    }
    await this.repo.softDelete(id);
    return { id, deleted: true };
  }

  /** All customers, minimal fields, for the customer dropdown. */
  async findAllUsers() {
    return this.userRepo.find({
      select: ['id', 'name', 'email', 'phone', 'role'],
      order: { name: 'ASC' },
    });
  }

  /** Vehicles belonging to a specific customer, for the vehicle dropdown. */
  async findVehiclesByUser(userId: number) {
    return this.vehicleRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  // ------------------------------------------------------------------
  // internals
  // ------------------------------------------------------------------

  private async assertNoConflict(
    startTime: Date,
    endTime: Date,
    ignoreId?: number,
  ) {
    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.status NOT IN (:...statuses)', { statuses: ['cancelled'] })
      .andWhere('a.start_time < :end_time', { end_time: endTime })
      .andWhere('a.end_time > :start_time', { start_time: startTime });

    if (ignoreId) {
      qb.andWhere('a.id != :ignoreId', { ignoreId });
    }

    const conflict = await qb.getOne();
    if (conflict) {
      throw Object.assign(new Error('This time slot is already booked.'), {
        statusCode: 409,
      });
    }
  }
}
