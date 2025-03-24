import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiResponse<T> {
  final T? data;
  final int statusCode;
  final String? message;
  final bool success;

  ApiResponse({
    this.data,
    required this.statusCode,
    this.message,
    required this.success,
  });

  bool get isSuccess => statusCode >= 200 && statusCode < 300;
}

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: _getBaseUrl(),
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 3),
  ));

  static String _getBaseUrl() {
    // Récupérer l'environnement depuis les variables de compilation
    final environment =
        const String.fromEnvironment('ENVIRONMENT', defaultValue: 'local');

    if (kIsWeb) {
      // Configuration pour le web
      switch (environment) {
        case 'production':
          return dotenv.get('API_URL_PROD',
              fallback: 'https://trinity.atressel.fr/api');
        case 'development':
          return dotenv.get('API_URL_DEV',
              fallback: 'https://trinity.dev.atressel.fr/api');
        case 'local':
        default:
          return dotenv.get('API_URL', fallback: 'http://localhost:4000/api');
      }
    } else {
      // Configuration pour mobile
      switch (environment) {
        case 'production':
          return dotenv.get('MOBILE_API_URL_PROD',
              fallback: 'https://trinity.atressel.fr/api');
        case 'development':
          return dotenv.get('MOBILE_API_URL_DEV',
              fallback: 'https://trinity.dev.atressel.fr/api');
        case 'local':
        default:
          return dotenv.get('MOBILE_API_URL',
              fallback: 'http://10.0.2.2:4000/api');
      }
    }
  }

  // Add this method to set the auth token
  Future<void> _setAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }

  Future<ApiResponse<T>> get<T>(String endpoint,
      {Map<String, dynamic>? queryParameters,
      ResponseType? responseType}) async {
    try {
      await _setAuthToken(); // Add the token before each request
      final response = await _dio.get(endpoint,
          queryParameters: queryParameters,
          options: Options(responseType: responseType));
      return ApiResponse<T>(
        data: response.data,
        statusCode: response.statusCode ?? 500,
        message: response.statusMessage,
        success: response.statusCode != null &&
            response.statusCode! >= 200 &&
            response.statusCode! < 300,
      );
    } on DioException catch (e) {
      return ApiResponse<T>(
        data: null,
        statusCode: e.response?.statusCode ?? 500,
        message: e.message,
        success: false,
      );
    } catch (e) {
      return ApiResponse<T>(
        data: null,
        statusCode: 500,
        message: 'Une erreur est survenue: $e',
        success: false,
      );
    }
  }

  Future<ApiResponse<T>> post<T>(String endpoint,
      {Map<String, dynamic>? data}) async {
    try {
      if (!endpoint.contains("login") && !endpoint.contains("signup")) {
        await _setAuthToken(); // Add the token before each request
      }

      final response = await _dio.post(endpoint, data: data);
      return ApiResponse<T>(
        data: response.data,
        statusCode: response.statusCode ?? 500,
        message: response.statusMessage,
        success: response.statusCode != null &&
            response.statusCode! >= 200 &&
            response.statusCode! < 300,
      );
    } on DioException catch (e) {
      return ApiResponse<T>(
        data: null,
        statusCode: e.response?.statusCode ?? 500,
        message: e.message,
        success: false,
      );
    } catch (e) {
      return ApiResponse<T>(
        data: null,
        statusCode: 500,
        message: 'Une erreur est survenue: $e',
        success: false,
      );
    }
  }

  Future<ApiResponse<T>> put<T>(String endpoint,
      {Map<String, dynamic>? data}) async {
    try {
      await _setAuthToken(); // Add the token before each request
      final response = await _dio.put(endpoint, data: data);
      return ApiResponse<T>(
        data: response.data,
        statusCode: response.statusCode ?? 500,
        message: response.statusMessage,
        success: response.statusCode != null &&
            response.statusCode! >= 200 &&
            response.statusCode! < 300,
      );
    } on DioException catch (e) {
      return ApiResponse<T>(
        data: null,
        statusCode: e.response?.statusCode ?? 500,
        message: e.message,
        success: false,
      );
    } catch (e) {
      return ApiResponse<T>(
        data: null,
        statusCode: 500,
        message: 'Une erreur est survenue: $e',
        success: false,
      );
    }
  }

  Future<ApiResponse<T>> delete<T>(String endpoint,
      {Map<String, dynamic>? data}) async {
    try {
      await _setAuthToken(); // Ajouter le token avant chaque requête
      final response = await _dio.delete(endpoint, data: data);
      return ApiResponse<T>(
        data: response.data,
        statusCode: response.statusCode ?? 500,
        message: response.statusMessage,
        success: response.statusCode != null &&
            response.statusCode! >= 200 &&
            response.statusCode! < 300,
      );
    } on DioException catch (e) {
      return ApiResponse<T>(
        data: null,
        statusCode: e.response?.statusCode ?? 500,
        message: e.message,
        success: false,
      );
    } catch (e) {
      return ApiResponse<T>(
        data: null,
        statusCode: 500,
        message: 'Une erreur est survenue: $e',
        success: false,
      );
    }
  }
}
