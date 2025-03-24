import 'package:flutter/material.dart';
import '../../middleware/auth_middleware.dart';

class AuthWrapper extends StatefulWidget {
  final Widget child;

  const AuthWrapper({
    super.key,
    required this.child,
  });

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AuthMiddleware.checkAuth(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
