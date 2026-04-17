import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../auth/auth.entity.js';
import { Vehicle } from '../vehicles/vehicle.entity.js';
import { ServiceEntity } from '../services/service.entity.js';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'int' })
  vehicle_id!: number;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Vehicle;

  @Column({ type: 'int' })
  service_id!: number;

  @ManyToOne(() => ServiceEntity)
  @JoinColumn({ name: 'service_id' })
  service!: ServiceEntity;

  @Column({ type: 'datetime' })
  start_time!: Date;

  @Column({ type: 'datetime' })
  end_time!: Date;

  @Column({ type: 'enum', enum: ['scheduled','confirmed','in_progress','completed','cancelled'], default: 'scheduled' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cancellation_reason?: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}
