import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsIn(['ONLINE', 'OFFLINE'])
  availability!: 'ONLINE' | 'OFFLINE';
}

export class UpdateLocationDto {
  @IsNumber() @Min(-90) @Max(90) latitude!: number;
  @IsNumber() @Min(-180) @Max(180) longitude!: number;
}

export class RejectAssignmentDto {
  @IsOptional() @IsString() reason?: string;
}

export class UpdateDeliveryStatusDto {
  @IsIn(['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'])
  status!: 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
}
