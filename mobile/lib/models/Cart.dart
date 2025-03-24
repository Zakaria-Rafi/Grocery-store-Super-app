import 'package:mobile/models/CartProduct.dart';

class Cart {
  final int id;
  final List<CartProduct>? products;
  final double totalPrice;
  final String? couponCode;
  final double? totalBeforeDiscount;

  Cart({
    required this.id,
    this.products,
    required this.totalPrice,
    this.couponCode,
    this.totalBeforeDiscount,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: json['id'],
      products: json['items'] != null
          ? List<CartProduct>.from(
              json['items'].map((item) => CartProduct.fromJson(item)))
          : null,
      totalPrice: double.parse(json['totalPrice'].toString()),
      couponCode: json['coupon']?['code'],
      totalBeforeDiscount: json['totalBeforeDiscount'] != null
          ? double.parse(json['totalBeforeDiscount'].toString())
          : null,
    );
  }
}
