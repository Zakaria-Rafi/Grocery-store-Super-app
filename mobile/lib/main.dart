import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile/routes.dart';
import 'package:provider/provider.dart';


import 'controllers/payment_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding
      .ensureInitialized(); // <- Ajout pour initialiser Flutter correctement
  await dotenv.load(fileName: "../.env");
  runApp(MultiProvider(providers: [
    ChangeNotifierProvider(create: (_) => PaymentController()),
  ], child: const MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF4F5F9),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFFFFFF),
          brightness: Brightness.light,
        ),
      ),
    );
  }
}
