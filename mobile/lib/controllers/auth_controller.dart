import 'package:mobile/services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthController {
  final ApiService _apiService = ApiService();

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _apiService.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.data is Map<String, dynamic> &&
          response.data.containsKey("access_token")) {
        // Récupérer le token du backend
        String token = response.data["access_token"];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', token);

        return {"success": true, "message": "Connexion réussie"};
      } else {
        String errorMessage =
            response.data["message"] ?? "Une erreur est survenue";
        return {"success": false, "message": errorMessage};
      }
    } catch (e) {
      return {"success": false, "message": "Erreur de connexion : $e"};
    }
  }

  Future<bool> signup(
      String firstname, String lastname, String email, String password) async {
    try {
      final response = await _apiService.post('/auth/register', data: {
        'firstName': firstname,
        'lastName': lastname,
        'email': email,
        'password': password,
      });

      if (response.data is Map<String, dynamic>) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw Exception(e);
    }
  }

  Future<void> forgetPassword(String email) async {
    try {
      await _apiService.post('/auth/forgot-password', data: {
        'email': email,
      });
    } catch (e) {
      throw Exception(e);
    }
  }

  Future<Map<String, dynamic>> resetPassword(
      String resetToken, String newPassword) async {
    try {
      final response = await _apiService.post('/auth/reset-password', data: {
        "resetToken": resetToken,
        "newPassword": newPassword,
      });

      if (response.data is Map<String, dynamic> &&
          response.data["success"] == true) {
        return {"success": true};
      } else {
        return {
          "success": false,
          "message": response.data["message"] ?? "Une erreur est survenue"
        };
      }
    } catch (e) {
      return {
        "success": false,
        "message": "Impossible de réinitialiser le mot de passe"
      };
    }
  }

  Future<Map<String, dynamic>?> getUserFromToken() async {
    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('jwt_token');

    if (token != null) {
      try {
        final response = await _apiService.get('/auth/me');

        if (response.data is Map<String, dynamic>) {
          return {
            'firstName': response.data['firstName'],
            'lastName': response.data['lastName'],
            'email': response.data['email'],
          };
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Future<bool> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    return true;
  }

  Future<void> setRememberMe(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('remember_me', value);
  }

  Future<bool> getRememberMe() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('remember_me') ?? false;
  }

  Future<bool> isUserLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('jwt_token');
    return token != null;
  }
}
