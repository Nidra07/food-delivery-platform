import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { MenuItem } from './menu-item.entity';

@Entity('menu_categories')
export class MenuCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ name: 'restaurant_id' })
  restaurantId!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => MenuItem, (item) => item.category)
  items!: MenuItem[];
}
