# @annoncify/scrapers

Package contenant les scrapers et importeurs pour différentes plateformes.

## Plateformes Supportées

### Vinted
- **Méthode**: Web scraping avec Playwright
- **Note**: Pas d'API officielle disponible
- **TODO**: Implémenter la logique de scraping complète

### LeBonCoin
- **Méthode**: Web scraping avec Playwright
- **Note**: Pas d'API officielle publique
- **TODO**: Implémenter la logique de scraping complète

### Amazon
- **Méthode**: Amazon SP-API (Selling Partner API)
- **Documentation**: https://developer-docs.amazon.com/sp-api/
- **TODO**: Implémenter l'intégration avec SP-API

### eBay
- **Méthode**: eBay Trading API / Inventory API
- **Documentation**: https://developer.ebay.com/
- **TODO**: Implémenter l'intégration avec l'API eBay

## Architecture

Chaque scraper implémente l'interface `BaseScraper`:

```typescript
interface BaseScraper {
  import(userId: string, credentials?: any): Promise<ScraperResult>
  validate(credentials?: any): Promise<boolean>
}
```

## Considérations Légales & Techniques

1. **API Officielles**: Toujours privilégier les API officielles quand disponibles
2. **Rate Limiting**: Respecter les limites d'appels API
3. **Robots.txt**: Respecter les fichiers robots.txt pour le scraping
4. **Terms of Service**: Vérifier la conformité avec les CGU de chaque plateforme
5. **RGPD**: Gérer correctement les données personnelles

## Installation

Les scrapers utilisent Playwright pour le web scraping. Pour installer les navigateurs:

```bash
npx playwright install
```

## Usage

```typescript
import { vintedScraper, amazonScraper } from '@annoncify/scrapers'

// Vinted
const result = await vintedScraper.import(userId, {
  email: 'user@example.com',
  password: 'password'
})

// Amazon
const result = await amazonScraper.import(userId, {
  clientId: 'xxx',
  clientSecret: 'xxx',
  refreshToken: 'xxx'
})
```
