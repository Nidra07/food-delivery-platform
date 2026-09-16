import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/access.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { DeliveryService } from './delivery.service';
import { RejectAssignmentDto, UpdateAvailabilityDto, UpdateDeliveryStatusDto, UpdateLocationDto } from './delivery.dto';

@Controller('delivery-partners/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DELIVERY_PARTNER')
export class DeliveryController {
  constructor(private readonly delivery: DeliveryService) {}
  private id(req: { user: { sub: string } }) { return req.user.sub; }

  @Get() profile(@Req() req: { user: { sub: string } }) { return this.delivery.getProfile(this.id(req)); }
  @Post() createProfile(@Req() req: { user: { sub: string } }, @Body() body: { phone?: string; vehicleType?: string; vehicleNumber?: string }) { return this.delivery.createProfile(this.id(req), body.phone, body.vehicleType, body.vehicleNumber); }
  @Patch('availability') availability(@Req() req: { user: { sub: string } }, @Body() dto: UpdateAvailabilityDto) { return this.delivery.setAvailability(this.id(req), dto); }
  @Patch('location') location(@Req() req: { user: { sub: string } }, @Body() dto: UpdateLocationDto) { return this.delivery.updateLocation(this.id(req), dto); }
  @Get('requests') requests(@Req() req: { user: { sub: string } }) { return this.delivery.listRequests(this.id(req)); }
  @Post('requests/:id/accept') accept(@Req() req: { user: { sub: string } }, @Param('id') id: string) { return this.delivery.accept(this.id(req), id); }
  @Post('requests/:id/reject') reject(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() dto: RejectAssignmentDto) { return this.delivery.reject(this.id(req), id, dto); }
  @Patch('deliveries/:id/status') status(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() dto: UpdateDeliveryStatusDto) { return this.delivery.updateStatus(this.id(req), id, dto); }
}
