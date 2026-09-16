import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAssignment } from '../database/entities/delivery-assignment.entity';
import { DeliveryPartner } from '../database/entities/delivery-partner.entity';
import { Order } from '../database/entities/order.entity';
import { DeliveryPartner as PartnerEntity } from '../database/entities/delivery-partner.entity';
import { RejectAssignmentDto, UpdateAvailabilityDto, UpdateDeliveryStatusDto, UpdateLocationDto } from './delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryPartner) private readonly partners: Repository<DeliveryPartner>,
    @InjectRepository(DeliveryAssignment) private readonly assignments: Repository<DeliveryAssignment>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async getProfile(userId: string) {
    const partner = await this.partners.findOne({ where: { userId }, relations: { user: true } });
    if (!partner) throw new NotFoundException('Delivery partner profile not found');
    return partner;
  }

  async createProfile(userId: string, phone?: string, vehicleType?: string, vehicleNumber?: string) {
    const existing = await this.partners.findOneBy({ userId });
    if (existing) throw new ConflictException('Delivery partner profile already exists');
    return this.partners.save(this.partners.create({ userId, phone: phone ?? null, vehicleType: vehicleType ?? null, vehicleNumber: vehicleNumber ?? null, availability: 'OFFLINE', verificationStatus: 'PENDING' }));
  }

  async setAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const partner = await this.getProfile(userId);
    if (partner.verificationStatus !== 'APPROVED') throw new ForbiddenException('Partner is not approved');
    partner.availability = dto.availability;
    if (dto.availability === 'OFFLINE') partner.availability = 'OFFLINE';
    return this.partners.save(partner);
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const partner = await this.getProfile(userId);
    partner.latitude = dto.latitude;
    partner.longitude = dto.longitude;
    partner.lastLocationAt = new Date();
    return this.partners.save(partner);
  }

  listRequests(userId: string) {
    return this.assignments.find({ where: { deliveryPartner: { userId }, status: 'OFFERED' }, relations: { order: true }, order: { offeredAt: 'ASC' } });
  }

  async accept(userId: string, assignmentId: string) {
    const partner = await this.getProfile(userId);
    if (partner.verificationStatus !== 'APPROVED' || partner.availability !== 'ONLINE') throw new ForbiddenException('Partner must be approved and online');
    const assignment = await this.assignments.findOne({ where: { id: assignmentId }, relations: { order: true, deliveryPartner: true } });
    if (!assignment || assignment.deliveryPartnerId !== partner.id) throw new NotFoundException('Delivery request not found');
    if (assignment.status !== 'OFFERED' || assignment.order.status !== 'READY_FOR_PICKUP') throw new ConflictException('Delivery request is no longer available');
    const result = await this.orders.createQueryBuilder().update(Order).set({ status: 'ASSIGNED' }).where('id = :id AND status = :status', { id: assignment.orderId, status: 'READY_FOR_PICKUP' }).execute();
    if (result.affected !== 1) throw new ConflictException('Order was assigned by another partner');
    assignment.status = 'ACCEPTED';
    assignment.acceptedAt = new Date();
    partner.availability = 'BUSY';
    await this.assignments.save(assignment);
    await this.partners.save(partner);
    return assignment;
  }

  async reject(userId: string, assignmentId: string, dto: RejectAssignmentDto) {
    const partner = await this.getProfile(userId);
    const assignment = await this.assignments.findOneBy({ id: assignmentId, deliveryPartnerId: partner.id });
    if (!assignment || assignment.status !== 'OFFERED') throw new NotFoundException('Delivery request not found');
    assignment.status = 'REJECTED';
    assignment.rejectionReason = dto.reason ?? null;
    return this.assignments.save(assignment);
  }

  async updateStatus(userId: string, assignmentId: string, dto: UpdateDeliveryStatusDto) {
    const partner = await this.getProfile(userId);
    const assignment = await this.assignments.findOne({ where: { id: assignmentId, deliveryPartnerId: partner.id }, relations: { order: true } });
    if (!assignment || assignment.status !== 'ACCEPTED') throw new NotFoundException('Active delivery not found');
    const allowed: Record<string, string[]> = { PICKED_UP: ['ASSIGNED'], OUT_FOR_DELIVERY: ['PICKED_UP'], DELIVERED: ['OUT_FOR_DELIVERY'] };
    if (!allowed[dto.status]?.includes(assignment.order.status)) throw new BadRequestException(`Cannot change order from ${assignment.order.status} to ${dto.status}`);
    assignment.order.status = dto.status;
    await this.orders.save(assignment.order);
    if (dto.status === 'DELIVERED') { assignment.status = 'COMPLETED'; assignment.completedAt = new Date(); partner.availability = 'ONLINE'; await this.assignments.save(assignment); await this.partners.save(partner); }
    return assignment.order;
  }
}
