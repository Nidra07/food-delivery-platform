import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Address } from './address.entity';
import { OrderItem } from './order-item.entity';
import { Restaurant } from './restaurant.entity';
import { User } from './user.entity';

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 40 })
  orderNumber!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer!: User;

  @Column({ name: 'customer_id' })
  customerId!: string;

  @ManyToOne(() => Restaurant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ name: 'restaurant_id' })
  restaurantId!: string;

  @ManyToOne(() => Address, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'delivery_address_id' })
  deliveryAddress!: Address;

  @Column({ name: 'delivery_address_id' })
  deliveryAddressId!: string;

  @Column({ type: 'varchar', length: 30, default: 'PLACED' })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee!: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
