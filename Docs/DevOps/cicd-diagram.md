# Explication CI/CD

1. **Déclencheurs (Triggers) et Règles** :  
  - **Déclencheurs de pipeline** : Les pipelines peuvent être déclenchés automatiquement par différents événements, tels que :  
    - **Push de commit** sur des branches spécifiques (par exemple `develop`, `main`, `release`).  
    - **Merge Request** (fusion de code via une demande de fusion).  
    - **Déclencheurs manuels (`when: manual`)**, comme l'exécution manuelle d'une tâche après validation d'une étape précédente.  
  - **Règles (`rules`)** : Chaque job définit des règles pour savoir s'il doit ou non s'exécuter, en fonction des conditions comme le type de branche, l'événement de commit ou si c'est une demande de fusion.

2. **Stages du Pipeline** :  
  Le pipeline est divisé en plusieurs stages (étapes), chacune ayant des jobs associés.

  - **Stage de Setup** :  
    - **Job `install-dependencies`** :  
      - Installe les dépendances du projet (ici avec pnpm).  
      - Utilisation du cache pour ne pas télécharger à chaque fois les mêmes dépendances, améliorant ainsi la rapidité du pipeline.  
      - Les règles indiquent que ce job se déclenche pour certaines branches comme `develop`, `release`, `hotfix`, et après des changements sur le fichier `pnpm-lock.yaml`.

  - **Stage de Build** :  
    - **Job `build`** :  
      - Compile l'application en utilisant pnpm build.  
      - Dépend de l'installation des dépendances, mais peut également être déclenché manuellement ou automatiquement selon les règles.

  - **Stage de Tests** :  
    - **Job `test`** :  
      - Exécute les tests unitaires via pnpm test.  
      - Doit être exécuté après la phase de build pour vérifier que le code fonctionne comme prévu.

  - **Stage de Lints** :  
    - **Job `lint`** :  
      - Vérifie la qualité du code en exécutant des outils de linting.  
      - Garantit que le code respecte les standards de style et les bonnes pratiques.

  - **Stage de Semgrep** :  
    - **Job `semgrep-analysis`** :  
      - Effectue une analyse statique du code pour détecter les vulnérabilités de sécurité.  
      - Vérifie les bonnes pratiques de sécurité dans le code.

  - **Stage de Tests End-to-End (E2E)** :  
    - **Job `e2e`** :  
      - Lance des tests end-to-end via Playwright pour vérifier que l'application fonctionne dans un environnement réel.  
      - Utilise une image Docker spécifique pour Playwright et nécessite un environnement de développement pour exécuter les tests.

  - **Stage Docker** :  
    - **Job `docker`** :  
      - Crée des images Docker pour le backend et le frontend du projet.  
      - Ces images sont ensuite poussées vers un registre Docker pour le déploiement sur des environnements de production ou de staging.  
      - Le Dockerfile est utilisé pour définir la configuration des images, et des architectures multiplateformes sont supportées (linux/amd64, linux/arm64).

  - **Stage Flutter** :  
    - **Job `flutter-build`** :
      - Compile l'application mobile Flutter.
      - Prépare les builds pour Android et iOS.

  - **Stage Release** :  
    - **Job `create-release`** :
      - Gère la création des releases.
      - Génère les tags et la documentation associée.

# Diagramme du Flux CI/CD
Voici un diagramme qui résume le flux des étapes et jobs de votre pipeline CI/CD :

```sql
[Push Commit / Merge Request]
           |
           v
  +------------------------+
  |   Stage Setup          |
  |  - Installer Dépendances|
  +------------------------+
           |
           v
  +------------------------+
  |   Stage Build          |
  |  - Compilation         |
  +------------------------+
           |
           v
  +------------------------+
  |   Stage Tests          |
  |  - Tests Unitaires     |
  +------------------------+
           |
           v
  +------------------------+
  |   Stage Lints          |
  |  - Vérification du Code|
  +------------------------+
           |
           v
  +------------------------+
  |   Stage Semgrep        |
  |  - Analyse Sécurité    |
  +------------------------+
           |
           v
  +------------------------+
  |   Stage E2E Tests      |
  |  - Tests End-to-End    |
  +------------------------+
           |
           v
  +------------------------+
  |   Stage Docker         |
  |  - Build Images        |
  +------------------------+
           |
           v
  +------------------------+
  |   Stage Flutter        |
  |  - Build Mobile        |
  +------------------------+
           |
           v
  +------------------------+
  |   Stage Release        |
  |  - Création Release    |
  +------------------------+
```

# Détails des Jobs du Pipeline :
1. Installation des Dépendances :  
    - **Job `install-dependencies`** :  
      - Installe les dépendances de l'application (avec pnpm install) et utilise un cache pour éviter de télécharger à chaque fois les mêmes fichiers, accélérant ainsi le processus de CI/CD.

2. Construction :  
    - **Job `build`** :  
      - Compile le code source du frontend et backend. Ce job peut être exécuté manuellement ou automatiquement en fonction des règles. Il est important de construire les artefacts avant de procéder aux tests.

3. Tests :  
    - **Job `test`** :  
      - Exécute les tests unitaires pour vérifier que les changements de code n'ont pas introduit de régressions. Il est exécuté après la phase de build.

4. Linting :  
    - **Job `lint`** :  
      - Vérifie que le code suit les règles de qualité définies par les outils de linting (ici avec pnpm lint). Cela aide à maintenir un code propre et cohérent.

5. Tests End-to-End (E2E) :  
    - **Job `e2e`** :  
      - Lance les tests Playwright pour simuler des scénarios réels de l'utilisateur et vérifier que l'application fonctionne comme prévu dans des conditions réelles.

6. Création d'Images Docker :  
    - **Job `build_back:docker`** :  
      - Construit les images Docker pour le backend.  
    - **Job `build_front:docker`** :  
      - Construit les images Docker pour le frontend.  
      - Ces images peuvent être utilisées pour déployer l'application dans des environnements isolés (par exemple, des serveurs de production ou de staging).

# Optimisation du Pipeline :
 - **Cache** : L'utilisation du cache avec pnpm permet de ne pas retélécharger les dépendances à chaque pipeline, ce qui accélère considérablement le processus.
- **Docker Multi-Plateforme** : La construction d'images Docker pour plusieurs architectures permet de garantir que votre application fonctionne sur différentes plateformes (AMD64, ARM64).
- **Exécution Conditionnelle** : Grâce aux rules, certaines étapes sont exécutées uniquement lorsqu'elles sont nécessaires (par exemple, tests uniquement sur des branches spécifiques).
- **Jobs Manuels** : Certains jobs sont définis comme manuels (comme les builds Docker), ce qui permet de contrôler précisément le moment où ces étapes sont exécutées.

