import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from '../appointments/appointment.entity.js';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  appointment_id!: number;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointment;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: ['cash','card','online','other'], nullable: true })
  payment_method?: string;

  @Column({ type: 'enum', enum: ['pending','paid','refunded','failed'], default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_reference?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}
