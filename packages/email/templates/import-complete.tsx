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

interface ImportCompleteEmailProps {
  firstName?: string
  platform: string
  itemsImported: number
  itemsFailed: number
  locale?: 'fr' | 'en'
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const ImportCompleteEmail = ({
  firstName = 'there',
  platform,
  itemsImported,
  itemsFailed,
  locale = 'en',
}: ImportCompleteEmailProps) => {
  const content = {
    en: {
      preview: `Your ${platform} import is complete`,
      title: `Import Complete!`,
      success: `Successfully imported ${itemsImported} listing${itemsImported > 1 ? 's' : ''} from ${platform}`,
      failed: itemsFailed > 0 ? `${itemsFailed} item${itemsFailed > 1 ? 's' : ''} failed to import` : null,
      cta: 'View Your Listings',
      footer: 'Need help? Contact our support team.',
    },
    fr: {
      preview: `Votre import ${platform} est terminé`,
      title: `Import terminé !`,
      success: `${itemsImported} annonce${itemsImported > 1 ? 's' : ''} importée${itemsImported > 1 ? 's' : ''} depuis ${platform}`,
      failed:
        itemsFailed > 0
          ? `${itemsFailed} élément${itemsFailed > 1 ? 's' : ''} n'${itemsFailed > 1 ? 'ont' : 'a'} pas pu être importé${itemsFailed > 1 ? 's' : ''}`
          : null,
      cta: 'Voir vos annonces',
      footer: "Besoin d'aide ? Contactez notre support.",
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

            <Section style={statsBox}>
              <Text style={successText}>✓ {t.success}</Text>
              {t.failed && <Text style={errorText}>⚠ {t.failed}</Text>}
            </Section>

            <Button style={button} href={`${baseUrl}/dashboard/listings`}>
              {t.cta}
            </Button>

            <Text style={paragraph}>{t.footer}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>Annoncify</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ImportCompleteEmail

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

const statsBox = {
  backgroundColor: '#1a202c',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
}

const successText = {
  color: '#10b981',
  fontSize: '16px',
  fontWeight: '600',
  margin: '8px 0',
}

const errorText = {
  color: '#ef4444',
  fontSize: '16px',
  fontWeight: '600',
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
