import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface SubscriptionSuccessEmailProps {
  firstName?: string
  planName: string
  monthlyListings: number
  amount: number
  locale?: 'fr' | 'en'
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const SubscriptionSuccessEmail = ({
  firstName = 'there',
  planName,
  monthlyListings,
  amount,
  locale = 'en',
}: SubscriptionSuccessEmailProps) => {
  const content = {
    en: {
      preview: `Welcome to ${planName}!`,
      title: 'Subscription Confirmed!',
      message: `You're now subscribed to the ${planName} plan.`,
      features: [
        `${monthlyListings === -1 ? 'Unlimited' : monthlyListings} listings per month`,
        'Access to all platforms',
        'Advanced analytics',
        'Priority support',
      ],
      price: `€${amount}/month`,
      cta: 'Go to Dashboard',
      footer: 'You can manage your subscription anytime from your account settings.',
    },
    fr: {
      preview: `Bienvenue dans ${planName} !`,
      title: 'Abonnement confirmé !',
      message: `Vous êtes maintenant abonné au plan ${planName}.`,
      features: [
        `${monthlyListings === -1 ? 'Annonces illimitées' : monthlyListings + ' annonces'} par mois`,
        'Accès à toutes les plateformes',
        'Statistiques avancées',
        'Support prioritaire',
      ],
      price: `${amount}€/mois`,
      cta: 'Accéder au tableau de bord',
      footer: 'Vous pouvez gérer votre abonnement à tout moment depuis vos paramètres.',
    },
  }

  const t = content[locale]

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Annoncify</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading as="h2" style={h2}>
              {t.title}
            </Heading>

            <Text style={paragraph}>{t.message}</Text>

            <Section style={planBox}>
              <Text style={planName_style}>{planName}</Text>
              <Text style={priceText}>{t.price}</Text>

              <Section style={featuresList}>
                {t.features.map((feature, i) => (
                  <Text key={i} style={featureItem}>
                    ✓ {feature}
                  </Text>
                ))}
              </Section>
            </Section>

            <Button style={button} href={`${baseUrl}/dashboard`}>
              {t.cta}
            </Button>

            <Text style={mutedText}>{t.footer}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>Annoncify</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SubscriptionSuccessEmail

const main = {
  backgroundColor: '#0f1419',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#facc15',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
}

const contentSection = {
  backgroundColor: '#2d3748',
  borderRadius: '8px',
  padding: '32px',
}

const h2 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
}

const paragraph = {
  color: '#e5e7eb',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const planBox = {
  backgroundColor: '#1a202c',
  borderRadius: '8px',
  border: '2px solid #ff3b3b',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const planName_style = {
  color: '#facc15',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const priceText = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 20px',
}

const featuresList = {
  textAlign: 'left' as const,
  margin: '20px 0 0',
}

const featureItem = {
  color: '#e5e7eb',
  fontSize: '15px',
  margin: '8px 0',
}

const mutedText = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#ff3b3b',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 20px',
  margin: '24px 0',
}

const footer = {
  padding: '20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#9ca3af',
  fontSize: '14px',
}
