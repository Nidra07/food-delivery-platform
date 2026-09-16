import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from '../database/entities/address.entity';
import { CartItem } from '../database/entities/cart-item.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { OrderStatusHistory } from '../database/entities/order-status-history.entity';
import { Restaurant } from '../database/entities/restaurant.entity';
import { OrdersController } from './orders.controller';
import { OrderStatusController } from './order-status.controller';
import { OrdersService } from './orders.service';
import { OrderStatusService } from './order-status.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address, CartItem, MenuItem, Order, OrderItem, OrderStatusHistory, Restaurant])],
  controllers: [OrdersController, OrderStatusController],
  providers: [OrdersService, OrderStatusService],
})
export class OrdersModule {}
