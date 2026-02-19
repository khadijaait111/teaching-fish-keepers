# 🐟 Club Poisson — Mise en production professionnelle

> Application web de gestion d'événements pour l'association Club Poisson de Nancy.  
> Ce dépôt contient le frontend React, le backend Bun/TypeScript, et toute l'infrastructure de déploiement automatisé.

---

## 📋 Table des matières

- [Présentation du projet](#présentation-du-projet)
- [Architecture](#architecture)
- [Lancer le projet en local](#lancer-le-projet-en-local)
  - [Prérequis](#prérequis)
  - [Mode développement](#mode-développement)
  - [Mode Docker (production locale)](#mode-docker-production-locale)
- [Tests](#tests)
- [Linting et formatage](#linting-et-formatage)
- [Pipeline CI/CD](#pipeline-cicd)
  - [Intégration continue (CI)](#intégration-continue-ci)
  - [Déploiement continu (CD)](#déploiement-continu-cd)
- [Conteneurisation](#conteneurisation)
- [Choix techniques et justifications](#choix-techniques-et-justifications)
- [Bonus implémentés](#bonus-implémentés)
- [Variables d'environnement](#variables-denvironnement)
- [Contribuer](#contribuer)

---

## Présentation du projet

**Club Poisson** est une association de passionnés d'aquariophilie de la région Nancéenne. Cette application web leur permet de gérer et afficher leurs événements mensuels de manière autonome, en remplacement de leur groupe Facebook.

Le projet est un **monorepo** structuré ainsi :

```
club-poisson/
├── backend/          # API REST (Bun + TypeScript)
├── frontend/         # Application React (Vite + Tailwind CSS v4)
├── .github/
│   ├── workflows/
│   │   └── ci.yml    # Pipeline GitHub Actions
│   └── dependabot.yml
└── docker-compose.yml
```

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│  PostgreSQL  │
│  React/Vite  │     │  Bun :3000  │     │     :5432    │
│  Nginx :80   │     │             │     │              │
└─────────────┘     └─────────────┘     └─────────────┘
```

- Le **frontend** est servi par Nginx en production et proxifie les appels `/api/*` vers le backend
- Le **backend** expose une API REST, gère l'authentification par sessions en mémoire et exécute les migrations au démarrage
- La **base de données** PostgreSQL 17 persiste les données via un volume Docker

---

## Lancer le projet en local

### Prérequis

- [Bun](https://bun.sh/) `>= 1.3.9`
- [Docker](https://www.docker.com/) et Docker Compose
- [Node.js](https://nodejs.org/) (optionnel, pour certains outils)

### Mode développement

#### 1. Lancer la base de données

```bash
docker run -d --name clubpoisson-db \
  -e POSTGRES_USER=clubpoisson \
  -e POSTGRES_PASSWORD=clubpoisson \
  -e POSTGRES_DB=clubpoisson \
  -p 5432:5432 \
  postgres:17
```

#### 2. Lancer le backend

```bash
cd backend
bun install
bun dev
# Serveur disponible sur http://localhost:3000
```

#### 3. Lancer le frontend

```bash
cd frontend
bun install
bun dev
# Application disponible sur http://localhost:5173
```

> En mode développement, Vite proxifie automatiquement les appels `/api/*` vers `http://localhost:3000`.

### Mode Docker (production locale)

Lancer l'ensemble de l'application en une seule commande :

```bash
docker compose up --build
```

| Service   | URL                       | Description                  |
|-----------|---------------------------|------------------------------|
| Frontend  | http://localhost:8081     | Application React via Nginx  |
| Backend   | http://localhost:3000     | API REST                     |
| Adminer   | http://localhost:8080     | Interface d'administration DB|
| PostgreSQL| localhost:5432            | Base de données               |

Pour arrêter et nettoyer :

```bash
docker compose down -v
```

---

## Tests

### Backend

Les tests backend utilisent le **test runner natif de Bun** — aucune dépendance supplémentaire requise.

```bash
cd backend
bun test
```

#### Couverture des tests — 3 fichiers, 10 cas

| Fichier            | Scope                          | Ce qui est testé                                      |
|--------------------|--------------------------------|-------------------------------------------------------|
| `auth.test.ts`     | Logique des sessions           | Créer, valider, invalider une session                 |
| `events.test.ts`   | CRUD en base de données        | Créer, lire, supprimer un événement via le repository |
| `api.test.ts`      | Routes HTTP en conditions réelles | GET /events, POST sans auth, login invalide         |

> Les tests d'intégration (`api.test.ts`) nécessitent que le serveur backend soit démarré et connecté à une base PostgreSQL.

### Frontend

```bash
cd frontend
bun run test
```

---

## Linting et formatage

Le projet utilise **Biome** comme outil unifié de linting et de formatage sur l'ensemble du monorepo (backend + frontend), complété par **ESLint** pour les règles spécifiques à React côté frontend.

### Vérifier le formatage et le linting

```bash
# Vérification globale avec Biome (depuis la racine)
bunx biome check frontend/
bunx biome check backend/

# Correction automatique
bunx biome check --write frontend/
bunx biome check --write backend/

# ESLint frontend uniquement
cd frontend && bun run lint
```

### Configuration Biome

La configuration se trouve dans `biome.json` à la racine. Les règles clés :

- **Indentation** : tabulations
- **Guillemets** : doubles
- **Imports** : organisés automatiquement
- **Règles** : `recommended` activées

---

## Pipeline CI/CD

### Intégration continue (CI)

Le pipeline se déclenche sur **chaque push et chaque Pull Request**, sur toutes les branches.

```
Push / PR → Frontend CI ──┐
                           ├──▶ Build & Push Docker ──▶ Deploy to Production
           Backend CI  ──┘
```

#### Jobs parallèles

**Frontend CI** :
1. Installation des dépendances (`bun install --frozen-lockfile`)
2. Vérification Biome (formatage + linting)
3. ESLint
4. Tests

**Backend CI** :
1. Spin d'une base PostgreSQL 17 via GitHub Actions services
2. Installation des dépendances
3. Vérification Biome
4. Démarrage du serveur backend
5. Exécution de `bun test`

#### Optimisation du cache

Les dépendances `node_modules` sont mises en cache via `actions/cache@v4` avec une clé basée sur le hash du fichier `bun.lock`. Cela réduit significativement le temps d'installation sur les runs suivants.

### Déploiement continu (CD)

Le déploiement se déclenche uniquement sur la branche **`main`**, et seulement si le CI est passé.

#### Étapes du déploiement

| Étape | Description |
|-------|-------------|
| **Build & Push** | Construction des images Docker avec BuildKit et push sur `ghcr.io` |
| **SSH Connect** | Connexion au VPS via `appleboy/ssh-action` |
| **Pull Images** | `docker compose pull` pour récupérer les nouvelles images |
| **Up -d** | `docker compose up -d --remove-orphans` |
| **Cleanup** | `docker image prune -f` pour libérer l'espace disque |

#### Tags des images Docker

- `:latest` — toujours la dernière version sur `main`
- `:<branch>` — nom de la branche
- `:<branch>-<sha>` — hash du commit pour la traçabilité exacte

---

## Conteneurisation

### Dockerfiles

#### Backend (`backend/Dockerfile`)

Utilise l'image officielle `oven/bun` avec un **multi-stage build** :

- **Stage `builder`** : installation des dépendances
- **Stage final** : copie uniquement ce qui est nécessaire pour exécuter l'application

#### Frontend (`frontend/Dockerfile`)

**Multi-stage build** en deux temps :

- **Stage `builder`** : `bun run build` pour générer les fichiers statiques
- **Stage final** : image `nginx:alpine` qui sert les fichiers statiques

Le fichier de configuration Nginx inclut une règle `try_files` pour le routing côté client de React Router, et proxifie `/api/*` vers le backend.

### docker-compose.yml

Orchestre 4 services :

```yaml
services:
  postgres   # PostgreSQL 17 avec volume persistant
  backend    # API Bun
  frontend   # Nginx servant le build React
  adminer    # Interface DB (développement)
```

---

## Choix techniques et justifications

| Choix | Justification |
|-------|---------------|
| **Bun test runner** | Intégré nativement, zéro config, cohérent avec le stack Bun existant |
| **Biome** | Remplace ESLint + Prettier en un seul outil, plus rapide, configuration unifiée pour backend et frontend |
| **GitHub Actions** | Intégré nativement à GitHub, pas de service externe à gérer |
| **ghcr.io** | Registre Docker gratuit intégré à GitHub, authentification via `GITHUB_TOKEN` automatique |
| **Multi-stage builds** | Réduit la taille des images finales en n'incluant pas les outils de build |
| **Cache BuildKit** | `cache-from: type=gha` réutilise les layers Docker entre les runs CI |
| **appleboy/ssh-action** | Action GitHub maintenue et sécurisée pour la connexion SSH |
| **`--remove-orphans`** | Nettoie les conteneurs obsolètes lors des mises à jour de configuration |

---

## Bonus implémentés

### Dependabot

Fichier `.github/dependabot.yml` configuré pour surveiller **4 écosystèmes** :

- Dépendances npm du **frontend**
- Dépendances npm du **backend**
- Images **Docker**
- Versions des **GitHub Actions**

Fréquence : hebdomadaire. Dependabot ouvre automatiquement des Pull Requests lorsqu'une mise à jour ou une vulnérabilité de sécurité est détectée.

### Adminer

Interface web d'administration de la base de données accessible en développement sur `http://localhost:8080`, pratique pour inspecter les données sans outil externe.

### Cache Docker dans le CI

Utilisation de `cache-from: type=gha` et `cache-to: type=gha,mode=max` avec Docker Buildx pour réutiliser les layers entre les runs, réduisant le temps de build.

---

## Variables d'environnement

### Backend

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PGHOST` | Hôte PostgreSQL | `postgres` (Docker) ou `localhost` |
| `PGDATABASE` | Nom de la base | `clubpoisson` |
| `PGUSER` | Utilisateur PostgreSQL | `clubpoisson` |
| `PGPASSWORD` | Mot de passe PostgreSQL | `clubpoisson` |
| `PGPORT` | Port PostgreSQL | `5432` |
| `ADMIN_PASSWORD` | Mot de passe administrateur | À définir |

### GitHub Secrets (pour le CD)

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Adresse IP du VPS de production |
| `SERVER_USER` | Nom d'utilisateur SSH |
| `SSH_PRIVATE_KEY` | Clé privée SSH (format PEM) |

> Le `GITHUB_TOKEN` est automatiquement fourni par GitHub Actions pour l'authentification à `ghcr.io`.

---

## Contribuer

Ce projet suit le workflow **GitFlow** :

- `main` — branche de production, déploiement automatique
- `develop` — branche d'intégration
- `feature/*` — nouvelles fonctionnalités
- `fix/*` — corrections de bugs
- `deploy/*` — modifications d'infrastructure

Toute contribution passe par une **Pull Request** avec revue de code avant merge sur `main`.