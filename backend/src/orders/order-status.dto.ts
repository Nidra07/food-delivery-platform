import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'CANCELLED'])
  status!: 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'CANCELLED';

  @IsOptional()
  @IsString()
  note?: string;
}
