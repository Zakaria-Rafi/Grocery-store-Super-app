import { Product } from "./cart-model";

export class CartItem {
  id: number;
  quantity: number;
  totalPrice: string;
  priceBeforeDiscount: string | null;
  discountAmount: string | null;
  appliedCouponCode: string | null;
  couponDiscountPer: string | null;
  product: Product;

  constructor(
    id: number,
    quantity: number,
    totalPrice: string,
    product: Product,
    priceBeforeDiscount: string | null = null,
    discountAmount: string | null = null,
    appliedCouponCode: string | null = null,
    couponDiscountPer: string | null = null,
  ) {
    this.id = id;
    this.quantity = quantity;
    this.totalPrice = totalPrice;
    this.product = product;
    this.priceBeforeDiscount = priceBeforeDiscount;
    this.discountAmount = discountAmount;
    this.appliedCouponCode = appliedCouponCode;
    this.couponDiscountPer = couponDiscountPer;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  static fromJson(json: any): CartItem {
    return new CartItem(
      json.id,
      json.quantity,
      json.totalPrice,
      Product.fromJson(json.product),
      json.priceBeforeDiscount,
      json.discountAmount,
      json.appliedCouponCode,
      json.couponDiscountPer,
    );
  }
}
