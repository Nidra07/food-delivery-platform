import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/access.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateCategoryDto, CreateMenuItemDto, CreateRestaurantDto } from './restaurant.dto';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurants: RestaurantsService) {}

  @Get()
  listApproved() { return this.restaurants.listApproved(); }

  @Get(':id/menu')
  getMenu(@Param('id') id: string) { return this.restaurants.getMenu(id); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateRestaurantDto) { return this.restaurants.create(req.user.sub, dto); }

  @Post(':id/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  createCategory(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() dto: CreateCategoryDto) { return this.restaurants.createCategory(req.user.sub, id, dto); }

  @Post(':id/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER')
  createItem(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() dto: CreateMenuItemDto) { return this.restaurants.createItem(req.user.sub, id, dto); }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  approve(@Param('id') id: string) { return this.restaurants.approve(id); }
}
