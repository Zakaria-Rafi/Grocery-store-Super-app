import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

class ProductNotFound extends StatelessWidget {
  final String codebar;

  const ProductNotFound({
    super.key,
    required this.codebar,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height,
      width: MediaQuery.of(context).size.width,
      color: const Color.fromRGBO(244, 245, 249, 1),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: Color.fromRGBO(134, 136, 137, 1),
          ),
          const SizedBox(height: 16),
          Text(
            "Code-barres inconnu",
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          Text(
            codebar,
            style: GoogleFonts.poppins(
              fontSize: 16,
              color: const Color.fromRGBO(134, 136, 137, 1),
            ),
          ),
          const SizedBox(height: 24),
          TextButton(
            onPressed: () => context.pop(),
            child: Text(
              "Fermer",
              style: GoogleFonts.poppins(
                fontSize: 16,
                color: const Color.fromRGBO(40, 180, 70, 1),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
