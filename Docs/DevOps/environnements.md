### **Environnements \- Trinity**

Ce document présente les principales différences entre les environnements de **développement** (Dev) et de **production** (Prod) pour le projet **Trinity**.

### **1\. Objectifs des environnements**

* **Environnement de développement (Dev)** :  
  * Optimisé pour les phases de développement pour tester, déboguer et modifier rapidement le code.  
  * Inclut des outils de développement, des dépendances supplémentaires et des fonctionnalités de rechargement à chaud.  
* **Environnement de production (Prod)** :  
  * Conçu pour la stabilité, la sécurité et les performances en environnement utilisateur final.  
  * Minimise les dépendances, optimise les performances et met en œuvre des configurations sécurisées.

  ### **2\. Différences dans les Dockerfiles**

  #### **Backend**

| Aspect | Dockerfile.dev | Dockerfile.prod |
| ----- | :---- | :---- |
| **Image de base** | `trinity-node22-pnpm-git-alpine:latest`. | Même image, mais utilisée dans un **multi-stage build**. |
| **Mode d'exécution** | Lance le serveur en mode développement avec `pnpm start:dev`. | Exécute le fichier compilé avec `node dist/src/main` |
| **Code source inclus** | Le code complet est copié dans l'image | Seuls les fichiers nécessaires (`dist`, `node_modules`) sont inclus. |

  #### **Frontend**

| Aspect | Dockerfile.dev | Dockerfile.prod |
| ----- | :---- | :---- |
| **Image de base** | `trinity-node22-pnpm-git-alpine:latest`. | Même image avec un **multi-stage build** pour optimiser. |
| **Mode d'exécution** | Démarre Nuxt en mode développement avec `pnpm dev`. | Exécute la version compilée avec `node .output/server/index.mjs`. |
| **Build optimisé** | Non. | Génère une version optimisée avec `pnpm build`. |
| **Code source inclus** | Tout le code source est copié dans l'image. | Seuls les fichiers compilés (build `.output`) sont copiés dans l'image finale. |
| **Variables d'environnement** | Pas ou peu configurées. | Définit des variables pour le mode production (`NODE_ENV=production`). |

  ### **3\. Différences dans les fichiers docker-compose**

  #### **Services et orchestration**

| Aspect | docker-compose.dev.yml | docker-compose.prod.yml |
| ----- | ----- | ----- |
| **Images** | Construit localement les images à partir des Dockerfiles. | Utilise des images préconstruites et versionnées via un registre. |
| **Volumes** | Volumes non persistants ou temporaires. | Volumes persistants pour PostgreSQL et Grafana (ex. : `postgres_data`). |
| **Configuration réseau** | Réseau local pour un développement rapide (`bridge`). | Inclut un réseau externe (`runner_network`) pour CI/CD. |
| **Services DevOps** | Prometheus et Grafana configurés sans persistance. | Identiques, mais avec des volumes persistants pour les données. |

  #### **Variables d'environnement**

* **Dev** :  
  * Variables codées en dur ou basées sur des valeurs par défaut.  
  * Pas d'informations sensibles.  
* **Prod** :  
- Utilisation de variables d'environnement sécurisées via `.env` :  
  yaml

  `GF_SECURITY_ADMIN_PASSWORD: ${GF_SECURITY_ADMIN_PASSWORD:-}`

  ### **4\. Impact des différences entre Dev et Prod**

  #### **Développement (Dev) :**

* **Avantages** :  
  * Cycles rapides grâce au rechargement à chaud.  
  * Flexibilité pour modifier et tester les nouvelles fonctionnalités.  
* **Inconvénients** :  
  * Images plus volumineuses et moins optimisées.  
  * Moins sécurisé (pas d'optimisation pour les données sensibles ou la performance).

  #### **Production (Prod) :**

* **Avantages** :  
  * Images légères et optimisées.  
  * Sécurité accrue grâce à l’exclusion des dépendances inutiles et des outils de développement.  
  * Performances maximales avec une application compilée.  
* **Inconvénients** :  
  * Nécessite une phase de build, donc moins flexible pour des changements rapides.

  ### **5\. Conclusion**

Les environnements **Dev** et **Prod** diffèrent de manière significative pour répondre à des besoins spécifiques :

* **Dev** favorise la rapidité et la flexibilité pour les développeurs.  
* **Prod** priorise la sécurité, la performance et la stabilité pour les utilisateurs finaux.

En combinant des Dockerfiles et des fichiers docker-compose adaptés, vous garantissez une transition fluide entre ces deux environnements, permettant un développement efficace et un déploiement fiable.

