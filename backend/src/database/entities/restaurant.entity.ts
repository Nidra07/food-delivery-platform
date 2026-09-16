import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { MenuCategory } from './menu-category.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ name: 'owner_id' })
  ownerId!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'phone', length: 30, nullable: true })
  phone!: string | null;

  @Column({ name: 'address_line1', length: 255 })
  addressLine1!: string;

  @Column({ length: 100 })
  city!: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

  @Column({ name: 'is_open', default: false })
  isOpen!: boolean;

  @OneToMany(() => MenuCategory, (category) => category.restaurant)
  categories!: MenuCategory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
