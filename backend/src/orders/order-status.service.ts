import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../database/entities/order.entity';
import { OrderStatusHistory } from '../database/entities/order-status-history.entity';
import { Restaurant } from '../database/entities/restaurant.entity';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
};

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderStatusHistory) private readonly history: Repository<OrderStatusHistory>,
    @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>,
  ) {}

  async listForRestaurant(ownerId: string, restaurantId: string) {
    await this.assertRestaurantOwner(ownerId, restaurantId);
    return this.orders.find({ where: { restaurantId }, relations: { items: true, customer: true, deliveryAddress: true }, order: { createdAt: 'DESC' } });
  }

  async getHistory(orderId: string) {
    const order = await this.orders.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('Order not found');
    return this.history.find({ where: { orderId }, order: { createdAt: 'ASC' } });
  }

  async updateByRestaurant(ownerId: string, orderId: string, status: OrderStatus, note?: string) {
    const order = await this.orders.findOne({ where: { id: orderId }, relations: { restaurant: true } });
    if (!order) throw new NotFoundException('Order not found');
    await this.assertRestaurantOwner(ownerId, order.restaurantId);
    if (!transitions[order.status].includes(status)) {
      throw new BadRequestException(`Cannot change order from ${order.status} to ${status}`);
    }
    const previous = order.status;
    order.status = status;
    await this.orders.save(order);
    await this.history.save(this.history.create({ orderId, fromStatus: previous, toStatus: status, changedById: ownerId, note: note ?? null }));
    return this.orders.findOne({ where: { id: orderId }, relations: { items: true, restaurant: true, customer: true, deliveryAddress: true } });
  }

  private async assertRestaurantOwner(ownerId: string, restaurantId: string) {
    const restaurant = await this.restaurants.findOneBy({ id: restaurantId });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('Restaurant access denied');
    return restaurant;
  }
}
