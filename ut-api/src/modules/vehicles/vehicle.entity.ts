import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/auth.entity.js';

@Entity({ name: 'vehicles' })
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar' })
  registration!: string;

  @Column({ type: 'varchar' })
  make!: string;

  @Column({ type: 'varchar' })
  model!: string;

  @Column({ type: 'varchar', nullable: true })
  fuel_type?: string;

  @Column({ type: 'varchar', nullable: true })
  engine_size?: string;

  @Column({ type: 'smallint', nullable: true })
  year?: number;

  @Column({ type: 'varchar', nullable: true })
  colour?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date;
}


