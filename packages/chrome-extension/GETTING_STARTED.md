# 🚀 Guide de Démarrage Rapide - Annoncify Extension

## Installation en 5 Minutes

### 1. Installer les dépendances

```bash
cd packages/chrome-extension
pnpm install
```

### 2. Créer les icons (placeholder)

Créez 3 fichiers PNG dans `public/icons/`:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

Ou utilisez des placeholders en attendant vos vrais icons.

### 3. Build l'extension

```bash
pnpm build
```

Cela créera un dossier `dist/` avec l'extension compilée.

### 4. Charger dans Chrome

1. Ouvrir Chrome
2. Aller à `chrome://extensions/`
3. Activer "Mode développeur" (toggle en haut à droite)
4. Cliquer "Charger l'extension non empaquetée"
5. Sélectionner `packages/chrome-extension/dist`

✅ L'extension est maintenant installée!

## Test Rapide

### Test 1: Détection de plateforme

1. Aller sur https://www.vinted.fr
2. Cliquer sur l'icône de l'extension
3. La popup devrait afficher "vinted" dans le badge

### Test 2: Création d'annonce (simulation)

```javascript
// Dans la console du site Next.js (localhost:3000)
chrome.runtime.sendMessage('VOTRE_EXTENSION_ID', {
  action: 'CREATE_AD',
  payload: {
    platform: 'vinted',
    data: {
      title: 'Test Article',
      description: 'Ceci est un test',
      price: 10,
      currency: 'EUR',
      category: 'vetements',
      location: {
        city: 'Paris',
        zipCode: '75001',
        country: 'FR'
      },
      images: []
    }
  },
  timestamp: Date.now(),
  requestId: crypto.randomUUID()
}, (response) => {
  console.log('Réponse:', response)
})
```

### Test 3: Récupération de stats

Aller sur une annonce Vinted et utiliser:

```javascript
// Dans la popup ou en envoyant un message
{
  action: 'FETCH_STATS',
  payload: { id: 'ID_DE_L_ANNONCE' }
}
```

## Développement en Mode Watch

Pour développer avec hot-reload:

```bash
pnpm dev
```

Après chaque modification:
1. Les fichiers sont recompilés automatiquement
2. Aller dans `chrome://extensions/`
3. Cliquer sur l'icône reload (🔄) de l'extension

## Structure des Fichiers Créés

```
packages/chrome-extension/
├── dist/                      # Build output (généré)
│   ├── manifest.json
│   ├── background.js
│   ├── content-vinted.js
│   ├── content-leboncoin.js
│   ├── popup.html
│   ├── popup.js
│   ├── options.html
│   └── options.js
├── src/
│   ├── platforms/
│   │   ├── base-adapter.ts    # Classe de base
│   │   ├── vinted.ts          # Adaptateur Vinted (COMPLET)
│   │   ├── leboncoin.ts       # Adaptateur LeBonCoin (COMPLET)
│   │   └── registry.ts        # Registry
│   ├── content-scripts/
│   │   ├── content-vinted.ts
│   │   └── content-leboncoin.ts
│   ├── background/
│   │   └── index.ts           # Service worker
│   ├── popup/
│   │   ├── index.tsx          # UI React
│   │   └── index.html
│   ├── options/
│   │   ├── index.tsx
│   │   └── index.html
│   ├── types/
│   │   └── index.ts           # Types TypeScript
│   └── manifest.json
├── webpack.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Prochaines Étapes

### Ajouter Facebook Marketplace

1. Créer `src/platforms/facebook.ts`
2. Implémenter `FacebookMarketplaceAdapter extends BasePlatformAdapter`
3. Créer `src/content-scripts/content-facebook.ts`
4. Ajouter dans `manifest.json`:
   ```json
   {
     "matches": ["https://www.facebook.com/*"],
     "js": ["content-facebook.js"]
   }
   ```
5. Mettre à jour webpack.config.js

### Créer l'API Next.js

```typescript
// apps/web/src/app/api/extension/sync/route.ts
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const data = await req.json()

  // Traiter stats, messages, etc.
  // Sauvegarder en base de données

  return Response.json({ success: true })
}
```

### Envoyer des commandes depuis Next.js

```typescript
// Dans votre app Next.js
const EXTENSION_ID = 'chrome-extension://YOUR_ID'

// Créer une annonce
const response = await chrome.runtime.sendMessage(EXTENSION_ID, {
  action: 'CREATE_AD',
  payload: { platform: 'vinted', data: {...} },
  timestamp: Date.now(),
  requestId: crypto.randomUUID()
})
```

## Debugging

### Logs Background

`chrome://extensions/` → Inspecter "service worker"

### Logs Content Script

F12 sur la page → Console

### Logs Popup

Clic droit sur popup → Inspecter

## FAQ

**Q: L'extension ne détecte pas la plateforme?**
A: Vérifier que les selectors DOM dans `vinted.ts` ou `leboncoin.ts` sont à jour.

**Q: Les photos ne s'uploadent pas?**
A: Vérifier que les images sont en format base64 valide ou que les URLs sont accessibles.

**Q: Le messaging avec Next.js ne fonctionne pas?**
A: Vérifier que l'URL est dans `externally_connectable` du manifest.

## Support

- Documentation complète: `README.md`
- Types TypeScript: `src/types/index.ts`
- Exemples d'adaptateurs: `src/platforms/vinted.ts`, `src/platforms/leboncoin.ts`

---

**Bon développement! 🚀**
