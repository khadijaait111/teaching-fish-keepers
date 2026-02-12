# Image Bun officielle
FROM oven/bun:1 AS base
WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (meilleur cache)
COPY package.json bun.lock* ./

# Installer les dépendances (production + dev si besoin)
RUN bun install --frozen-lockfile

# Copier le reste du code
COPY . .

# Port du serveur Bun
EXPOSE 3000

# Variables d'environnement par défaut (tu peux les surcharger dans docker-compose)
ENV PGHOST=postgres \
    PGPORT=5432 \
    PGDATABASE=clubpoisson \
    PGUSER=clubpoisson \
    PGPASSWORD=clubpoisson \
    ADMIN_PASSWORD=admin

# Commande de démarrage (équivalent à `bun run src/index.ts`)
CMD ["bun", "run", "src/index.ts"]