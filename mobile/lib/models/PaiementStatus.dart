enum PaymentStatus { success, failure, pending }

class PaymentResult {
  final PaymentStatus status;
  final String message;

  PaymentResult({required this.status, required this.message});
}
