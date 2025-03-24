// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/controllers/cart_controller.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PaymentMethodDialog extends StatelessWidget {
  final Function() onStripePayment;
  final Function() onPayPalPayment;
  final BuildContext context;
  final String paymentId;
  final String payerId;

  PaymentMethodDialog({
    required this.onStripePayment,
    required this.onPayPalPayment,
    required this.context,
    this.paymentId = '',
    this.payerId = '',
    super.key,
  });

  final CartController cartController = CartController();

  void _handleStripePayment() async {
    try {
      // Récupérer le checkout avant de fermer le dialogue
      final checkout = await cartController.checkout(PaymentMethod.stripe);

      if (checkout?.checkoutUrl == null || checkout!.checkoutUrl == '') {
        return;
      }

      // Utiliser le BuildContext.mounted pour vérifier si le widget est toujours monté
      if (!context.mounted) return;

      // Fermer le dialogue après avoir obtenu l'URL
      Navigator.of(context).pop();

      // Ouvrir la WebView
      if (context.mounted) {
        await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => PaymentWebView(
              url: checkout.checkoutUrl ?? '',
              onSuccess: (String paymentId, String payerId, String type) {
                context.go(
                    '/payment-status?paymentId=$paymentId&payerId=$payerId&type=$type');
              },
              onError: () {
                Navigator.of(context).pop();
              },
            ),
          ),
        );
      }
    } catch (e) {
      Navigator.of(context).pop();
    }
  }

  void _handlePayPalPayment() async {
    try {
      final checkout = await cartController.checkout(PaymentMethod.paypal);

      if (checkout?.approvalUrl == null || checkout!.approvalUrl == '') {
        return;
      }

      // Utiliser le BuildContext.mounted pour vérifier si le widget est toujours monté
      if (!context.mounted) return;

      Navigator.of(context).pop();

      if (context.mounted) {
        await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => PaymentWebView(
              url: checkout.approvalUrl ?? '',
              onSuccess: (String paymentId, String payerId, String type) {
                context.go(
                    '/payment-status?paymentId=$paymentId&payerId=$payerId&type=$type');
              },
              onError: () {
                Navigator.of(context).pop();
              },
            ),
          ),
        );
      }
    } catch (e) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Choisissez votre méthode de paiement',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.credit_card),
              title: const Text('Payer avec Stripe'),
              onTap: _handleStripePayment,
            ),
            ListTile(
              leading: const Icon(Icons.payment),
              title: const Text('Payer avec PayPal'),
              onTap: _handlePayPalPayment,
            ),
          ],
        ),
      ),
    );
  }
}

class PaymentWebView extends StatefulWidget {
  final String url;
  final Function(String paymentId, String payerId, String type) onSuccess;
  final VoidCallback onError;

  const PaymentWebView({
    super.key,
    required this.url,
    required this.onSuccess,
    required this.onError,
  });

  @override
  State<PaymentWebView> createState() => PaymentWebViewState();
}

class PaymentWebViewState extends State<PaymentWebView> {
  late final WebViewController controller;
  bool isLoading = true;
  bool _hasCompleted = false; // Pour éviter les appels multiples

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..enableZoom(false)
      ..setNavigationDelegate(
        NavigationDelegate(
          onUrlChange: (UrlChange change) {
            String url = change.url ?? '';

            if (url.contains('stripe-')) {
              return _handleUrlChangeStripe(url);
            } else if (url.contains('payment/success')) {
              return _handleUrlChangePayPal(url);
            } else {
              _handleUrlChange(url);
            }
          },
          onPageStarted: (String url) {
            setState(() {
              isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            if (!_hasCompleted) {
              _hasCompleted = true;
              widget.onError();
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  void _handleUrlChangeStripe(String url) {
    try {
      Uri uri = Uri.parse(url);
      String? sessionId = uri.queryParameters['session_id'];

      if (sessionId != null) {
        _hasCompleted = true;
        widget.onSuccess(sessionId, '', 'stripe');
      } else {
        _hasCompleted = true;
        widget.onError();
      }
    } catch (e) {
      if (!_hasCompleted) {
        _hasCompleted = true;
        widget.onError();
      }
    }
  }

  void _handleUrlChangePayPal(String url) {
    try {
      Uri uri = Uri.parse(url);
      String? token = uri.queryParameters['token'];
      String? payerId = uri.queryParameters['PayerID'];

      if (token != null && payerId != null) {
        _hasCompleted = true;
        widget.onSuccess(token, payerId, 'paypal');
      }
    } catch (e) {
      if (!_hasCompleted) {
        _hasCompleted = true;
        widget.onError();
      }
    }
  }

  void _handleUrlChange(String url) {
    if (_hasCompleted) return; // Éviter les appels multiples
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!_hasCompleted) {
          _hasCompleted = true;
          widget.onError();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Paiement'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              // Avant de naviguer, nous marquons la transaction comme terminée
              _hasCompleted = true;
              widget
                  .onError(); // Informer l'appelant que l'opération a été annulée
              context.go("/home");
            },
          ),
        ),
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(
                controller: controller,
              ),
              if (isLoading)
                const Center(
                  child: CircularProgressIndicator(),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
