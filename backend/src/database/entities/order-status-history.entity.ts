import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { User } from './user.entity';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'order_id' })
  orderId!: string;

  @Column({ name: 'from_status', type: 'varchar', length: 30, nullable: true })
  fromStatus!: OrderStatus | null;

  @Column({ name: 'to_status', type: 'varchar', length: 30 })
  toStatus!: OrderStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy!: User | null;

  @Column({ name: 'changed_by_id', nullable: true })
  changedById!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
