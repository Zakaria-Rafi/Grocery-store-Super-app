import 'package:dio/dio.dart';
import 'package:mobile/services/api_service.dart';
import 'package:mobile/models/Cart.dart';

class CouponController {
  final ApiService _apiService = ApiService();

  Future<Cart> applyCoupon(String code) async {
    try {
      final response = await _apiService.post('/cart/apply-coupon', data: {
        'couponCode': code,
      });

      // Vérifier si le coupon existe et a été appliqué avec succès
      if (response.statusCode == 201) {
        return Cart.fromJson(response.data);
      } else {
        throw Exception('Coupon non applicable');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 400) {
        throw Exception(
            e.response?.data['message'] ?? 'Coupon invalide ou inexistant');
      } else if (e.response?.statusCode == 404) {
        throw Exception('Coupon inexistant');
      }
      throw Exception(
          'Une erreur est survenue lors de la vérification du coupon');
    }
  }

  Future<bool> removeCoupon(String code) async {
    try {
      await _apiService.delete('/cart/remove-coupon', data: {
        'couponCode': code,
      });
      return true;
    } on DioException {
      throw Exception('Une erreur est survenue');
    }
  }
}
