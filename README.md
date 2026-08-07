# Plateforme SaaS de Gestion Commerciale

Plateforme multi-tenant de gestion commerciale développée avec Next.js 14, Prisma, PostgreSQL et Docker.

## Fonctionnalités Clés

*   **Architecture Multi-Tenant** : Isolation stricte des données entre les commerces.
*   **Rôles & Permissions** : 
    *   **SUPERADMIN** : Gestion globale de la plateforme.
    *   **DIRECTEUR** : Propriétaire d'un commerce, gestion de l'équipe et infos.
    *   **VENDEUR** : Caisse et Transactions.
    *   **MAGASINIER** : Gestion des stocks.
*   **Caisse Temps Réel** : Interface POS interactive avec gestion de stock.
*   **Sécurité** : Authentification NextAuth, Mots de passe hashés (bcrypt), Middleware de protection.

## Stack Technique

*   **Frontend** : Next.js (App Router), Tailwind CSS, Lucide React.
*   **Backend** : Next.js API Routes, Prisma ORM.
*   **Base de Données** : PostgreSQL.
*   **Infra** : Docker Compose.
*   **Validation** : Zod (API & Forms).

## Installation & Démarrage

### Pré-requis
*   Docker & Docker Compose
*   Node.js 18+

### 1. Installation

```bash
# Installer les dépendances
npm install

# Copier l'exemple de configuration d'environnement
cp .env.example .env.local

# Utiliser une base de données PostgreSQL en production
# - Pour la production, configurez `DATABASE_URL` comme secret (GitHub Secrets / Render / Prod provider).
# - Exemple Render (prod): `postgresql://<user>:<password>@dpg-xxxxx.region-postgres.render.com:5432/<db>?sslmode=require`
# - Si votre mot de passe contient des caractères spéciaux, conservez la valeur entre guillemets dans les fichiers locaux.

# Lancer les services (DB + Redis) si vous utilisez Redis local
docker-compose up -d

# Appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Seeder la base avec un SuperAdmin
npx prisma db seed
```

### Fichier d'environnement

Copiez `.env.example` vers `.env.local` puis adaptez les variables selon votre système.

### 2. Démarrage

```bash
npm run dev
```

Accédez à `http://localhost:3000`.

## Comptes par défaut (Seed)

*   **SuperAdmin** : `superadmin@example.com` / `password`

## Migration de Base de Données

Si vous modifiez `prisma/schema.prisma` :

```bash
npx prisma migrate dev --name <nom_migration>
```

## Architecture des Rôles

*   Le **SuperAdmin** crée des **Tenants** (Commerces) via `/superadmin`.
*   Chaque Tenant a un **Directeur**.
*   Le Directeur crée des **Employés** (Vendeurs, Magasiniers) via `/admin`.
*   Les Vendeurs accèdent à `/app` pour la caisse.

## Sécurité (2FA)

L'authentification à deux facteurs est supportée.
1.  L'utilisateur scanne le QR Code généré dans son profil.
2.  Lors du login, si le 2FA est activé, un code TOTP est demandé.
3.  Protection contre le brute-force via Rate Limiting (Redis).

