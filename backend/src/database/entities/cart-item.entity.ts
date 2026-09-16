import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Restaurant } from './restaurant.entity';
import { User } from './user.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ name: 'restaurant_id' })
  restaurantId!: string;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem!: MenuItem;

  @Column({ name: 'menu_item_id' })
  menuItemId!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
