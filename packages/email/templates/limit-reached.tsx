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

interface LimitReachedEmailProps {
  firstName?: string
  currentPlan: string
  limit: number
  locale?: 'fr' | 'en'
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const LimitReachedEmail = ({
  firstName = 'there',
  currentPlan,
  limit,
  locale = 'en',
}: LimitReachedEmailProps) => {
  const content = {
    en: {
      preview: "You've reached your monthly listing limit",
      title: 'Monthly Limit Reached',
      message: `You've reached your ${currentPlan} plan limit of ${limit} listings this month.`,
      upgrade: 'Upgrade your plan to continue importing and managing more listings.',
      cta: 'Upgrade Now',
      footer: 'Your current listings remain active.',
    },
    fr: {
      preview: 'Vous avez atteint votre limite mensuelle',
      title: 'Limite mensuelle atteinte',
      message: `Vous avez atteint la limite de ${limit} annonces de votre plan ${currentPlan} ce mois-ci.`,
      upgrade: 'Passez à un plan supérieur pour continuer à importer et gérer plus d\'annonces.',
      cta: 'Mettre à niveau',
      footer: 'Vos annonces actuelles restent actives.',
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

            <Section style={warningBox}>
              <Text style={warningText}>⚠️ {t.message}</Text>
            </Section>

            <Text style={paragraph}>{t.upgrade}</Text>

            <Button style={button} href={`${baseUrl}/pricing`}>
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

export default LimitReachedEmail

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

const warningBox = {
  backgroundColor: '#78350f',
  borderLeft: '4px solid #facc15',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
}

const warningText = {
  color: '#fef9c3',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
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
