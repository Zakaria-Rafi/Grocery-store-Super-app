import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/services/api_service.dart';
import 'package:nb_utils/nb_utils.dart';

class AuthMiddleware {
  static Future<bool> isAuthenticated(BuildContext context) async {
    ApiService apiService = ApiService();
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');

    if (token == null) {
      return false;
    }

    // Vérifier si le token est expiré
    try {
      final decodedToken = JwtDecoder.decode(token);

      if (decodedToken?['exp'] < DateTime.now().millisecondsSinceEpoch / 1000) {
        await prefs.remove('jwt_token');
        return false;
      }

      if (await apiService.get('/auth/me').then((value) => !value.isSuccess)) {
        await prefs.remove('jwt_token');
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  static Future<void> checkAuth(BuildContext context) async {
    if (!await isAuthenticated(context)) {
      toast(
        'Un problème est survenu lors de la récupération de vos informations',
        bgColor: Colors.red,
        textColor: Colors.white,
      );
      // ignore: use_build_context_synchronously
      context.go("/login");
    }
  }
}
