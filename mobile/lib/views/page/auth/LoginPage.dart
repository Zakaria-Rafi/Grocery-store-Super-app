import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/views/widget/Auth/ForgetPasswordWidget.dart';

import '../../../controllers/auth_controller.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  AuthController authController = AuthController();
  final TextEditingController _emailTextController = TextEditingController();
  final TextEditingController _passwordTextController = TextEditingController();
  bool _obscurePassword = true;
  bool _switchValue = false;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadRememberMe();
    _checkAutoLogin();
  }

  final WidgetStateProperty<Color?> overlayColor =
      WidgetStateProperty<Color?>.fromMap(
    <WidgetState, Color>{
      WidgetState.selected: const Color.fromRGBO(108, 197, 29, 1),
      WidgetState.disabled: Colors.grey.shade400,
    },
  );
  static const WidgetStateProperty<Color?> trackColor =
      WidgetStateProperty<Color?>.fromMap(
    <WidgetState, Color>{
      WidgetState.selected: Color.fromRGBO(108, 197, 29, 1),
    },
  );

  void _login() async {
    _isLoading = true;
    var result = await authController.login(_emailTextController.text, _passwordTextController.text);
    if (result["success"] == true) {
      if (!mounted) return;
      _isLoading = false;
      context.go('/home');
    } else {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = result["message"];
      });
    }
  }

  void _loadRememberMe() async {
    bool rememberMe = await authController.getRememberMe();
    setState(() {
      _switchValue = rememberMe;
    });
  }

  void _checkAutoLogin() async {
    bool rememberMe = await authController.getRememberMe();
    bool isLoggedIn = await authController.isUserLoggedIn();

    if (rememberMe && isLoggedIn) {
      if (!mounted) return;
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
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
        initialChildSize: 0.5, // Taille initiale
        minChildSize: 0.5, // Taille minimale
        maxChildSize: 0.8, // Taille maximale lorsqu'on l'étire
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
                    "Welcome back",
                    style: GoogleFonts.poppins(
                        fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 5),
                  Text("Sign in to your account",
                      style: GoogleFonts.poppins(
                          color: Colors.grey, fontSize: 15)),

                  const SizedBox(height: 20),

                  AutofillGroup(
                    child: Column(
                      children: [
                        // Email
                        TextField(
                          controller: _emailTextController,
                          autocorrect: false,
                          enableSuggestions: false,
                          keyboardType: TextInputType.emailAddress,
                          autofillHints: const [AutofillHints.email],
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.email),
                            hintText: "Email address",
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                        const SizedBox(height: 15),

                        // Password
                        TextField(
                          controller: _passwordTextController,
                          obscureText: _obscurePassword,
                          autocorrect: false,
                          enableSuggestions: false,
                          autofillHints: const [AutofillHints.password],
                          decoration: InputDecoration(
                            prefixIcon: const Icon(Icons.lock),
                            hintText: "Password",
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility
                                    : Icons.visibility_off,
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
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 12.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Row(
                          children: [
                            Switch(
                                value: _switchValue,
                                overlayColor: overlayColor,
                                trackColor: trackColor,
                                onChanged: (value) async {
                                  setState(() {
                                    _switchValue = value;
                                  });
                                  await authController.setRememberMe(value);
                                }),
                            Text("Remember me",
                                style: GoogleFonts.poppins(
                                    color: Colors.grey, fontSize: 15)),
                          ],
                        ),
                        TextButton(
                          onPressed: () {
                            showModalBottomSheet(
                                context: context,
                                shape: const RoundedRectangleBorder(
                                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                                ),
                                builder: (context){
                                  return ForgetPasswordWidget();
                                }
                            );
                          },
                          child: Text(
                            "Forgot password ?",
                            style: GoogleFonts.poppins(
                                color: const Color(0xFF407EC7), fontSize: 15),
                          ),
                        ),
                      ],
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
                      onTap: _login,
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
                            "Login",
                            style: GoogleFonts.poppins(
                              fontSize: 15,
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
                        Text("Don't have an account ? ",
                            style: GoogleFonts.poppins(
                                color: Colors.grey, fontSize: 15)),
                        TextButton(
                          onPressed: () {
                            context.go('/signup');
                          },
                          child: Text("Sign Up",
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
