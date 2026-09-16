import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DeliveryModule } from './delivery/delivery.module';
import { HealthController } from './health/health.controller';
import { OrdersModule } from './orders/orders.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Permission } from './database/entities/permission.entity';
import { Role } from './database/entities/role.entity';
import { User } from './database/entities/user.entity';
import { Restaurant } from './database/entities/restaurant.entity';
import { MenuCategory } from './database/entities/menu-category.entity';
import { MenuItem } from './database/entities/menu-item.entity';
import { Address } from './database/entities/address.entity';
import { CartItem } from './database/entities/cart-item.entity';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { OrderStatusHistory } from './database/entities/order-status-history.entity';
import { DeliveryPartner } from './database/entities/delivery-partner.entity';
import { DeliveryAssignment } from './database/entities/delivery-assignment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({ type: 'postgres', url: process.env.DATABASE_URL, entities: [User, Role, Permission, Restaurant, MenuCategory, MenuItem, Address, CartItem, Order, OrderItem, OrderStatusHistory, DeliveryPartner, DeliveryAssignment], synchronize: process.env.NODE_ENV !== 'production', ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false }),
    AuthModule,
    RestaurantsModule,
    OrdersModule,
    DeliveryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
