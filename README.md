# 🎯 Annoncify

Plateforme moderne de centralisation d'annonces en ligne.

## 🏗️ Architecture

Ce projet utilise un monorepo Turborepo avec la stack suivante:

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Emails**: Resend
- **i18n**: next-intl

## 📦 Structure

```
annoncify/
├── apps/
│   ├── web/          # Application utilisateur + Landing page
│   ├── admin/        # Back-office admin
│   └── api/          # Services API
├── packages/
│   ├── ui/           # Composants partagés
│   ├── database/     # Prisma schema
│   ├── auth/         # Configuration Clerk
│   ├── email/        # Templates email
│   ├── config/       # Configurations
│   └── scrapers/     # Services d'import
└── tooling/
    └── typescript/   # Config TypeScript
```

## 🚀 Démarrage

```bash
# Installation
pnpm install

# Développement
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
```

## 🌍 Variables d'environnement

Copier `.env.example` vers `.env` et remplir les valeurs.

## 📝 License

Propriétaire - Tous droits réservés
