# Installer et Configurer un GitLab Runner avec Docker

Ce tutoriel explique comment installer un **GitLab Runner** sur Docker et le connecter à une instance GitLab (dans cet exemple, celle d'Epitech). Un GitLab Runner est un outil qui exécute les pipelines CI/CD définis dans vos projets GitLab. En l’installant sur Docker, vous bénéficiez d'une configuration isolée et facile à gérer.

## Prérequis

- **Docker** doit être installé et en cours d'exécution sur votre machine.
- Accès à une instance GitLab (comme `https://t-dev.epitest.eu/`).
- Un **token d'enregistrement** de runner, obtenu via l'interface GitLab.

## Étape 1 : Création d'un volume Docker

Un volume Docker permet de stocker les données de configuration du runner de manière persistante.

```bash
docker volume create gitlab-runner-config
```

#### Explication

Cette commande crée un volume Docker nommé gitlab-runner-config. Le volume permet de sauvegarder les configurations du GitLab Runner, même si le conteneur est arrêté ou recréé.

## Étape 2 : Lancer le conteneur GitLab Runner

Lancez un conteneur Docker utilisant l'image officielle gitlab/gitlab-runner.

```bash
docker network create runner_network

docker run -d --name gitlab-runner --network runner_network \
  -v gitlab-runner-config:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 9252:9252 \
  gitlab/gitlab-runner:latest
```

#### Explication

`-d` : Lance le conteneur en mode détaché (en arrière-plan).
`--name gitlab-runner` : Donne un nom au conteneur (`gitlab-runner`).
`--restart always` : Redémarre le conteneur automatiquement en cas d'arrêt ou de redémarrage de la machine.
`-v /var/run/docker.sock:/var/run/docker.sock` : Monte le socket Docker pour permettre au runner de démarrer d'autres conteneurs.
`-v gitlab-runner-config:/etc/gitlab-runner` : Monte le volume créé précédemment pour stocker la configuration.

## Étape 3 : Enregistrer le GitLab Runner

Pour connecter le runner à votre instance GitLab, exécutez la commande suivante :

```bash
docker exec -it gitlab-runner gitlab-runner register
```

#### Explication

`docker exec -it gitlab-runner` : Exécute une commande dans le conteneur gitlab-runner.
`gitlab-runner register` : Démarre le processus d'enregistrement du runner.

## Étape 4 : Configuration de l'enregistrement

Vous allez être guidé à travers plusieurs étapes pour configurer le runner :

### URL de l'instance GitLab

```bash
Enter the GitLab instance URL (for example, https://gitlab.com/):
https://t-dev.epitest.eu/
```

#### Explication

Entrez l'URL de l'instance GitLab que vous souhaitez connecter. Dans cet exemple, il s'agit de l'instance t-dev.epitest.eu.

### Token d'enregistrement

Vous le trouverez dans la page de configuration de votre runner sur GitLab.
[Runners](https://t-dev.epitest.eu/NAN_11/T-DEV-701-Devops-bootstrap/-/settings/ci_cd) -> Runners -> les 3 points verticaux en haut à droite -> Registration token (le copier et le coller ici)

```bash
Enter the registration token:
GR******************
```

#### Explication

Entrez le token d'enregistrement obtenu depuis GitLab. Ce token est spécifique à votre projet ou groupe GitLab et permet de lier le runner à celui-ci.

### Description du runner
_Note : On va essayer de garder une même description pour tous les runners (`runner_docker_<VOS_INITIALES>`) pour pouvoir les différencier._
```bash
Enter a description for the runner:
[d39f0ad46f49]: runner_docker_at
```

#### Explication

Donnez un nom ou une description à votre runner. Cela vous permet de le reconnaître facilement dans la liste des runners sur GitLab.

### Tags du runner

```bash
Enter tags for the runner (comma-separated):
gitlab-runner-docker
```

#### Explication

Les tags permettent de filtrer et d'attribuer des jobs à ce runner dans vos pipelines GitLab CI/CD. Utilisez des tags pertinents, par exemple docker, ci, ou build.

### Note de maintenance (optionnel)

```bash
Enter optional maintenance note for the runner:
```

#### Explication

Cette note est optionnelle et sert à ajouter des informations supplémentaires sur l'état du runner (par exemple, "en maintenance" ou "réservé pour des tests").

### Choisir l'executor

```bash
Enter an executor:
docker
```

#### Explication

Choisissez l'executor que le runner utilisera. Dans ce tutoriel, nous sélectionnons docker, car nous exécutons le runner à l'intérieur d'un conteneur Docker. Les autres options sont disponibles si vous souhaitez utiliser un autre environnement d'exécution.

### Image Docker par défaut

```bash 
Enter the default Docker image (for example, ruby:2.7):
alpine:latest
```

#### Explication

Entrez une image Docker par défaut. Si aucune image n'est spécifiée dans vos fichiers .gitlab-ci.yml, le runner utilisera celle-ci. alpine:latest est une image légère et couramment utilisée.

### Modifier fichier config du runner 
Il faut modifier le fichier config.toml afin qu'il puisse avoir accès au docker.sock et que les metrics soient activé pour graphana

Dans les fichiers du runner sur docker aller dans : `etc/gitlab-runner/config.toml`

Changer le conccurent de 1 à 4 : 
`concurrent = 4`

Ajouter à la ligne 5 : 
`listen_address = "0.0.0.0:9252"`

Ajout des metrics dans `[[runners]]`
```
 [runners.metrics]
    address = "0.0.0.0:9252"  # Default Prometheus metrics port for GitLab Runner
```

Mettre à jour les volumes dans `runners.docker`
```
volumes = ["/var/run/docker.sock:/var/run/docker.sock","/cache"]
```

# Vérification

Aller sur : [CI/CD](https://t-dev.epitest.eu/NAN_11/T-DEV-701-Devops-bootstrap/-/settings/ci_cd)

Dans la liste de "Runners", vous devriez voir votre runner comme ceci avec un statut "online" et le tag "gitlab-runner-docker":

![image](https://i.imgur.com/ZuYCbmf.png)
