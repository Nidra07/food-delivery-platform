import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OrdersModule } from './orders/orders.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({ type: 'postgres', url: process.env.DATABASE_URL, entities: [User, Role, Permission, Restaurant, MenuCategory, MenuItem, Address, CartItem, Order, OrderItem], synchronize: process.env.NODE_ENV !== 'production', ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false }),
    AuthModule,
    RestaurantsModule,
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
