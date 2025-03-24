import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../controllers/payment_controller.dart';
import '../../models/PaiementStatus.dart';

class PaymentStatusPage extends StatefulWidget {
  final String paymentId;
  final String payerId;
  final String type;

  const PaymentStatusPage({
    super.key,
    required this.paymentId,
    required this.payerId,
    required this.type,
  });

  @override
  PaymentStatusPageState createState() => PaymentStatusPageState();
}

class PaymentStatusPageState extends State<PaymentStatusPage> {
  @override
  void initState() {
    super.initState();
    // Vérifier le statut du paiement dès l'affichage de la page
    Future.microtask(() {
      if (!mounted) return;
      Provider.of<PaymentController>(context, listen: false)
          .checkPaymentStatus(widget.paymentId, widget.payerId, widget.type);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromRGBO(244, 245, 249, 1),
      appBar: AppBar(
        title: const Center(child: Text("Statut du paiement")),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new),
          onPressed: () => context.go("/home"),
        ),
        backgroundColor: Colors.white,
      ),
      body: Consumer<PaymentController>(
        builder: (context, controller, child) {
          final result = controller.paymentResult;

          if (result == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 20),
                  Text(
                    "Vérification du paiement en cours...",
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "Veuillez patienter pendant que nous traitons votre transaction",
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          // Affichage selon le statut
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    result.status == PaymentStatus.success
                        ? Icons.check_circle
                        : result.status == PaymentStatus.pending
                            ? Icons.pending
                            : Icons.error,
                    color: result.status == PaymentStatus.success
                        ? Colors.green
                        : result.status == PaymentStatus.pending
                            ? Colors.orange
                            : Colors.red,
                    size: 80,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    result.message,
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: MediaQuery.of(context).size.width,
                    height: 60,
                    child: InkWell(
                      onTap: () {
                        context.go('/home');
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          gradient: const LinearGradient(
                            colors: [
                              Color.fromRGBO(174, 220, 129, 1),
                              Color.fromRGBO(108, 197, 29, 1),
                            ],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            "Retour à la page d'accueil",
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.normal,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
