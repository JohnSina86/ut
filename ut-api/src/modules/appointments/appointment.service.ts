import { AppDataSource } from '../../data-source.js';
import { Appointment }   from './appointment.entity.js';
import { Between }       from 'typeorm';

export class AppointmentService {
  private repo = AppDataSource.getRepository(Appointment);

  async create(data: Partial<Appointment>) {
    const startTime = new Date(data.start_time as any);
    const endTime   = new Date(data.end_time   as any);

    const conflict = await this.repo
      .createQueryBuilder('a')
      .where('a.status NOT IN (:...statuses)', { statuses: ['cancelled'] })
      .andWhere('a.start_time < :end_time',   { end_time:   endTime })
      .andWhere('a.end_time   > :start_time', { start_time: startTime })
      .getOne();

    if (conflict) {
      throw Object.assign(
        new Error('This time slot is already booked.'),
        { statusCode: 409 }
      );
    }

    const a = this.repo.create(data);
    return this.repo.save(a);
  }

  async findBookedSlots(date: string) {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd   = new Date(`${date}T23:59:59.999Z`);
    const appts = await this.repo
      .createQueryBuilder('a')
      .select(['a.start_time', 'a.end_time'])
      .where('a.status NOT IN (:...statuses)', { statuses: ['cancelled'] })
      .andWhere('a.start_time >= :dayStart', { dayStart })
      .andWhere('a.start_time <= :dayEnd',   { dayEnd })
      .getMany();
    return appts.map(a => ({ start_time: a.start_time, end_time: a.end_time }));
  }

  async findByUser(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['service', 'vehicle'],
      order: { start_time: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['service', 'vehicle'],
    });
  }

  async update(id: number, data: Partial<Appointment>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
