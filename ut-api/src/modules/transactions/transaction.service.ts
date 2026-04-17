import { AppDataSource } from '../../data-source.js';
import { Transaction } from './transaction.entity.js';

export class TransactionService {
  private repo = AppDataSource.getRepository(Transaction);

  async create(data: Partial<Transaction>) {
    const t = this.repo.create(data);
    return this.repo.save(t);
  }

  async findByAppointment(appointmentId: number) {
    return this.repo.find({ where: { appointment_id: appointmentId } });
  }
}
