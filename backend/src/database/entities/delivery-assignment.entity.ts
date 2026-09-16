import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DeliveryPartner } from './delivery-partner.entity';
import { Order } from './order.entity';

export type AssignmentStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

@Entity('delivery_assignments')
export class DeliveryAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'order_id', unique: true })
  orderId!: string;

  @ManyToOne(() => DeliveryPartner, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'delivery_partner_id' })
  deliveryPartner!: DeliveryPartner;

  @Column({ name: 'delivery_partner_id' })
  deliveryPartnerId!: string;

  @Column({ type: 'varchar', length: 20, default: 'OFFERED' })
  status!: AssignmentStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null;

  @CreateDateColumn({ name: 'offered_at' })
  offeredAt!: Date;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt!: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
