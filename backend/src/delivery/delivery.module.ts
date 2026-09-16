import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAssignment } from '../database/entities/delivery-assignment.entity';
import { DeliveryPartner } from '../database/entities/delivery-partner.entity';
import { Order } from '../database/entities/order.entity';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAssignment, DeliveryPartner, Order])],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
