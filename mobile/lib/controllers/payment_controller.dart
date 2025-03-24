import 'package:flutter/material.dart';
import 'package:mobile/models/PaiementStatus.dart';
import 'package:mobile/services/api_service.dart';

class PaymentController extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  PaymentResult? _paymentResult;

  PaymentResult? get paymentResult => _paymentResult;

  void checkPaymentStatus(String paymentId, String payerId, String type) async {
    // Indiquer que le paiement est en cours de traitement
    _paymentResult = PaymentResult(
      status: PaymentStatus.pending,
      message: "Traitement du paiement en cours...",
    );
    notifyListeners();

    if (type == 'stripe') {
      try {
        // Mettre à jour le message pour Stripe spécifiquement
        _paymentResult = PaymentResult(
          status: PaymentStatus.pending,
          message: "Vérification du paiement Stripe en cours...",
        );
        notifyListeners();

        final response = await _apiService
            .post('/cart/captureStripe', data: {"orderId": paymentId});

        // Vérifier si la réponse est un succès (basé sur la réponse de l'API)
        if (response.statusCode == 201) {
          _paymentResult = PaymentResult(
            status: PaymentStatus.success,
            message: "Votre paiement a été accepté !",
          );
        } else {
          _paymentResult = PaymentResult(
            status: PaymentStatus.failure,
            message: "Le paiement a échoué. Veuillez réessayer.",
          );
        }
        notifyListeners();
      } catch (e) {
        _paymentResult = PaymentResult(
          status: PaymentStatus.failure,
          message: "Une erreur est survenue. Veuillez réessayer.",
        );
        notifyListeners();
      }
    } else if (type == 'paypal') {
      try {
        // Indiquer que nous attendons spécifiquement la réponse PayPal
        _paymentResult = PaymentResult(
          status: PaymentStatus.pending,
          message: "Vérification du paiement PayPal en cours...",
        );
        notifyListeners();

        final response = await _apiService
            .post('/cart/capturePaypal', data: {"orderId": paymentId});

        // Attendre un court délai pour s'assurer que la transaction est bien traitée
        await Future.delayed(Duration(seconds: 2));

        if (response.statusCode == 201) {
          _paymentResult = PaymentResult(
            status: PaymentStatus.success,
            message: "Votre paiement a été accepté !",
          );
        } else {
          _paymentResult = PaymentResult(
            status: PaymentStatus.failure,
            message: "Le paiement a échoué. Veuillez réessayer.",
          );
        }
        notifyListeners();
      } catch (e) {
        _paymentResult = PaymentResult(
          status: PaymentStatus.failure,
          message: "Une erreur est survenue. Veuillez réessayer.",
        );
        notifyListeners();
      }
    } else {
      _paymentResult = PaymentResult(
        status: PaymentStatus.failure,
        message: "Type de paiement non pris en charge: $type",
      );
      notifyListeners();
    }
  }
}
