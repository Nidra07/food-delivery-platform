import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCategory } from '../database/entities/menu-category.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { Restaurant } from '../database/entities/restaurant.entity';
import { User } from '../database/entities/user.entity';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, MenuCategory, MenuItem, User])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
})
export class RestaurantsModule {}
