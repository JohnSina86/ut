import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity.js';

@Entity({ name: 'vehicle_specs' })
@Index(['make','model','year','engine_size'], { unique: true })
export class VehicleSpec {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  vehicle_id!: number;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Vehicle;

  @Column({ type: "varchar" })
  make!: string;

  @Column({ type: "varchar" })
  model!: string;

  @Column({ type: 'smallint', nullable: true })
  year?: number;

  @Column({ type: "varchar", nullable: true })
  engine_size?: string;

  @Column({ type: "varchar", nullable: true })
  tyre_size_front?: string;

  @Column({ type: "varchar", nullable: true })
  tyre_size_rear?: string;

  @Column({ type: "varchar", nullable: true })
  oil_type?: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  oil_capacity_litres?: number;

  @Column({ type: "varchar", nullable: true })
  brake_pad_type?: string;

  @Column({ type: "varchar", nullable: true })
  battery_specs?: string;

  @Column({ type: "varchar", nullable: true })
  spark_plug_type?: string;

  @Column({ type: 'json', nullable: true })
  other_specs?: any;

  @Column({ type: 'datetime', nullable: true })
  last_fetched_at?: Date;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}



