import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto, CreateMenuItemDto, CreateRestaurantDto } from './restaurant.dto';
import { MenuCategory } from '../database/entities/menu-category.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { Restaurant } from '../database/entities/restaurant.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(MenuCategory) private readonly categories: Repository<MenuCategory>,
    @InjectRepository(MenuItem) private readonly items: Repository<MenuItem>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(ownerId: string, dto: CreateRestaurantDto) {
    const owner = await this.users.findOneBy({ id: ownerId });
    if (!owner) throw new NotFoundException('Owner not found');
    const restaurant = this.restaurants.create({ ...dto, owner, ownerId, status: 'PENDING', isOpen: false });
    return this.restaurants.save(restaurant);
  }

  async listApproved() {
    return this.restaurants.find({ where: { status: 'APPROVED' }, order: { createdAt: 'DESC' } });
  }

  async getMenu(id: string) {
    const restaurant = await this.restaurants.findOneBy({ id, status: 'APPROVED' });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return this.categories.find({ where: { restaurantId: id, isActive: true }, relations: { items: true }, order: { displayOrder: 'ASC' } });
  }

  async createCategory(ownerId: string, restaurantId: string, dto: CreateCategoryDto) {
    await this.assertOwner(ownerId, restaurantId);
    return this.categories.save(this.categories.create({ restaurantId, name: dto.name, displayOrder: dto.displayOrder ?? 0, isActive: true }));
  }

  async createItem(ownerId: string, restaurantId: string, dto: CreateMenuItemDto) {
    await this.assertOwner(ownerId, restaurantId);
    const category = await this.categories.findOneBy({ id: dto.categoryId, restaurantId });
    if (!category) throw new NotFoundException('Menu category not found');
    return this.items.save(this.items.create({ restaurantId, categoryId: dto.categoryId, name: dto.name, description: dto.description ?? null, price: dto.price, isVegetarian: dto.isVegetarian ?? false, isAvailable: true }));
  }

  async approve(id: string) {
    const restaurant = await this.restaurants.findOneBy({ id });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    restaurant.status = 'APPROVED';
    return this.restaurants.save(restaurant);
  }

  private async assertOwner(ownerId: string, restaurantId: string) {
    const restaurant = await this.restaurants.findOneBy({ id: restaurantId });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('Restaurant access denied');
    return restaurant;
  }
}
