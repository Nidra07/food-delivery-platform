import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateAddressDto {
  @IsString() @Length(2, 40) label!: string;
  @IsString() @Length(3, 255) addressLine1!: string;
  @IsString() @Length(2, 100) city!: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class AddCartItemDto {
  @IsUUID() menuItemId!: string;
  @IsNumber() @Min(1) quantity!: number;
}

export class UpdateCartItemDto {
  @IsNumber() @Min(1) quantity!: number;
}

export class CheckoutDto {
  @IsUUID() addressId!: string;
}
