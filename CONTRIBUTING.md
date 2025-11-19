# 🤝 Contributing to Annoncify

Merci de votre intérêt pour contribuer à Annoncify ! Ce document vous guide sur comment contribuer efficacement au projet.

## 📋 Code of Conduct

En participant à ce projet, vous acceptez de respecter notre code de conduite :
- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Focalisez sur ce qui est meilleur pour la communauté

## 🚀 Comment Contribuer

### Reporting Bugs

Si vous trouvez un bug :

1. Vérifiez que le bug n'a pas déjà été reporté dans les Issues
2. Créez une nouvelle issue avec :
   - Un titre descriptif
   - Les étapes pour reproduire
   - Le comportement attendu vs actuel
   - Votre environnement (OS, Node version, etc.)
   - Screenshots si pertinent

### Proposer des Features

Pour proposer une nouvelle fonctionnalité :

1. Créez une issue avec le tag `enhancement`
2. Décrivez clairement la fonctionnalité
3. Expliquez pourquoi elle serait utile
4. Proposez une implémentation si possible

### Pull Requests

#### Setup Development

```bash
# Fork et clone le repo
git clone https://github.com/votre-username/annoncify.git
cd annoncify

# Installez les dépendances
pnpm install

# Créez une branche
git checkout -b feature/ma-nouvelle-feature
```

#### Workflow

1. **Créez une branche** depuis `main`
   - `feature/xxx` pour les nouvelles features
   - `fix/xxx` pour les bug fixes
   - `docs/xxx` pour la documentation
   - `refactor/xxx` pour le refactoring

2. **Développez votre feature**
   - Suivez les conventions de code
   - Ajoutez des tests si applicable
   - Mettez à jour la documentation

3. **Commit vos changements**
   ```bash
   git add .
   git commit -m "feat: ajout de la fonctionnalité X"
   ```

4. **Push vers votre fork**
   ```bash
   git push origin feature/ma-nouvelle-feature
   ```

5. **Créez une Pull Request**
   - Décrivez vos changements
   - Référencez les issues liées
   - Attendez la review

## 📝 Conventions de Code

### TypeScript

- Utilisez TypeScript strict mode
- Pas de `any`, utilisez `unknown` si nécessaire
- Types explicites pour les props et return values

```typescript
// ✅ Good
interface ButtonProps {
  label: string
  onClick: () => void
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

### React Components

- Utilisez functional components
- Hooks au lieu de classes
- Préférez les named exports

```typescript
// ✅ Good
export function MyComponent() {
  const [state, setState] = useState(false)
  return <div>{state}</div>
}

// ❌ Bad
export default () => {
  return <div></div>
}
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- **Types/Interfaces**: PascalCase (`UserRole`, `ListingData`)

### File Structure

```
component-name/
├── index.tsx          # Component principal
├── types.ts           # Types spécifiques
├── utils.ts           # Utilities
└── component-name.test.tsx  # Tests
```

## 🎨 Style Guide

### Tailwind CSS

- Utilisez les classes Tailwind par défaut
- Utilisez les couleurs de la palette brand
- Mobile-first (sm:, md:, lg:)

```tsx
// ✅ Good
<button className="px-4 py-2 bg-brand-red-500 text-white rounded-lg hover:bg-brand-red-600">
  Click me
</button>

// ❌ Bad (inline styles)
<button style={{ padding: '8px 16px', backgroundColor: '#ff3b3b' }}>
  Click me
</button>
```

### Imports Order

```typescript
// 1. React & Next
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { Button } from '@annoncify/ui'
import { prisma } from '@annoncify/database'

// 3. Internal imports
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'

// 4. Styles
import './styles.css'
```

## 🧪 Tests

Nous utiliserons Jest et React Testing Library (à venir).

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## 📚 Documentation

- Commentez le code complexe
- Utilisez JSDoc pour les fonctions publiques
- Mettez à jour le README si nécessaire

```typescript
/**
 * Calcule la limite mensuelle d'annonces pour un utilisateur
 * @param role - Le rôle de l'utilisateur
 * @returns Le nombre maximum d'annonces, -1 si illimité
 */
export function getListingLimit(role: UserRole): number {
  // Implementation
}
```

## 🔄 Git Commit Messages

Suivez [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: ajoute l'import depuis Vinted
fix: corrige le bug de pagination
docs: met à jour le README
style: formate le code avec Prettier
refactor: réorganise les composants UI
test: ajoute les tests pour Button
chore: met à jour les dépendances
```

## 🏗️ Architecture Decisions

Pour les changements architecturaux importants :

1. Créez une issue de discussion
2. Proposez plusieurs solutions
3. Documentez les trade-offs
4. Attendez consensus avant d'implémenter

## ❓ Questions

Si vous avez des questions :

- Ouvrez une discussion dans GitHub Discussions
- Contactez l'équipe core
- Consultez la documentation

## 🙏 Merci !

Chaque contribution compte, qu'elle soit grande ou petite. Merci de faire partie de la communauté Annoncify !
