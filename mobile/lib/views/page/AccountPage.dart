import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/controllers/auth_controller.dart';
import 'Order.dart';
import 'package:mobile/views/widget/auth_wrapper.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  final AuthController authController = AuthController();
  String userName = '';
  String userEmail = '';

  @override
  void initState() {
    super.initState();
    _fetchUserProfile();
  }

  Future<void> _fetchUserProfile() async {
    try {
      final userInfo = await authController.getUserFromToken();

      if (userInfo != null) {
        setState(() {
          userName = "${userInfo['firstName']} ${userInfo['lastName']}".trim();
          userEmail = userInfo['email'];
        });
      }
    } catch (e) {
      throw Exception("Erreur lors de la récupération du profil: $e");
    }
  }

  Future<void> _logout() async {
    try {
      await authController.logout();

      if (!mounted) return;
      context.go("/login");
    } catch (e) {
      throw Exception(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthWrapper(
      child: Scaffold(
        body: Container(
          color: Colors.white,
          child: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      const SizedBox(height: 16),
                      Text(
                        userName.isNotEmpty ? userName : 'Chargement...',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        userEmail.isNotEmpty ? userEmail : '',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 32),
                      ListTile(
                        leading: const Icon(Icons.shopping_bag_outlined),
                        title: const Text('My Orders'),
                        trailing: const Icon(Icons.arrow_forward_ios),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const OrdersPage(),
                            ),
                          );
                        },
                      ),
                      ListTile(
                        leading: const Icon(Icons.exit_to_app),
                        title: const Text('Sign out'),
                        trailing: const Icon(Icons.arrow_forward_ios),
                        onTap: _logout,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
