# 🚀 Annoncify - Guide de Configuration

Ce guide vous accompagne dans la configuration complète de votre projet Annoncify.

## 📋 Prérequis

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Un compte Supabase
- Un compte Clerk
- Un compte Stripe
- Un compte Resend

## 🔧 Installation

### 1. Installation des dépendances

```bash
pnpm install
```

### 2. Configuration de la base de données (Supabase)

1. Créez un projet sur [Supabase](https://supabase.com)
2. Récupérez votre `DATABASE_URL` dans Project Settings > Database
3. Copiez `.env.example` vers `.env` et remplissez `DATABASE_URL`

```bash
cp .env.example .env
```

4. Générez le client Prisma et pushez le schéma

```bash
cd packages/database
pnpm db:generate
pnpm db:push
```

### 3. Configuration de l'authentification (Clerk)

1. Créez une application sur [Clerk](https://dashboard.clerk.com)
2. Récupérez vos clés API
3. Ajoutez dans `.env`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

4. Configurez les webhooks Clerk:
   - URL: `https://votre-domaine.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Récupérez le `CLERK_WEBHOOK_SECRET`

### 4. Configuration des paiements (Stripe)

1. Créez un compte sur [Stripe](https://dashboard.stripe.com)
2. Récupérez vos clés API (mode test)
3. Créez 3 produits avec abonnement mensuel:
   - Starter: 9€/mois
   - Pro: 24€/mois
   - Business: 49€/mois

4. Récupérez les `price_id` de chaque plan

5. Configurez les webhooks Stripe:
   - URL: `https://votre-domaine.com/api/webhooks/stripe`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### 5. Configuration des emails (Resend)

1. Créez un compte sur [Resend](https://resend.com)
2. Vérifiez votre domaine
3. Créez une clé API
4. Ajoutez `RESEND_API_KEY` dans `.env`

### 6. Configuration du stockage (Supabase Storage)

1. Dans votre projet Supabase, allez dans Storage
2. Créez un bucket `listings-images`
3. Configurez les politiques d'accès:

```sql
-- Policy pour upload (utilisateurs authentifiés)
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings-images');

-- Policy pour lecture publique
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listings-images');
```

## 🏃‍♂️ Lancement du projet

### Mode développement

```bash
# Lance tous les apps en mode dev
pnpm dev

# Ou spécifiquement l'app web
cd apps/web
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de production

```bash
pnpm build
```

## 🗄️ Base de données

### Commandes utiles

```bash
# Générer le client Prisma
cd packages/database
pnpm db:generate

# Push le schéma vers la DB
pnpm db:push

# Créer une migration
pnpm db:migrate

# Ouvrir Prisma Studio
pnpm db:studio
```

## 🌍 Déploiement

### Vercel (Recommandé pour Next.js)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Définissez la root directory sur `apps/web`
4. Déployez !

### Variables d'environnement en production

Assurez-vous de définir TOUTES les variables dans `.env.example` sur votre plateforme de déploiement.

⚠️ **Important**: Utilisez les clés de PRODUCTION pour Stripe, Clerk, etc.

## 📦 Structure des packages

```
packages/
├── auth/         # Configuration Clerk + helpers
├── database/     # Schéma Prisma + client
├── email/        # Templates React Email + Resend
├── ui/           # Composants shadcn/ui
├── config/       # Configs ESLint, Tailwind
└── scrapers/     # Services d'import (Vinted, etc.)
```

## 🔐 Sécurité

- ✅ Tous les secrets sont dans `.env` (jamais dans le code)
- ✅ `.env` est dans `.gitignore`
- ✅ Les webhooks sont signés et vérifiés
- ✅ Les routes API sont protégées par Clerk
- ✅ Row Level Security activé sur Supabase

## 🐛 Troubleshooting

### Erreur Prisma "Can't reach database server"

- Vérifiez votre `DATABASE_URL`
- Vérifiez que votre IP est autorisée dans Supabase

### Erreur Clerk "Invalid publishable key"

- Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` commence par `pk_`
- Assurez-vous d'utiliser la bonne clé (test/production)

### Webhooks ne fonctionnent pas

- Utilisez ngrok pour tester en local: `ngrok http 3000`
- Vérifiez que les secrets sont corrects
- Consultez les logs des webhooks dans Stripe/Clerk dashboard

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Clerk](https://clerk.com/docs)
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Supabase](https://supabase.com/docs)

## 💬 Support

Pour toute question, ouvrez une issue sur GitHub ou contactez l'équipe de développement.
