import 'package:go_router/go_router.dart';
import 'package:mobile/models/Product.dart';
import 'package:mobile/views/page/PaiementStatusPage.dart';
import 'package:mobile/views/page/ProductDetailsPage.dart';
import 'package:mobile/views/page/auth/LoginPage.dart';
import 'package:mobile/views/page/auth/SignUpPage.dart';
import 'package:mobile/views/page/NavigationPage.dart';
import 'package:mobile/views/page/SplashPage.dart';

final GoRouter router = GoRouter(initialLocation: '/', routes: [
  GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
  GoRoute(
      name: 'signup',
      path: '/signup',
      builder: (context, state) => const SignUpPage()),
  GoRoute(
      name: 'login',
      path: '/login',
      builder: (context, state) => const LoginPage()),
  GoRoute(
      name: 'home',
      path: '/home',
      builder: (context, state) => const NavigationPage()),
  GoRoute(
    path: '/product-details',
    name: 'product-details',
    builder: (context, state) {
      final product = state.extra as Product;
      return ProductDetailsPage(product: product);
    },
  ),
  GoRoute(
    path: '/payment-status',
    name: 'payment-status',
    builder: (context, state) {
      final paymentId = state.uri.queryParameters['paymentId'];
      final payerId = state.uri.queryParameters['payerId'];
      final type = state.uri.queryParameters['type'];
      return PaymentStatusPage(
          paymentId: paymentId ?? '', payerId: payerId ?? '', type: type ?? '');
    },
  ),
]);
