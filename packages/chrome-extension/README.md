# 🚀 Annoncify Chrome Extension

Extension Chrome multi-plateforme pour automatiser la gestion d'annonces sur Vinted, LeBonCoin, eBay, Facebook Marketplace, et plus.

## 📁 Structure du Projet

```
packages/chrome-extension/
├── src/
│   ├── platforms/           # Adaptateurs par plateforme
│   │   ├── base-adapter.ts  # Classe abstraite de base
│   │   ├── vinted.ts        # Adaptateur Vinted
│   │   ├── leboncoin.ts     # Adaptateur LeBonCoin
│   │   └── registry.ts      # Registry des adaptateurs
│   ├── content-scripts/     # Scripts injectés dans les pages
│   │   ├── content-vinted.ts
│   │   └── content-leboncoin.ts
│   ├── background/          # Service Worker
│   │   └── index.ts
│   ├── popup/               # UI de la popup
│   │   ├── index.tsx
│   │   └── index.html
│   ├── options/             # Page d'options
│   │   ├── index.tsx
│   │   └── index.html
│   ├── types/               # Types TypeScript
│   │   └── index.ts
│   ├── utils/               # Utilitaires
│   └── manifest.json        # Manifest V3
├── public/                  # Assets publics (icons, etc.)
├── webpack.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## 🎯 Fonctionnalités

### ✅ Implémentées

- **Création d'annonce automatique**
  - Remplissage des formulaires
  - Upload de photos (base64 ou URLs)
  - Sélection catégories/sous-catégories
  - Prix, description, localisation

- **Gestion des annonces**
  - Édition
  - Suppression
  - Republication/boost

- **Statistiques**
  - Vues
  - Favoris
  - Dernière mise à jour

- **Messagerie**
  - Récupération des conversations
  - Envoi de messages
  - Détection de nouveaux messages

### 🔄 Plateformes Supportées

- ✅ **Vinted** (Complet)
- ✅ **LeBonCoin** (Complet)
- 🚧 **Facebook Marketplace** (À implémenter)
- 🚧 **eBay** (À implémenter)
- 🚧 **Etsy** (À implémenter)

## 🛠️ Installation & Développement

### 1. Installation des dépendances

```bash
cd packages/chrome-extension
pnpm install
```

### 2. Build en mode développement

```bash
pnpm dev
# Ou depuis la racine du monorepo
pnpm --filter @annoncify/chrome-extension dev
```

### 3. Build en mode production

```bash
pnpm build
```

### 4. Charger l'extension dans Chrome

1. Ouvrir Chrome et aller à `chrome://extensions/`
2. Activer le "Mode développeur" (en haut à droite)
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier `packages/chrome-extension/dist`

## 📖 Utilisation

### Depuis la popup

```typescript
// L'extension détecte automatiquement la plateforme active
// La popup affiche les actions disponibles:
// - Créer une annonce
// - Gérer les annonces existantes
// - Voir les statistiques
// - Gérer les messages
```

### Depuis le site Next.js

L'extension peut être contrôlée depuis l'application Next.js via messaging:

```typescript
// Dans l'app Next.js
const extensionId = 'YOUR_EXTENSION_ID'

// Envoyer une commande à l'extension
chrome.runtime.sendMessage(
  extensionId,
  {
    action: 'CREATE_AD',
    payload: {
      platform: 'vinted',
      data: {
        title: 'Mon article',
        description: 'Description...',
        price: 25,
        currency: 'EUR',
        category: 'vetements',
        location: {
          city: 'Paris',
          zipCode: '75001',
          country: 'FR',
        },
        images: ['https://...', 'data:image/...'],
      },
    },
    timestamp: Date.now(),
    requestId: crypto.randomUUID(),
  },
  (response) => {
    if (response.success) {
      console.log('Annonce créée:', response.data)
    } else {
      console.error('Erreur:', response.error)
    }
  }
)
```

## 🔌 API & Messaging

### Actions disponibles

| Action | Description | Payload |
|--------|-------------|---------|
| `CREATE_AD` | Créer une annonce | `{ platform, data: AdPayload }` |
| `EDIT_AD` | Modifier une annonce | `{ platform, id, data: Partial<AdPayload> }` |
| `DELETE_AD` | Supprimer une annonce | `{ platform, id }` |
| `REPUBLISH_AD` | Republier/boost | `{ platform, id }` |
| `FETCH_STATS` | Récupérer les stats | `{ platform, id }` |
| `FETCH_MESSAGES` | Récupérer les messages | `{ platform }` |
| `SEND_MESSAGE` | Envoyer un message | `{ platform, threadId, message }` |

### Structure des messages

```typescript
interface ChromeMessage {
  action: MessageAction
  payload: any
  timestamp: number
  requestId: string
}

interface ChromeMessageResponse {
  success: boolean
  data?: anyconst [settings, setSettings] = useState<ExtensionSettings
  error?: string
  requestId: string
}
```

## 🔧 Ajouter une Nouvelle Plateforme

### 1. Créer l'adaptateur

```typescript
// src/platforms/facebook.ts
import { BasePlatformAdapter } from './base-adapter'
import type { AdPayload, AdStats, MessageThread, PlatformName } from '../types'

export class FacebookMarketplaceAdapter extends BasePlatformAdapter {
  protected platformName: PlatformName = 'facebook'

  detect(): boolean {
    return window.location.hostname.includes('facebook.com') &&
           window.location.pathname.includes('/marketplace')
  }

  async createAd(data: AdPayload) {
    // Implémentation spécifique à Facebook
    try {
      // 1. Naviguer vers la page de création
      // 2. Remplir le formulaire
      // 3. Upload photos
      // 4. Soumettre
      return { success: true, adId: '...' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Implémenter toutes les méthodes abstraites...
}
```

### 2. Enregistrer l'adaptateur

```typescript
// src/platforms/registry.ts
import { FacebookMarketplaceAdapter } from './facebook'

constructor() {
  this.register(new VintedAdapter())
  this.register(new LeBonCoinAdapter())
  this.register(new FacebookMarketplaceAdapter()) // Ajouter ici
}
```

### 3. Créer le content script

```typescript
// src/content-scripts/content-facebook.ts
import browser from 'webextension-polyfill'
import { platformRegistry } from '../platforms/registry'
import type { ChromeMessage, ChromeMessageResponse } from '../types'

const adapter = platformRegistry.getAdapter('facebook')

browser.runtime.onMessage.addListener(async (message: ChromeMessage) => {
  // Gérer les messages comme dans les autres content scripts
})
```

### 4. Mettre à jour le manifest

```json
{
  "content_scripts": [
    {
      "matches": ["https://www.facebook.com/*"],
      "js": ["content-facebook.js"],
      "run_at": "document_end"
    }
  ],
  "host_permissions": [
    "https://www.facebook.com/*"
  ]
}
```

### 5. Mettre à jour webpack.config.js

```javascript
entry: {
  'content-facebook': './src/content-scripts/content-facebook.ts',
}
```

## 🎨 Selectors DOM

Les sélecteurs DOM peuvent changer fréquemment. Voici comment les maintenir:

### Vinted (mise à jour 2024)

```typescript
private selectors = {
  titleInput: 'input[name="title"]',
  descriptionTextarea: 'textarea[name="description"]',
  priceInput: 'input[name="price"]',
  // ...
}
```

### LeBonCoin (mise à jour 2024)

```typescript
private selectors = {
  titleInput: 'input[name="subject"]',
  descriptionTextarea: 'textarea[name="body"]',
  priceInput: 'input[name="price"]',
  // ...
}
```

**⚠️ Note:** Si les selectors ne fonctionnent plus:
1. Inspecter la page avec DevTools
2. Trouver les nouveaux selectors
3. Mettre à jour dans l'adaptateur correspondant

## 🔐 Sécurité

### Variables d'environnement

Configurer dans `src/background/index.ts`:

```typescript
let settings: ExtensionSettings = {
  apiUrl: 'http://localhost:3000', // URL du Next.js
  apiKey: process.env.ANNONCIFY_API_KEY, // Optionnel
  autoSync: true,
  syncInterval: 30, // minutes
  notifications: true,
}
```

### Communication avec Next.js

L'extension utilise `chrome.runtime.onMessageExternal` pour recevoir des commandes du site Next.js.

**Configuration dans Next.js:**

```typescript
// apps/web/src/app/api/extension/route.ts
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const data = await req.json()

  // Traiter les données de l'extension
  // Synchroniser avec la base de données

  return Response.json({ success: true })
}
```

## 📊 Synchronisation avec Next.js

L'extension peut synchroniser automatiquement les données:

```typescript
// Background script envoie périodiquement
await fetch(`${settings.apiUrl}/api/extension/sync`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${settings.apiKey}`,
  },
  body: JSON.stringify({
    stats: [...],      // Statistiques collectées
    messages: [...],   // Nouveaux messages
    timestamp: new Date(),
  }),
})
```

## 🐛 Debugging

### Console Logs

```typescript
// Dans les adaptateurs
this.log('Message de debug', data)
this.logError('Erreur', error)
```

### Chrome DevTools

1. **Background script:** `chrome://extensions` → "Inspecter les vues : service worker"
2. **Content script:** F12 sur la page → Console
3. **Popup:** Clic droit sur popup → "Inspecter"

## 📝 TODO & Améliorations

- [ ] Implémenter Facebook Marketplace
- [ ] Implémenter eBay
- [ ] Implémenter Etsy
- [ ] Ajouter une queue de tâches avec retry
- [ ] Implémenter la détection de CAPTCHAs
- [ ] Ajouter des notifications desktop
- [ ] Créer une UI popup React complète
- [ ] Ajouter des tests unitaires
- [ ] Implémenter l'authentification avec le backend
- [ ] Ajouter la gestion des erreurs réseau
- [ ] Implémenter le rate limiting

## 📄 Licence

Private - Annoncify

---

**Développé pour Annoncify** - Extension Chrome pour la gestion multi-plateforme d'annonces
