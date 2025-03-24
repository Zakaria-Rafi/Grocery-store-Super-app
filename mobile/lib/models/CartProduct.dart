import 'package:mobile/models/Product.dart';

class CartProduct {
  final int id;
  final Product product;
  int quantity;
  final double totalPrice;
  final double? priceBeforeDiscount;
  final double? discountAmount;
  final double? couponDiscountPer;
  final String? appliedCouponCode;

  CartProduct({
    required this.id,
    required this.product,
    required this.quantity,
    required this.totalPrice,
    this.priceBeforeDiscount,
    this.discountAmount,
    this.couponDiscountPer,
    this.appliedCouponCode,
  });

  factory CartProduct.fromJson(Map<String, dynamic> json) {
    return CartProduct(
      id: json['id'],
      product: Product.fromJson(json['product']),
      quantity: json['quantity'],
      totalPrice: double.parse(json['totalPrice'].toString()),
      priceBeforeDiscount: json['priceBeforeDiscount'] != null
          ? double.parse(json['priceBeforeDiscount'].toString())
          : null,
      discountAmount: json['discountAmount'] != null
          ? double.parse(json['discountAmount'].toString())
          : null,
      couponDiscountPer: json['couponDiscountPer'] != null
          ? double.parse(json['couponDiscountPer'].toString())
          : null,
      appliedCouponCode: json['appliedCouponCode'],
    );
  }
}
