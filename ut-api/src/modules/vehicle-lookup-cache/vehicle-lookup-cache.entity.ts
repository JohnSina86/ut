import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'vehicle_lookup_cache' })
@Index(['registration'], { unique: true })
export class VehicleLookupCache {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  registration!: string;

  @Column({ type: "varchar" })
  make!: string;

  @Column({ type: "varchar" })
  model!: string;

  @Column({ type: "varchar", nullable: true })
  fuel_type?: string;

  @Column({ type: "varchar", nullable: true })
  engine_size?: string;

  @Column({ type: 'smallint', nullable: true })
  year?: number;

  @Column({ type: "varchar", nullable: true })
  colour?: string;

  @CreateDateColumn({ type: 'datetime' })
  looked_up_at!: Date;
}


