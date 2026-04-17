import { AppDataSource } from '../../data-source.js';
import { Vehicle } from './vehicle.entity.js';

export class VehicleService {
  private repo = AppDataSource.getRepository(Vehicle);

  async create(data: Partial<Vehicle>) {
    const v = this.repo.create(data);
    return this.repo.save(v);
  }

  async findByUser(userId: number) {
    return this.repo.find({ where: { user_id: userId } });
  }

  async update(id: string, data: Partial<Vehicle>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id: parseInt(id, 10) } });
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}
