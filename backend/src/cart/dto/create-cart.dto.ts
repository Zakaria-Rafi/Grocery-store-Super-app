import { IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
