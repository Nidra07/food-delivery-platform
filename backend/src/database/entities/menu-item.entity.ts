import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MenuCategory } from './menu-category.entity';
import { Restaurant } from './restaurant.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ name: 'restaurant_id' })
  restaurantId!: string;

  @ManyToOne(() => MenuCategory, (category) => category.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: MenuCategory;

  @Column({ name: 'category_id' })
  categoryId!: string;

  @Column({ length: 160 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'is_vegetarian', default: false })
  isVegetarian!: boolean;

  @Column({ name: 'is_available', default: true })
  isAvailable!: boolean;
}
