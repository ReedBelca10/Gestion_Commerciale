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

# Lancer les services (DB + Redis)
docker-compose up -d

# Appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Seeder la base avec un SuperAdmin
npx prisma db seed
```

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

