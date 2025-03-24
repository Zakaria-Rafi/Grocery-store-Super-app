import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../controllers/auth_controller.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  AuthController authController = AuthController();
  final TextEditingController _firstnameTextController =
      TextEditingController();
  final TextEditingController _lastnameTextController = TextEditingController();
  final TextEditingController _emailTextController = TextEditingController();
  final TextEditingController _passwordTextController = TextEditingController();
  final TextEditingController _verifyPasswordTextController = TextEditingController();
  String? _errorMessage;
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureVerifyPassword = true;

  bool _isValidEmail(String email) {
    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\$');
    return emailRegex.hasMatch(email);
  }

  bool _isValidPassword(String password) {
    final passwordRegex = RegExp(r'^(?=.*[a-z])(?=.*[A-Z]).{8,}\$');
    return passwordRegex.hasMatch(password);
  }

  void _signup() async {
    setState(() {
      if (!_isValidEmail(_emailTextController.text)) {
        _errorMessage = "L'adresse email est invalide";
        return;
      }
      if (!_isValidPassword(_passwordTextController.text)) {
        _errorMessage = "Le mot de passe doit contenir au moins 8 caractères, une majuscule et une minuscule";
        return;
      }
      if (_passwordTextController.text != _verifyPasswordTextController.text) {
        _errorMessage = "Les mots de passe ne correspondent pas";
        return;
      }
      _errorMessage = null;
    });

    if (_errorMessage == null) {
      setState(() {
        _isLoading = true;
      });
      final bool result = await authController.signup(
        _firstnameTextController.text,
        _lastnameTextController.text,
        _emailTextController.text,
        _passwordTextController.text,
      );

      if (result) {
        if (!mounted) return;
        _isLoading = false;
        context.go('/home');
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur de connexion'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Image en arrière-plan
          Positioned.fill(
            child: Image.asset(
              'assets/images/loginImage.png',
              fit: BoxFit.cover,
            ),
          ),

          Align(
            alignment: Alignment.bottomCenter,
            child: _buildBottomSheet(context),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomSheet(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: DraggableScrollableSheet(
        initialChildSize: 0.7, // Taille initiale
        minChildSize: 0.7, // Taille minimale
        maxChildSize: 0.95, // Taille maximale quand on l'étire
        builder: (context, scrollController) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black26,
                  blurRadius: 10,
                ),
              ],
            ),
            child: SingleChildScrollView(
              controller: scrollController,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Create account",
                    style: GoogleFonts.poppins(
                        fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 5),
                  Text("Quickly create your account",
                      style: GoogleFonts.poppins(
                          color: Colors.grey, fontSize: 15)),

                  const SizedBox(height: 20),
                  // Email
                  TextField(
                    controller: _firstnameTextController,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.email),
                      hintText: "Firstname",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _lastnameTextController,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.email),
                      hintText: "Lastname",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _emailTextController,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.email),
                      hintText: "Email address",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _passwordTextController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.lock),
                      hintText: "Password",
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  TextField(
                    controller: _verifyPasswordTextController,
                    obscureText: _obscureVerifyPassword,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.lock),
                      hintText: "Verify password",
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureVerifyPassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureVerifyPassword = !_obscureVerifyPassword;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  if (_errorMessage != null)
                    Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red, fontSize: 14),
                    ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: MediaQuery.of(context).size.width,
                    height: 60,
                    child: InkWell(
                      onTap: _signup,
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
                          child: _isLoading ? const CircularProgressIndicator(color: Colors.white,) :
                          Text(
                            "Sign Up",
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
                  const SizedBox(height: 10),
                  Center(
                    child: Row(
                      children: [
                        Text("Already have an account ? ",
                            style: GoogleFonts.poppins(
                                color: Colors.grey, fontSize: 15)),
                        TextButton(
                          onPressed: () {
                            context.go('/login');
                          },
                          child: Text("Login",
                              style: GoogleFonts.poppins(
                                  color: Colors.black, fontSize: 15)),
                        ),
                      ],
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
