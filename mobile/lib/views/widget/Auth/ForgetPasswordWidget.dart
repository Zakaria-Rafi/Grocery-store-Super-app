import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../controllers/auth_controller.dart';

class ForgetPasswordWidget extends StatefulWidget {
  const ForgetPasswordWidget({super.key});

  @override
  State<ForgetPasswordWidget> createState() => _ForgetPasswordWidgetState();
}

class _ForgetPasswordWidgetState extends State<ForgetPasswordWidget> {
  @override
  Widget build(BuildContext context) {
    TextEditingController emailController = TextEditingController();
    AuthController authController = AuthController();

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Reset Password",
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            "Enter your email to receive a password reset link.",
            style: GoogleFonts.poppins(color: Colors.grey, fontSize: 14),
          ),
          const SizedBox(height: 15),
          TextField(
            controller: emailController,
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.email),
              hintText: "Email address",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 15),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () {
                authController.forgetPassword(emailController.text);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color.fromRGBO(108, 197, 29, 1),
              ),
              child: Text(
                "Send Reset Link",
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

