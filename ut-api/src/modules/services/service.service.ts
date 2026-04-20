import { AppDataSource } from '../../data-source.js';
import { ServiceEntity } from './service.entity.js';

export class ServiceService {
  private repo = AppDataSource.getRepository(ServiceEntity);

  async list() {
    return this.repo.find({ where: { is_active: true }, order: { display_order: 'ASC' } });
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<ServiceEntity>) {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }
}
