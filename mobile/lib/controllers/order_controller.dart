import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile/services/api_service.dart';

class OrderController {
  final ApiService _apiService = ApiService();

  Future<List<dynamic>> loadOrders() async {
    try {
      final response = await _apiService.get('/invoices/user');

      if (response.data is List) {
        return response.data;
      }
      return [];
    } catch (e) {
      throw Exception('Failed to load orders: $e');
    }
  }

  Future<Uint8List> downloadInvoicePdf(int orderId) async {
    try {
      final response = await _apiService.get(
        '/invoices/$orderId/pdf',
        responseType:
            ResponseType.bytes, // Spécifier que nous attendons des bytes
      );

      // Si les données sont déjà un Uint8List
      if (response.data is Uint8List) {
        return response.data;
      }
      // Si les données sont une chaîne de caractères (peu probable avec responseType.bytes)
      else if (response.data is String) {
        // Convertir la chaîne en UTF-8 encoded bytes
        return Uint8List.fromList(utf8.encode(response.data));
      } else {
        throw Exception('Format de données inattendu pour le PDF');
      }
    } catch (e) {
      throw Exception('Failed to download invoice: $e');
    }
  }
}
