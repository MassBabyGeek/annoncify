# 🏗️ Architecture Technique - Annoncify Chrome Extension

## Vue d'ensemble

L'extension Chrome Annoncify est construite avec une architecture modulaire et scalable basée sur le pattern **Adapter** pour gérer facilement plusieurs plateformes.

## 🎯 Principes de Conception

### 1. **Separation of Concerns**
- Chaque plateforme a son propre adaptateur
- Le background script gère le routing des messages
- Les content scripts agissent comme proxy entre la page et le background
- La popup React fournit l'UI utilisateur

### 2. **Pattern Adapter**
Chaque plateforme implémente `PlatformAdapter` interface:

```typescript
interface PlatformAdapter {
  detect(): boolean
  createAd(data: AdPayload): Promise<Result>
  editAd(id: string, data: Partial<AdPayload>): Promise<Result>
  deleteAd(id: string): Promise<Result>
  republishAd(id: string): Promise<Result>
  fetchStats(id: string): Promise<AdStats>
  fetchMessages(): Promise<MessageThread[]>
  sendMessage(threadId: string, message: string): Promise<Result>
  markAsRead(threadId: string): Promise<Result>
}
```

### 3. **Manifest V3 Compliance**
- Service Worker au lieu de background page
- Declarative content scripts
- Host permissions explicites
- Message passing sécurisé

## 📡 Flow de Communication

### Schéma 1: Action initiée depuis la Popup

```
Popup (React)
    ↓ chrome.runtime.sendMessage()
Background Service Worker
    ↓ chrome.tabs.sendMessage()
Content Script (Vinted/LBC)
    ↓ Appelle l'adaptateur
Platform Adapter
    ↓ Interaction DOM
Page Web (Vinted/LBC)
```

### Schéma 2: Action initiée depuis Next.js

```
Next.js App (localhost:3000)
    ↓ chrome.runtime.sendMessage(extensionId, ...)
Background Service Worker
    ↓ chrome.tabs.sendMessage()
Content Script
    ↓ Appelle l'adaptateur
Platform Adapter
    ↓ Interaction DOM
Page Web
```

### Schéma 3: Synchronisation périodique

```
Background Service Worker (setInterval)
    ↓ Collecte des stats
Content Scripts
    ↓ Adaptateurs récupèrent les données
    ↓ fetch() vers Next.js API
Next.js /api/extension/sync
    ↓ Sauvegarde en DB
Prisma Database
```

## 🧩 Composants Clés

### 1. Platform Adapters

**Base Adapter (`base-adapter.ts`)**
- Classe abstraite avec utilitaires communs
- `waitForElement()`: Attend qu'un élément apparaisse dans le DOM
- `typeIntoField()`: Simule la saisie humaine
- `clickElement()`: Clique avec scroll automatique
- `uploadFiles()`: Gère l'upload de fichiers
- `retry()`: Retry avec exponential backoff

**Vinted Adapter (`vinted.ts`)**
- Selectors DOM spécifiques à Vinted
- Gestion du formulaire de création
- Upload de photos (base64 ou URL → File)
- Navigation automatique vers les bonnes pages
- Extraction des stats depuis la page

**LeBonCoin Adapter (`leboncoin.ts`)**
- Selectors DOM spécifiques à LeBonCoin
- Gestion des catégories
- Limite de 10 photos
- Feature "Remonter l'annonce"

### 2. Background Service Worker

**Responsabilités:**
- Router les messages entre popup, content scripts et Next.js
- Gérer la queue de tâches (future)
- Synchronisation périodique avec le backend
- Gestion des erreurs et retry logic

**Message Handlers:**
```typescript
handleCreateAd()      → Forward to content script
handleEditAd()        → Forward to content script
handleFetchStats()    → Forward to content script
handleSyncToServer()  → POST to Next.js API
```

### 3. Content Scripts

**Rôle:**
- Pont entre le background et les adaptateurs
- Injection dans les pages des plateformes
- Écoute des messages du background
- Exécution des actions via les adaptateurs

**Lifecycle:**
```typescript
1. Chargement de la page
2. Détection de la plateforme
3. Notification au background
4. Écoute des messages
5. Exécution des actions
6. Réponse au background
```

### 4. Popup React

**Fonctionnalités:**
- Détection automatique de la plateforme active
- Actions rapides (créer, éditer, stats, messages)
- Lien vers le dashboard Next.js
- Configuration (via page Options)

### 5. Options Page

**Paramètres:**
- URL de l'API Next.js
- Clé API (optionnel)
- Auto-sync on/off
- Intervalle de synchronisation
- Notifications on/off

## 🔐 Sécurité

### 1. Permissions Minimales

```json
{
  "permissions": [
    "storage",        // Sauvegarder settings
    "tabs",           // Accéder aux tabs actifs
    "activeTab",      // Tab actuellement active
    "scripting",      // Injection de scripts
    "notifications"   // Notifs desktop
  ],
  "host_permissions": [
    "https://www.vinted.fr/*",
    "https://www.leboncoin.fr/*",
    "http://localhost:3000/*"  // Dev only
  ]
}
```

### 2. Communication Sécurisée

**Avec Next.js:**
```typescript
// Vérification de l'origine
if (sender.url?.startsWith(settings.apiUrl)) {
  // Autorisé
} else {
  // Rejeté
}
```

**API Authentication:**
```typescript
headers: {
  'Authorization': `Bearer ${settings.apiKey}`
}
```

### 3. Content Security Policy

Manifest V3 impose automatiquement:
- Pas d'`eval()`
- Pas d'inline scripts
- Scripts externes interdits

## 🚀 Performance

### 1. Lazy Loading
- Adaptateurs chargés seulement si plateforme détectée
- Content scripts injectés uniquement sur les domaines concernés

### 2. DOM Interaction Optimizations
- `waitForElement()` avec timeout
- MutationObserver pour détecter les changements DOM
- Delays aléatoires pour simuler comportement humain
- Scroll automatique avant click

### 3. Network Optimization
- Sync batch toutes les 30 minutes (configurable)
- Retry avec exponential backoff
- Timeout sur les requêtes API

## 📊 Types de Données

### AdPayload
```typescript
{
  title: string
  description: string
  price: number
  currency: string
  category: string
  location: { city, zipCode, country }
  images: string[]  // URLs ou base64
  metadata?: Record<string, any>  // Platform-specific
}
```

### AdStats
```typescript
{
  id: string
  platform: PlatformName
  views: number
  favorites: number
  messages: number
  lastUpdated: Date
  status: 'active' | 'sold' | 'expired'
}
```

### MessageThread
```typescript
{
  id: string
  platform: PlatformName
  adId: string
  participant: { id, name, avatar }
  messages: Message[]
  unreadCount: number
}
```

## 🔄 Workflow: Créer une Annonce

### Depuis Next.js

```
1. User remplit le formulaire sur le dashboard
     ↓
2. Next.js envoie commande à l'extension
     chrome.runtime.sendMessage(extensionId, {...})
     ↓
3. Background reçoit et forward au content script
     browser.tabs.sendMessage(tabId, {...})
     ↓
4. Content script active l'adaptateur
     adapter.createAd(data)
     ↓
5. Adaptateur navigue et remplit le formulaire
     - Navigate to /items/new
     - Upload photos
     - Fill title, description, price
     - Select category, condition
     - Submit form
     ↓
6. Adaptateur extrait l'ID de l'annonce créée
     const adId = window.location.pathname.match(/\/items\/(\d+)/)
     ↓
7. Réponse remontée au Next.js
     { success: true, adId: '12345' }
     ↓
8. Next.js sauvegarde en DB
     prisma.listing.create({...})
```

## 🛠️ Outils de Développement

### Debug Console Logs

**Background:**
```
chrome://extensions → Inspecter "service worker"
```

**Content Script:**
```
F12 sur la page → Console
Filtrer par "[Annoncify]"
```

**Popup:**
```
Clic droit sur icône → Inspecter
```

### Network Monitoring

Surveiller les appels à l'API Next.js:
```typescript
// Dans background/index.ts
console.log('[Background] Syncing to server:', payload)
```

### Storage Inspection

```javascript
// Dans DevTools Console
chrome.storage.local.get(null, (data) => {
  console.log('Storage:', data)
})
```

## 🧪 Testing Strategy

### Unit Tests (À implémenter)
```typescript
// platforms/vinted.test.ts
describe('VintedAdapter', () => {
  it('should detect vinted.fr', () => {
    // Mock window.location
    // Test detect()
  })

  it('should extract ad ID from URL', () => {
    // Test extractNumber()
  })
})
```

### Integration Tests
1. Charger l'extension en mode dev
2. Naviguer vers Vinted
3. Vérifier détection dans popup
4. Envoyer commande CREATE_AD
5. Vérifier formulaire rempli

### E2E Tests (Puppeteer)
```typescript
const browser = await puppeteer.launch({
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`
  ]
})
```

## 📈 Améliorations Futures

### Phase 2
- [ ] Queue de tâches persistante
- [ ] Retry automatique des échecs
- [ ] Détection de CAPTCHAs
- [ ] Gestion des sessions
- [ ] Rate limiting intelligent

### Phase 3
- [ ] Support eBay
- [ ] Support Facebook Marketplace
- [ ] Support Etsy
- [ ] Export/Import en masse
- [ ] Analytics dashboard

### Phase 4
- [ ] ML pour optimiser les titres/descriptions
- [ ] Auto-pricing basé sur le marché
- [ ] Auto-réponse aux messages courants
- [ ] Détection automatique de vente

## 🤝 Contribution

Pour ajouter une nouvelle plateforme, voir `GETTING_STARTED.md` section "Ajouter une Nouvelle Plateforme".

---

**Architecture by Annoncify Team** - Modular, Scalable, Maintainable
