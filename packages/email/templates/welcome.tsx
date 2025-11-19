import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  firstName?: string
  locale?: 'fr' | 'en'
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const WelcomeEmail = ({ firstName = 'there', locale = 'en' }: WelcomeEmailProps) => {
  const content = {
    en: {
      preview: 'Welcome to Annoncify',
      title: `Welcome to Annoncify, ${firstName}!`,
      subtitle: 'Start centralizing your listings across multiple platforms',
      intro:
        "We're thrilled to have you on board. Annoncify helps you manage all your listings from Vinted, LeBonCoin, eBay, and more in one place.",
      features: [
        'Import listings from multiple platforms',
        'Manage everything from one dashboard',
        'Track performance and analytics',
        'Auto-republish expired listings',
      ],
      cta: 'Get Started',
      footer: 'Questions? Just reply to this email.',
      goodbye: 'Happy listing!',
      team: 'The Annoncify Team',
    },
    fr: {
      preview: 'Bienvenue sur Annoncify',
      title: `Bienvenue sur Annoncify, ${firstName} !`,
      subtitle: 'Commencez à centraliser vos annonces sur plusieurs plateformes',
      intro:
        "Nous sommes ravis de vous accueillir. Annoncify vous aide à gérer toutes vos annonces Vinted, LeBonCoin, eBay et plus encore depuis un seul endroit.",
      features: [
        'Importez des annonces depuis plusieurs plateformes',
        'Gérez tout depuis un tableau de bord unique',
        'Suivez les performances et statistiques',
        'Republiez automatiquement les annonces expirées',
      ],
      cta: 'Commencer',
      footer: 'Des questions ? Répondez simplement à cet email.',
      goodbye: 'Bonnes annonces !',
      team: "L'équipe Annoncify",
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

          <Section style={content}>
            <Heading as="h2" style={h2}>
              {t.title}
            </Heading>

            <Text style={paragraph}>{t.intro}</Text>

            <Section style={featuresSection}>
              {t.features.map((feature, i) => (
                <Text key={i} style={feature_item}>
                  ✓ {feature}
                </Text>
              ))}
            </Section>

            <Button style={button} href={`${baseUrl}/dashboard`}>
              {t.cta}
            </Button>

            <Text style={paragraph}>{t.footer}</Text>

            <Text style={paragraph}>
              {t.goodbye}
              <br />
              {t.team}
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Annoncify - {locale === 'fr' ? 'Vos annonces, centralisées' : 'Your listings, centralized'}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

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
  padding: '0',
}

const content = {
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

const featuresSection = {
  margin: '24px 0',
}

const feature_item = {
  color: '#e5e7eb',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
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
