import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddCartItemDto, CheckoutDto, CreateAddressDto, UpdateCartItemDto } from './order.dto';
import { OrdersService } from './orders.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  private user(req: { user: { sub: string } }) { return req.user.sub; }

  @Get('customers/me/addresses') listAddresses(@Req() req: { user: { sub: string } }) { return this.orders.listAddresses(this.user(req)); }
  @Post('customers/me/addresses') addAddress(@Req() req: { user: { sub: string } }, @Body() dto: CreateAddressDto) { return this.orders.addAddress(this.user(req), dto); }
  @Get('cart') getCart(@Req() req: { user: { sub: string } }) { return this.orders.getCart(this.user(req)); }
  @Post('cart/items') addToCart(@Req() req: { user: { sub: string } }, @Body() dto: AddCartItemDto) { return this.orders.addToCart(this.user(req), dto); }
  @Put('cart/items/:id') updateCart(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() dto: UpdateCartItemDto) { return this.orders.updateCartItem(this.user(req), id, dto); }
  @Delete('cart/items/:id') removeCart(@Req() req: { user: { sub: string } }, @Param('id') id: string) { return this.orders.removeCartItem(this.user(req), id); }
  @Post('orders/checkout') checkout(@Req() req: { user: { sub: string } }, @Body() dto: CheckoutDto) { return this.orders.checkout(this.user(req), dto); }
  @Get('orders') listOrders(@Req() req: { user: { sub: string } }) { return this.orders.listOrders(this.user(req)); }
}
