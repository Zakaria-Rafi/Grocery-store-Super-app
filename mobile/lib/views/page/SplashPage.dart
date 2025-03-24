import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SplashScreen extends StatefulWidget {

  const SplashScreen({super.key});

  @override
  SplashScreenState createState() => SplashScreenState();
}

class SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late AnimationController _cartController;
  late AnimationController _scaleController;
  late Animation<Offset> _cartAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;


  @override
  void initState() {
    super.initState();

    _cartController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _scaleController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _cartAnimation = Tween<Offset>(
      begin: const Offset(-1.5, 0.0),
      end: const Offset(1.5, 0.0),
    ).animate(CurvedAnimation(
      parent: _cartController,
      curve: Curves.easeInOutBack,
    ));

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeInOutSine),
    );

    _fadeAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeInOutSine),
    );

    // Replace Future.delayed with Timer
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Future.delayed(const Duration(seconds: 5), () {
        if (!mounted) return;
        _checkAuth();
      });
    });
  }

  Future<void> _checkAuth() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token');

      if (!mounted) return;

      if (token == null) {
        context.go('/login');
        return;
      }

      final response = await _apiService.get('/auth/me');
      if (!mounted) return;

      if (response.data != null) {
        context.go('/home');
      } else {
        await prefs.remove('jwt_token');
        if (!mounted) return;
        context.go('/login');
      }
    } catch (e) {
      if (mounted) context.go('/login');
    }
  }


  @override
  void dispose() {
    _cartController.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFAEDC81), Color(0xFF6CC51D)],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SlideTransition(
                position: _cartAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: SvgPicture.asset(
                    'assets/shopping_cart.svg',
                    height: 120,
                    width: 120,
                    colorFilter: const ColorFilter.mode(
                      Colors.white,
                      BlendMode.srcIn,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 40),
              FadeTransition(
                opacity: _fadeAnimation,
                child: const Text(
                  'Trinity Shopping',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 2,
                    shadows: [
                      Shadow(
                        blurRadius: 10.0,
                        color: Colors.black26,
                        offset: Offset(5.0, 5.0),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              AnimatedBuilder(
                animation: _scaleController,
                builder: (context, child) {
                  return Transform.scale(
                    scale: 1 + (0.1 * _scaleController.value),
                    child: Text(
                      'Your Shopping Scanner',
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.white.withAlpha(
                            80 + ((20 * _scaleController.value).round())),
                        letterSpacing: 1,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
