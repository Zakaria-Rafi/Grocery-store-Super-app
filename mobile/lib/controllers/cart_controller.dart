import 'package:mobile/models/Cart.dart';
import 'package:mobile/services/api_service.dart';

enum PaymentMethod {
  paypal,
  stripe,
}

class CheckoutResponse {
  final String? checkoutUrl;
  final String? approvalUrl;

  CheckoutResponse({required this.checkoutUrl, required this.approvalUrl});

  factory CheckoutResponse.fromJson(Map<String, dynamic> json) {
    return CheckoutResponse(
        checkoutUrl: json['checkoutUrl'], approvalUrl: json['approvalUrl']);
  }
}

class CartController {
  final ApiService _apiService = ApiService();

  Future<Cart?> getCartOfUser() async {
    try {
      final response = await _apiService.get('/cart');
      return Cart.fromJson(response.data);
    } catch (e) {
      throw Exception(e);
    }
  }

  Future<Cart?> addItemToCart(int productId, int quantity) async {
    final response = await _apiService.post('/cart/add', data: {
      "items": [
        {"productId": productId, "quantity": quantity}
      ]
    });
    return Cart.fromJson(response.data);
  }

  Future<Cart?> updateItemQuantity(int productId, int quantity) async {
    final response = await _apiService.put('/cart/update', data: {
      "items": [
        {"productId": productId, "quantity": quantity}
      ]
    });
    return Cart.fromJson(response.data);
  }

  Future<Cart?> removeItemFromCart(int productId) async {
    final response = await _apiService.delete('/cart/remove/$productId',);
    return Cart.fromJson(response.data);
  }

  Future<Cart?> clearCart() async {
    final response = await _apiService.delete('/cart/clear',);
    return Cart.fromJson(response.data);
  }

  Future<Cart?> applyCouponToCart(String couponCode) async {
    final response = await _apiService
        .post('/cart/apply-coupon', data: {"couponCode": couponCode});
    return Cart.fromJson(response.data);
  }

  Future<Cart?> removeCoupon() async {
    final response = await _apiService.delete('/cart/remove-coupon',);
    return Cart.fromJson(response.data);
  }

  Future<CheckoutResponse?> checkout(PaymentMethod paymentMethod) async {
    final response = await _apiService.post('/cart/checkout',
        data: {"paymentMethod": paymentMethod.name, "app": "mobile"});
    return CheckoutResponse.fromJson(response.data);
  }
}
