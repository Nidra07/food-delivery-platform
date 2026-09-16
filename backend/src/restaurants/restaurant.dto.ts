import { IsNumber, IsOptional, IsString, IsUrl, Length, Max, Min } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @Length(2, 160)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @Length(3, 255)
  addressLine1!: string;

  @IsString()
  @Length(2, 100)
  city!: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class CreateCategoryDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class CreateMenuItemDto {
  @IsString()
  categoryId!: string;

  @IsString()
  @Length(1, 160)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0.01)
  price!: number;

  @IsOptional()
  isVegetarian?: boolean;
}
