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

  @Column({
    type: 'enum',
    enum: ['cash', 'card', 'paypal', 'google_pay', 'direct_debit', 'pay_in_person'],
    nullable: true,
  })
  payment_method?: string;

  @Column({ type: 'enum', enum: ['pending','paid','refunded','failed'], default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_reference?: string;

  /**
   * External provider's final transaction / capture / mandate identifier.
   * PayPal capture ID, Stripe charge ID, GoCardless payment/mandate ID, etc.
   */
  @Column({ type: 'varchar', length: 512, nullable: true })
  payment_provider_reference?: string;

  /**
   * External provider's intent / order / billing-request identifier,
   * stored before the user completes the payment flow.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_intent_id?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}
