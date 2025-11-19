# 🏗️ Architecture Annoncify

Ce document décrit l'architecture technique complète d'Annoncify.

## 📐 Vue d'ensemble

Annoncify utilise une architecture **monorepo Turborepo** avec Next.js 15 et une stack moderne.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │ Admin Panel  │  │  Mobile App  │      │
│  │  (Next.js)   │  │  (Next.js)   │  │   (Future)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SHARED PACKAGES                         │
│  ┌────────┐ ┌──────────┐ ┌───────┐ ┌───────┐ ┌─────────┐  │
│  │   UI   │ │   Auth   │ │ Email │ │Config │ │ Scrapers│  │
│  └────────┘ └──────────┘ └───────┘ └───────┘ └─────────┘  │
│              └──────────────┬──────────────┘                │
│                             │                                │
│                      ┌──────▼──────┐                        │
│                      │  Database   │                        │
│                      │   (Prisma)  │                        │
│                      └──────┬──────┘                        │
└─────────────────────────────┼─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                        │
│  ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ Supabase │ │ Clerk  │ │ Stripe │ │ Resend │ │Platforms│ │
│  │(Postgres)│ │ (Auth) │ │ (Pay)  │ │(Email) │ │Scrapers │ │
│  └──────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Structure du Monorepo

```
annoncify/
├── apps/                    # Applications
│   ├── web/                # Application web principale (Next.js 15)
│   │   ├── src/
│   │   │   ├── app/       # App Router Next.js
│   │   │   │   ├── [locale]/          # Routes internationalisées
│   │   │   │   ├── api/webhooks/      # Webhooks Stripe/Clerk
│   │   │   │   └── globals.css        # Styles globaux
│   │   │   ├── components/            # Composants React
│   │   │   │   ├── landing/           # Landing page sections
│   │   │   │   └── navbar.tsx
│   │   │   ├── lib/                   # Utilities
│   │   │   ├── i18n.ts               # Configuration i18n
│   │   │   └── middleware.ts         # Middleware Next.js
│   │   └── messages/                  # Traductions (FR/EN)
│   │
│   ├── admin/              # Back-office admin (TODO)
│   └── api/                # Services API (TODO)
│
├── packages/               # Packages partagés
│   ├── ui/                # Composants UI (shadcn/ui)
│   │   ├── components/   # Button, Card, Input, etc.
│   │   └── lib/utils.ts  # Helpers UI
│   │
│   ├── database/         # Prisma + Database
│   │   ├── schema.prisma # Schéma de données
│   │   └── index.ts      # Client Prisma
│   │
│   ├── auth/            # Authentification Clerk
│   │   ├── middleware.ts # Middleware auth
│   │   └── utils.ts      # Helpers (getCurrentUser, hasRole)
│   │
│   ├── email/           # Templates email (React Email + Resend)
│   │   └── templates/   # welcome, import-complete, etc.
│   │
│   ├── config/          # Configurations partagées
│   │   ├── eslint-preset.js
│   │   └── tailwind.config.ts
│   │
│   └── scrapers/        # Services d'import
│       ├── vinted/
│       ├── leboncoin/
│       ├── amazon/
│       └── ebay/
│
└── tooling/            # Outils de développement
    └── typescript/     # Config TypeScript partagée
```

## 🎨 Stack Technique

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (Radix UI)
- **Fonts**: Geist Sans & Geist Mono
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes
- **ORM**: Prisma 5
- **Database**: PostgreSQL (Supabase)

### Authentication
- **Provider**: Clerk
- **Features**:
  - Email/Password
  - OAuth (Google, GitHub)
  - Multi-factor authentication
  - User management
  - Webhooks pour sync DB

### Payments
- **Provider**: Stripe
- **Features**:
  - Subscriptions (mensuel)
  - Webhooks pour événements
  - Customer Portal
  - Multiple plans (Free, Starter, Pro, Business)

### Email
- **Provider**: Resend
- **Templates**: React Email
- **Types**:
  - Welcome email
  - Import notifications
  - Limit reached
  - Subscription updates

### Storage
- **Provider**: Supabase Storage
- **CDN**: Cloudflare (via proxy)
- **Features**:
  - Image upload
  - Automatic optimization
  - Public/Private buckets

### Internationalization
- **Library**: next-intl
- **Languages**: FR, EN (extensible)
- **Features**:
  - Route-based locale
  - Server/Client components support
  - Type-safe translations

## 🗄️ Schéma de Base de Données

### Tables Principales

**User** - Utilisateurs de la plateforme
```prisma
- id: String (CUID)
- clerkId: String (unique, sync avec Clerk)
- email: String
- role: UserRole (FREE, STARTER, PRO, BUSINESS, ENTERPRISE, ADMIN)
- stripeCustomerId: String?
- stripeSubscriptionId: String?
- monthlyListingsCount: Int
```

**Listing** - Annonces importées
```prisma
- id: String
- userId: String (FK -> User)
- title: String
- description: Text
- price: Float
- platform: Platform (VINTED, LEBONCOIN, AMAZON, EBAY, etc.)
- images: String[]
- status: ListingStatus (DRAFT, ACTIVE, PAUSED, SOLD, EXPIRED, DELETED)
- views: Int
- favorites: Int
```

**ImportLog** - Historique des imports
```prisma
- id: String
- userId: String (FK -> User)
- platform: Platform
- status: ImportStatus (PENDING, PROCESSING, SUCCESS, FAILED)
- itemsTotal: Int
- itemsImported: Int
- itemsFailed: Int
```

**SubscriptionPlan** - Plans d'abonnement (référence)
```prisma
- id: String
- name: String
- stripePriceId: String
- monthlyListings: Int (-1 = unlimited)
- price: Float
- features: String[]
```

**WebhookEvent** - Log des webhooks
```prisma
- id: String
- source: String (stripe, clerk)
- eventType: String
- payload: Json
- processed: Boolean
```

## 🔄 Flux de Données Principaux

### 1. Inscription Utilisateur

```
User → Clerk Sign Up → Webhook → Create User in DB → Welcome Email
```

1. Utilisateur s'inscrit via Clerk
2. Webhook `user.created` reçu
3. Création de l'entrée User en DB (role: FREE)
4. Envoi email de bienvenue via Resend

### 2. Abonnement à un Plan

```
User → Stripe Checkout → Payment → Webhook → Update User Role → Confirmation Email
```

1. Utilisateur clique sur "Get Pro"
2. Redirection vers Stripe Checkout
3. Paiement effectué
4. Webhook `checkout.session.completed`
5. Mise à jour du rôle utilisateur en DB
6. Email de confirmation

### 3. Import d'Annonces

```
User → Select Platform → Authenticate → Scraper → Save to DB → Notification Email
```

1. Utilisateur choisit une plateforme (Vinted, etc.)
2. Authentification si nécessaire
3. Lancement du scraper/API
4. Parsing et validation des données
5. Sauvegarde en DB (création Listings)
6. Incrémentation `monthlyListingsCount`
7. Email de notification avec résumé

### 4. Limite Mensuelle Atteinte

```
Import Attempt → Check Limit → Block + Email Notification
```

1. Tentative d'import
2. Vérification `monthlyListingsCount` vs limite du plan
3. Si limite atteinte: blocage + email
4. Proposition d'upgrade

## 🔐 Sécurité

### Authentication & Authorization

- **Clerk Middleware**: Protège toutes les routes `/dashboard/*`
- **Role-Based Access**: Chaque plan a des limites différentes
- **API Protection**: Toutes les API routes vérifiées par Clerk

### Data Protection

- **Row Level Security**: Activé sur Supabase
- **Environment Variables**: Tous les secrets dans `.env`
- **Webhook Signatures**: Vérification Stripe/Clerk

### Rate Limiting

- **Par utilisateur**: Limites basées sur le plan
- **Par API**: Rate limiting sur les scrapers
- **Webhooks**: Idempotency avec `eventId`

## 🚀 Performance

### Optimisations Frontend

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic avec Next.js
- **Font Optimization**: Geist fonts via next/font
- **CSS**: Tailwind JIT mode

### Optimisations Backend

- **Database Indexing**: Index sur clerkId, email, platform, etc.
- **Connection Pooling**: Prisma connection pooling
- **Caching**: Static generation pour landing page

### Optimisations Build

- **Turborepo**: Cache de build intelligent
- **Parallel Builds**: Builds parallèles des packages
- **Incremental Builds**: Seuls les packages modifiés rebuild

## 📊 Monitoring (TODO)

- **Error Tracking**: Sentry
- **Analytics**: Google Analytics / Plausible
- **Performance**: Vercel Analytics
- **Logs**: Structured logging avec Pino

## 🔮 Évolutions Futures

### Court Terme
- [ ] Admin dashboard complet
- [ ] Implémentation complète des scrapers
- [ ] Tests automatisés (Jest, Playwright)
- [ ] CI/CD avec GitHub Actions

### Moyen Terme
- [ ] Application mobile (React Native)
- [ ] API publique pour développeurs
- [ ] Webhooks pour utilisateurs
- [ ] Templates d'annonces réutilisables

### Long Terme
- [ ] IA pour optimisation des annonces
- [ ] Recommandations de prix
- [ ] Auto-traduction multi-langues
- [ ] Marketplace intégré

## 📚 Ressources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma](https://www.prisma.io/docs)
- [Clerk](https://clerk.com/docs)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
