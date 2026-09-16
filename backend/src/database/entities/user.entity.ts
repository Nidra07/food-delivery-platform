import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, nullable: true })
  phone!: string | null;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'first_name', nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', nullable: true })
  lastName!: string | null;

  @Column({ default: 'ACTIVE' })
  status!: 'ACTIVE' | 'SUSPENDED' | 'DELETED';

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles!: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
