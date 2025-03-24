import { Exclude, Expose, Type } from 'class-transformer';
import { CategoryDto } from '../../categories/dto/category.dto';

@Exclude()
export class ProductDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() price: number;
  @Expose() stock: number;
  @Expose() barcode: string;
  @Expose() brand: string;
  @Expose() ingredients: string;
  @Expose() allergens: string;
  @Expose() nutritionalValues: string;
  @Expose() imagesUrl: string[];
  @Type(() => CategoryDto)
  @Expose()
  categories: CategoryDto[];
  @Expose() weight: number;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}

@Exclude()
export class CartItemDto {
  @Expose() id: number;
  @Expose() quantity: number;
  @Expose() totalPrice: number;
  @Expose() priceBeforeDiscount: number;
  @Expose() discountAmount: number;
  @Expose() appliedCouponCode: string;
  @Expose() couponDiscountPer: number;

  @Type(() => ProductDto)
  @Expose()
  product: ProductDto;
}

@Exclude()
export class CouponDTO {
  @Expose() code: string;
  @Expose() discountType: string;
  @Expose() discountValue: string;
}
@Exclude()
export class CartDto {
  @Expose() id: number;
  @Expose() totalPrice: number;
  @Expose() status: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Type(() => CartItemDto)
  @Expose()
  items: CartItemDto[];
  @Type(() => CouponDTO)
  @Expose()
  coupon: CouponDTO;
}
