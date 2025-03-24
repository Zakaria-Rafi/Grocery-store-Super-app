// backend/src/cart/dto/update-cart.dto.ts
import { IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateCartItemDto {
  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class UpdateCartDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  items?: UpdateCartItemDto[];
}