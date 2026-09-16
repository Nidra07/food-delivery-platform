import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Address } from '../database/entities/address.entity';
import { CartItem } from '../database/entities/cart-item.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { Restaurant } from '../database/entities/restaurant.entity';
import { CreateAddressDto, AddCartItemDto, CheckoutDto, UpdateCartItemDto } from './order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Address) private readonly addresses: Repository<Address>,
    @InjectRepository(CartItem) private readonly cart: Repository<CartItem>,
    @InjectRepository(MenuItem) private readonly menuItems: Repository<MenuItem>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  listAddresses(userId: string) { return this.addresses.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } }); }

  async addAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) await this.addresses.update({ userId }, { isDefault: false });
    return this.addresses.save(this.addresses.create({ ...dto, userId, isDefault: dto.isDefault ?? false, postalCode: dto.postalCode ?? null, latitude: dto.latitude ?? null, longitude: dto.longitude ?? null }));
  }

  async getCart(userId: string) { return this.cart.find({ where: { userId }, relations: { menuItem: true, restaurant: true }, order: { updatedAt: 'DESC' } }); }

  async addToCart(userId: string, dto: AddCartItemDto) {
    const item = await this.menuItems.findOne({ where: { id: dto.menuItemId }, relations: { restaurant: true } });
    if (!item || !item.isAvailable || item.restaurant.status !== 'APPROVED') throw new BadRequestException('Menu item is unavailable');
    const existing = await this.cart.findOne({ where: { userId, menuItemId: item.id } });
    if (existing) { existing.quantity += dto.quantity; existing.unitPrice = Number(item.price); return this.cart.save(existing); }
    return this.cart.save(this.cart.create({ userId, menuItemId: item.id, restaurantId: item.restaurantId, quantity: dto.quantity, unitPrice: Number(item.price) }));
  }

  async updateCartItem(userId: string, id: string, dto: UpdateCartItemDto) {
    const item = await this.cart.findOneBy({ id, userId });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    return this.cart.save(item);
  }

  async removeCartItem(userId: string, id: string) {
    const item = await this.cart.findOneBy({ id, userId });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cart.remove(item);
    return { deleted: true };
  }

  async checkout(userId: string, dto: CheckoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const address = await queryRunner.manager.findOneBy(Address, { id: dto.addressId, userId });
      if (!address) throw new NotFoundException('Delivery address not found');
      const items = await queryRunner.manager.find(CartItem, { where: { userId }, relations: { menuItem: true, restaurant: true } });
      if (!items.length) throw new BadRequestException('Cart is empty');
      const restaurantIds = new Set(items.map((item) => item.restaurantId));
      if (restaurantIds.size !== 1) throw new BadRequestException('Cart must contain items from one restaurant');
      if (items.some((item) => !item.menuItem.isAvailable || item.restaurant.status !== 'APPROVED')) throw new BadRequestException('Cart contains unavailable items');
      const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
      const deliveryFee = Number(process.env.DELIVERY_FEE_BASE ?? 0);
      const taxAmount = Number((subtotal * Number(process.env.DEFAULT_TAX_RATE ?? 0) / 100).toFixed(2));
      const totalAmount = Number((subtotal + deliveryFee + taxAmount).toFixed(2));
      const order = queryRunner.manager.create(Order, { orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, customerId: userId, restaurantId: items[0].restaurantId, deliveryAddressId: address.id, status: 'PLACED', subtotal, deliveryFee, taxAmount, totalAmount });
      const saved = await queryRunner.manager.save(order);
      await queryRunner.manager.save(OrderItem, items.map((item) => queryRunner.manager.create(OrderItem, { orderId: saved.id, menuItemId: item.menuItemId, itemName: item.menuItem.name, quantity: item.quantity, unitPrice: Number(item.unitPrice), lineTotal: Number(item.unitPrice) * item.quantity })));
      await queryRunner.manager.delete(CartItem, { userId });
      await queryRunner.commitTransaction();
      return this.orders.findOne({ where: { id: saved.id }, relations: { items: true, restaurant: true, deliveryAddress: true } });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally { await queryRunner.release(); }
  }

  listOrders(userId: string) { return this.orders.find({ where: { customerId: userId }, relations: { items: true, restaurant: true }, order: { createdAt: 'DESC' } }); }
}
