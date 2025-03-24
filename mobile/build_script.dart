// ignore_for_file: avoid_print

import 'dart:io';

void main(List<String> arguments) async {
  // Récupérer l'environnement des arguments
  String environment = 'local'; // Valeur par défaut
  bool enableStacktrace = false;
  bool enableDebug = false;

  // Analyser les arguments
  for (int i = 0; i < arguments.length; i++) {
    if (arguments[i].startsWith('--environment=')) {
      environment = arguments[i].substring('--environment='.length);
    } else if (arguments[i] == '--stacktrace') {
      enableStacktrace = true;
    } else if (arguments[i] == '--debug') {
      enableDebug = true;
    }
  }

  print('Building for environment: $environment');

  // Définir les variables d'environnement pour Gradle
  Map<String, String> envVars = {...Platform.environment};

  // Construire l'application avec l'environnement spécifié
  List<String> buildCommand = [
    'build',
    'apk',
    '--dart-define=ENVIRONMENT=$environment'
  ];

  // Ajouter les options de débogage si nécessaire
  if (enableStacktrace) {
    buildCommand.add('--stacktrace');
  }

  if (enableDebug) {
    buildCommand.add('--info');
  }

  print('Executing command: flutter ${buildCommand.join(' ')}');

  try {
    final process =
        await Process.start('flutter', buildCommand, environment: envVars);

    // Rediriger stdout et stderr
    process.stdout.listen((event) => stdout.add(event));
    process.stderr.listen((event) => stderr.add(event));

    // Attendre la fin du processus
    final exitCode = await process.exitCode;

    if (exitCode != 0) {
      print('\nBuild failed with exit code: $exitCode');
      print('Try running with --stacktrace or --debug for more information');
      print(
          'If the daemon crashed, try increasing JVM heap size with --jvm-heap=4096');
    }

    exit(exitCode);
  } catch (e) {
    print('Error executing Flutter command: $e');
    exit(1);
  }
}
