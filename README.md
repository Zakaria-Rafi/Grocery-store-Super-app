## Lancement du projet Trinity

### Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé les outils suivants :

- **Docker** : Nécessaire pour créer et gérer les conteneurs de l'application.
- **Docker Compose** : Utilisé pour définir et exécuter des environnements multi-conteneurs Docker.
- **PNPM** : Gestionnaire de paquets qui sera utilisé pour installer les dépendances des projets frontend et backend.

Vous pouvez consulter les guides d'installation officiels pour [Docker](https://docs.docker.com/get-docker/) et [PNPM](https://pnpm.io/installation).

### Structure du projet

Le projet est divisé en deux parties principales :

- **Frontend** : Interface utilisateur développée avec Nuxt.js.
- **Backend** : API développée avec NestJS.

Chaque partie a son propre Dockerfile pour les environnements de développement et de production.

### Configuration initiale

1. Clonez le dépôt Git du projet :
   ```bash
   git clone <url_du_dépôt>
   ```
2. Accédez au dossier du projet :
   ```bash
   cd chemin_vers_le_projet
   ```

### Lancement du projet

Utilisez le script `trinity.sh` pour lancer le projet. Ce script permet de démarrer les services en utilisant Docker Compose selon l'environnement spécifié (développement, production, local).

#### Commandes disponibles

- Pour lancer tous les services en développement :
  ```bash
  ./trinity.sh -d -all
  ```
- Pour lancer uniquement le backend en mode développement :
  ```bash
  ./trinity.sh -d -b
  ```
- Pour lancer uniquement le frontend en mode développement :
  ```bash
  ./trinity.sh -d -f
  ```

- Pour lancer tous les services en production :
  ```bash
  ./trinity.sh -p -all
  ```

#### Options du script

- `-d` : Démarre les services en utilisant `docker-compose.dev.yml`.
- `-p` : Démarre les services en utilisant `docker-compose.prod.yml`.
- `-l` : Démarre les services en utilisant `docker-compose.local.yml`.
- `-all` : Lance tous les services (frontend et backend).
- `-b` : Lance uniquement le service backend.
- `-f` : Lance uniquement le service frontend.

#### Seeding

Pour lancer le seeding, utilisez la commande suivante :

```bash
./trinity.sh -d -b
```

Aller sur le cmd du container backend et lancer le seeding :

```bash
pnpm db:seed
```

### Fichiers Docker Compose

Les configurations Docker Compose pour les différents environnements sont spécifiées dans les fichiers suivants :

- `docker-compose.dev.yml` : Configuration pour le développement.
- `docker-compose.prod.yml` : Configuration pour la production.
- `docker-compose.local.yml` : Configuration pour un environnement local.

### Documentation supplémentaire

Pour plus d'informations sur le projet, les technologies utilisées et les configurations spécifiques, consultez les documents suivants :

- [Technologies](./Docs/technologies.md)
- [Installation GitLab Runner](./Docs/gitlab-runner.md)
- [CI/CD Diagram](./Docs/cicd-diagram.md)
- [Differences between Dockerfiles](./Docs/differences-between-dockerfiles.md)
