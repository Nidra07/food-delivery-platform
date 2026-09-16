import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/access.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateOrderStatusDto } from './order-status.dto';
import { OrderStatusService } from './order-status.service';

@Controller()
export class OrderStatusController {
  constructor(private readonly statuses: OrderStatusService) {}

  @Get('orders/:id/status-history')
  @UseGuards(JwtAuthGuard)
  history(@Param('id') id: string) { return this.statuses.getHistory(id); }

  @Get('restaurants/:restaurantId/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER', 'RESTAURANT_STAFF')
  restaurantOrders(@Req() req: { user: { sub: string } }, @Param('restaurantId') restaurantId: string) { return this.statuses.listForRestaurant(req.user.sub, restaurantId); }

  @Patch('restaurants/orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESTAURANT_OWNER', 'RESTAURANT_STAFF')
  update(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) { return this.statuses.updateByRestaurant(req.user.sub, id, dto.status, dto.note); }
}
