import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from '../database/entities/address.entity';
import { CartItem } from '../database/entities/cart-item.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { Restaurant } from '../database/entities/restaurant.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address, CartItem, MenuItem, Order, OrderItem, Restaurant])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
