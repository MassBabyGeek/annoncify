# Système de Campagnes Email - Annoncify

Ce document explique comment utiliser le système de gestion d'emails automatiques et de campagnes marketing dans Annoncify.

## Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Templates d'Email](#templates-demail)
- [Campagnes](#campagnes)
- [Déclencheurs Automatiques](#déclencheurs-automatiques)
- [API](#api)
- [Interface Admin](#interface-admin)

## Installation

### 1. Installer Resend

Le système utilise [Resend](https://resend.com) pour l'envoi d'emails (gratuit jusqu'à 3000 emails/mois).

```bash
# Déjà installé dans le projet
pnpm --filter @annoncify/web add resend
```

### 2. Configurer Resend

1. Créez un compte sur [resend.com](https://resend.com)
2. Obtenez votre API key
3. Ajoutez-la à votre `.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 3. Seed les Templates par Défaut

```bash
pnpm --filter @annoncify/web seed:emails
```

Cela créera 4 templates par défaut :
- ✅ **Bienvenue** - Envoyé après la création de compte
- ✅ **Nouvel abonnement** - Envoyé après souscription
- ✅ **Annonce publiée** - Envoyé après publication d'annonce
- ✅ **Abonnement va expirer** - Envoyé 7 jours avant expiration

## Configuration

### Variables d'environnement

```env
# Resend API Key (obligatoire)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email de l'expéditeur (optionnel, par défaut: noreply@annoncify.com)
FROM_EMAIL=noreply@annoncify.com
FROM_NAME=Annoncify
```

## Templates d'Email

### Structure d'un Template

```typescript
{
  name: "Nom du template",
  subject: "Sujet avec {{variables}}",
  preheader: "Texte de prévisualisation",
  htmlContent: "<html>...</html>",
  textContent: "Version texte",
  trigger: "USER_CREATED", // Déclencheur
  delayMinutes: 0, // Délai avant envoi
  fromName: "Annoncify",
  fromEmail: "noreply@annoncify.com",
  replyTo: "support@annoncify.com",
  status: "ACTIVE" // DRAFT, ACTIVE, PAUSED, ARCHIVED
}
```

### Variables disponibles

Dans vos templates, vous pouvez utiliser les variables suivantes :

```
{{firstName}}         - Prénom de l'utilisateur
{{lastName}}          - Nom de famille
{{email}}             - Email de l'utilisateur
{{listingTitle}}      - Titre de l'annonce
{{listingCount}}      - Nombre d'annonces
{{subscriptionName}}  - Nom de l'abonnement (Pro, Business, etc.)
{{subscriptionEndDate}} - Date d'expiration de l'abonnement
{{platform}}          - Nom de la plateforme (LeBonCoin, Vinted, etc.)
{{itemsImported}}     - Nombre d'items importés
```

### Créer un nouveau template

**Via l'interface admin:**

1. Allez sur `/admin/emails`
2. Cliquez sur "Nouveau Template"
3. Remplissez le formulaire
4. Testez l'email avec le bouton "Envoyer un test"
5. Activez le template

**Via l'API:**

```typescript
const response = await fetch('/api/admin/email/templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Mon Template',
    subject: 'Bienvenue {{firstName}} !',
    htmlContent: '<html>...</html>',
    trigger: 'USER_CREATED',
    status: 'ACTIVE',
  }),
})
```

## Campagnes

Les campagnes permettent d'envoyer des emails en masse à une audience ciblée.

### Créer une campagne

```typescript
const response = await fetch('/api/admin/email/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Promotion de Noël',
    description: 'Offre spéciale pour les fêtes',
    targetRole: 'PRO', // Cibler un rôle spécifique
    subject: 'Profitez de notre offre de Noël !',
    htmlContent: '<html>...</html>',
    sendNow: true, // Envoyer immédiatement
  }),
})
```

### Ciblage

Vous pouvez cibler :

- **Tous les utilisateurs** : `targetRole: null, targetUserIds: []`
- **Par rôle** : `targetRole: 'PRO'` (FREE, STARTER, PRO, BUSINESS, ENTERPRISE, ADMIN)
- **Utilisateurs spécifiques** : `targetUserIds: ['user1', 'user2']`

## Déclencheurs Automatiques

Le système envoie automatiquement des emails basés sur les actions utilisateurs.

### Triggers disponibles

```typescript
enum EmailTrigger {
  USER_CREATED           // Création de compte
  USER_VERIFIED          // Email vérifié
  SUBSCRIPTION_STARTED   // Nouvel abonnement
  SUBSCRIPTION_RENEWED   // Renouvellement
  SUBSCRIPTION_CANCELLED // Annulation
  SUBSCRIPTION_ENDING    // Expire dans 7 jours
  LISTING_PUBLISHED      // Annonce publiée
  LISTING_SOLD           // Annonce vendue
  LISTING_EXPIRED        // Annonce expirée
  IMPORT_COMPLETED       // Import terminé
  INACTIVE_USER          // Inactif depuis 30 jours
  MANUAL                 // Envoi manuel
}
```

### Déclencher un email

```typescript
import { emailTriggers } from '@/lib/email'

// Après création de compte
await emailTriggers.userCreated(
  user.id,
  user.email,
  user.firstName
)

// Après souscription
await emailTriggers.subscriptionStarted(
  user.id,
  user.email,
  'Pro Plan',
  user.firstName
)

// Après publication d'annonce
await emailTriggers.listingPublished(
  user.id,
  user.email,
  'Ma super moto',
  user.firstName
)
```

### Intégration dans votre code

**Exemple : Envoyer un email après création de compte**

```typescript
// Dans votre webhook Clerk
import { emailTriggers } from '@/lib/email'

export async function POST(req: Request) {
  const { data } = await req.json()

  if (data.type === 'user.created') {
    const user = data.user

    // Créer l'utilisateur en DB
    await prisma.user.create({...})

    // Envoyer l'email de bienvenue
    await emailTriggers.userCreated(
      user.id,
      user.emailAddresses[0].emailAddress,
      user.firstName
    )
  }
}
```

## API

### Endpoints disponibles

#### Templates

```
GET    /api/admin/email/templates          - Liste tous les templates
POST   /api/admin/email/templates          - Créer un template
GET    /api/admin/email/templates/:id      - Obtenir un template
PUT    /api/admin/email/templates/:id      - Modifier un template
DELETE /api/admin/email/templates/:id      - Supprimer un template
POST   /api/admin/email/templates/:id/test - Envoyer un email de test
```

#### Campagnes

```
GET  /api/admin/email/campaigns          - Liste toutes les campagnes
POST /api/admin/email/campaigns          - Créer et envoyer une campagne
GET  /api/admin/email/campaigns/:id      - Obtenir une campagne
```

#### Statistiques

```
GET  /api/admin/email/stats               - Statistiques globales
```

## Interface Admin

### Accéder à l'interface

L'interface admin est disponible à l'adresse :

```
https://votre-domaine.com/admin/emails
```

### Fonctionnalités

- 📊 **Dashboard** - Vue d'ensemble des statistiques
- 📧 **Templates** - Gérer tous vos templates
- 🎯 **Campagnes** - Créer et gérer des campagnes
- 📈 **Analytics** - Taux d'ouverture, de clic, etc.
- ✉️ **Logs** - Historique de tous les emails envoyés

### Tester un template

1. Allez sur la liste des templates
2. Cliquez sur l'icône "Envoyer" (✉️) à côté du template
3. Entrez votre email de test
4. Vérifiez votre boîte de réception

## Statistiques

Le système track automatiquement :

- ✅ **Emails envoyés** - Nombre total d'emails
- 📬 **Emails délivrés** - Emails reçus
- 👁️ **Taux d'ouverture** - % d'emails ouverts
- 🖱️ **Taux de clic** - % de clics sur les liens
- ⚠️ **Bounces** - Emails non délivrés

## Bonnes pratiques

### 1. Testez vos emails

Envoyez toujours un email de test avant d'activer un template :

```typescript
// Via l'interface admin
// OU
await sendTestEmail(
  'votre.email@example.com',
  'Sujet de test',
  htmlContent
)
```

### 2. Utilisez les variables

Ne hardcodez pas les informations utilisateur :

```html
<!-- ❌ Mauvais -->
<h1>Bienvenue !</h1>

<!-- ✅ Bon -->
<h1>Bienvenue {{firstName}} !</h1>
```

### 3. Ajoutez toujours un lien de désinscription

```html
<a href="{{unsubscribeUrl}}">Se désabonner</a>
```

### 4. Optimisez pour mobile

Utilisez un design responsive :

```html
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="max-width: 600px; margin: 0 auto;">
      <!-- Contenu -->
    </td>
  </tr>
</table>
```

### 5. Monitoring

Vérifiez régulièrement :
- Le taux d'ouverture (idéal: > 20%)
- Le taux de clic (idéal: > 2%)
- Les bounces (< 2%)

## Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez votre clé API Resend : `process.env.RESEND_API_KEY`
2. Vérifiez que le template est `ACTIVE`
3. Consultez les logs dans `/api/admin/email/stats`

### Les variables ne sont pas remplacées

Assurez-vous d'utiliser la syntaxe `{{variable}}` (avec doubles accolades).

### Les emails vont dans les spams

1. Configurez SPF, DKIM et DMARC pour votre domaine
2. Évitez les mots comme "gratuit", "promotion" dans le sujet
3. Ajoutez toujours un lien de désinscription

## Support

Pour toute question ou problème :

- 📧 Email : support@annoncify.com
- 📚 Documentation : https://docs.annoncify.com
- 🐛 Issues : https://github.com/annoncify/annoncify/issues
