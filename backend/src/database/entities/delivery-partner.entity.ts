import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('delivery_partners')
export class DeliveryPartner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', unique: true })
  userId!: string;

  @Column({ length: 30, nullable: true })
  phone!: string | null;

  @Column({ length: 30, nullable: true })
  vehicleType!: string | null;

  @Column({ length: 40, nullable: true })
  vehicleNumber!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'OFFLINE' })
  availability!: 'ONLINE' | 'OFFLINE' | 'BUSY';

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  verificationStatus!: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ name: 'last_location_at', type: 'timestamp', nullable: true })
  lastLocationAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
