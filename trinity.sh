#!/bin/bash

# Vérifie si au moins un argument est fourni
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 [-d|-p|-l] [profile]"
    exit 1
fi

# Définit le fichier docker-compose en fonction du premier argument
if [ "$1" = "-d" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
elif [ "$1" = "-p" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
elif [ "$1" = "-l" ]; then
    COMPOSE_FILE="docker-compose.local.yml"
else
    echo "Argument invalide pour l'environnement: $1"
    echo "Usage: $0 [-d|-p|-l] [profile]"
    exit 1
fi

# Définit les services à lancer en fonction du second argument
SERVICES=""
if [ -z "$2" ]; then
    echo "Aucun service spécifié."
    echo "Usage: $0 [-d|-p|-l] [-all|-b|-f]"
    exit 1
elif [ "$2" = "-all" ]; then
    SERVICES="all"
elif [ "$2" = "-b" ]; then
    SERVICES="backend"
elif [ "$2" = "-f" ]; then
    SERVICES="frontend"
else
    echo "Argument invalide pour le profil: $2"
    echo "Usage: $0 [-d|-p|-l] [-all|-b|-f]"
    exit 1
fi

# Lance Docker Compose avec le fichier et les services configurés
docker compose -f $COMPOSE_FILE -f docker-compose.override.yml --profile $SERVICES --env-file ./.env up --pull always --remove-orphans --force-recreate --build

