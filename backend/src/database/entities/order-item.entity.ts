import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'order_id' })
  orderId!: string;

  @ManyToOne(() => MenuItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem!: MenuItem;

  @Column({ name: 'menu_item_id' })
  menuItemId!: string;

  @Column({ name: 'item_name', length: 160 })
  itemName!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 10, scale: 2 })
  lineTotal!: number;
}
