import { prisma } from '@annoncify/database'

const defaultTemplates = [
  {
    name: 'Bienvenue - Création de compte',
    subject: 'Bienvenue sur Annoncify, {{firstName}} ! 🎉',
    preheader: 'Commencez à publier vos annonces dès maintenant',
    trigger: 'USER_CREATED' as const,
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #00ff88; font-size: 32px; margin: 0;">Annoncify</h1>
    </div>

    <!-- Main Content -->
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #2a2a2a;">
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0;">
        Bienvenue {{firstName}} ! 👋
      </h2>

      <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Nous sommes ravis de vous accueillir sur Annoncify, votre plateforme de gestion d'annonces multi-plateformes.
      </p>

      <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Avec Annoncify, vous pouvez :
      </p>

      <ul style="color: #9ca3af; font-size: 16px; line-height: 1.8; margin: 0 0 30px 20px; padding: 0;">
        <li>📝 Créer des annonces une seule fois</li>
        <li>🚀 Publier sur plusieurs plateformes (LeBonCoin, Vinted, etc.)</li>
        <li>📊 Suivre vos statistiques en temps réel</li>
        <li>⚡ Gagner du temps avec l'automatisation</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://annoncify.com/dashboard" style="display: inline-block; background-color: #00ff88; color: #0a0a0a; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Créer ma première annonce
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 30px; border-top: 1px solid #2a2a2a;">
        Besoin d'aide ? Répondez simplement à cet email et notre équipe vous aidera.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        © 2025 Annoncify. Tous droits réservés.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
        <a href="{{unsubscribeUrl}}" style="color: #6b7280; text-decoration: underline;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
    textContent: `Bienvenue sur Annoncify, {{firstName}} !

Nous sommes ravis de vous accueillir sur Annoncify, votre plateforme de gestion d'annonces multi-plateformes.

Avec Annoncify, vous pouvez :
- Créer des annonces une seule fois
- Publier sur plusieurs plateformes (LeBonCoin, Vinted, etc.)
- Suivre vos statistiques en temps réel
- Gagner du temps avec l'automatisation

Créez votre première annonce : https://annoncify.com/dashboard

Besoin d'aide ? Répondez simplement à cet email et notre équipe vous aidera.`,
    status: 'ACTIVE' as const,
  },
  {
    name: 'Nouvel abonnement',
    subject: 'Merci pour votre abonnement {{subscriptionName}} ! 🎊',
    preheader: 'Profitez de toutes les fonctionnalités premium',
    trigger: 'SUBSCRIPTION_STARTED' as const,
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #2a2a2a;">
      <h2 style="color: #ffffff; margin: 0 0 20px 0;">Merci {{firstName}} ! 🎊</h2>

      <p style="color: #9ca3af; margin: 0 0 20px 0;">
        Votre abonnement <strong style="color: #00ff88;">{{subscriptionName}}</strong> est maintenant actif !
      </p>

      <p style="color: #9ca3af; margin: 0 0 30px 0;">
        Vous avez maintenant accès à toutes les fonctionnalités premium d'Annoncify.
      </p>

      <div style="text-align: center;">
        <a href="https://annoncify.com/dashboard" style="display: inline-block; background-color: #00ff88; color: #0a0a0a; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Accéder au Dashboard
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    status: 'ACTIVE' as const,
  },
  {
    name: 'Annonce publiée',
    subject: 'Votre annonce "{{listingTitle}}" est en ligne ! 🚀',
    preheader: 'Votre annonce a été publiée avec succès',
    trigger: 'LISTING_PUBLISHED' as const,
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #2a2a2a;">
      <h2 style="color: #ffffff; margin: 0 0 20px 0;">Votre annonce est en ligne ! 🚀</h2>

      <p style="color: #9ca3af; margin: 0 0 20px 0;">
        Félicitations {{firstName}} ! Votre annonce <strong style="color: #00ff88;">"{{listingTitle}}"</strong> a été publiée avec succès.
      </p>

      <p style="color: #9ca3af; margin: 0 0 30px 0;">
        Vous pouvez maintenant suivre ses performances dans votre tableau de bord.
      </p>

      <div style="text-align: center;">
        <a href="https://annoncify.com/dashboard" style="display: inline-block; background-color: #00ff88; color: #0a0a0a; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Voir mes annonces
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    status: 'ACTIVE' as const,
  },
  {
    name: 'Abonnement va expirer',
    subject: 'Votre abonnement expire dans 7 jours ⏰',
    preheader: 'Renouvelez votre abonnement pour continuer à profiter des fonctionnalités premium',
    trigger: 'SUBSCRIPTION_ENDING' as const,
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 40px; border: 1px solid #2a2a2a;">
      <h2 style="color: #ffffff; margin: 0 0 20px 0;">Votre abonnement expire bientôt ⏰</h2>

      <p style="color: #9ca3af; margin: 0 0 20px 0;">
        Bonjour {{firstName}},
      </p>

      <p style="color: #9ca3af; margin: 0 0 20px 0;">
        Votre abonnement <strong style="color: #00ff88;">{{subscriptionName}}</strong> expire le <strong>{{subscriptionEndDate}}</strong>.
      </p>

      <p style="color: #9ca3af; margin: 0 0 30px 0;">
        Renouvelez votre abonnement dès maintenant pour continuer à profiter de toutes les fonctionnalités premium.
      </p>

      <div style="text-align: center;">
        <a href="https://annoncify.com/settings/billing" style="display: inline-block; background-color: #00ff88; color: #0a0a0a; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Renouveler mon abonnement
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    status: 'ACTIVE' as const,
  },
]

async function seedEmailTemplates() {
  console.log('🌱 Seeding email templates...')

  for (const template of defaultTemplates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: {
        trigger: template.trigger,
        name: template.name,
      },
    })

    if (existing) {
      console.log(`⏭️  Template "${template.name}" already exists, skipping...`)
      continue
    }

    await prisma.emailTemplate.create({
      data: template,
    })

    console.log(`✅ Created template: ${template.name}`)
  }

  console.log('✨ Email templates seeded successfully!')
}

// Run if called directly
if (require.main === module) {
  seedEmailTemplates()
    .then(() => {
      console.log('Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error seeding templates:', error)
      process.exit(1)
    })
}

export { seedEmailTemplates }
