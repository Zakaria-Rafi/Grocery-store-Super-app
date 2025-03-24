import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  discountAmount: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  userUsageLimit?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  productIds?: number[]; // List of product IDs to apply the coupon to
}
