import { GeistSans } from 'geist/font/sans'
import { ClerkProvider } from '@annoncify/auth'
import './globals.css'

export const metadata = {
  title: 'Annoncify - Centralize All Your Listings',
  description:
    'Manage Vinted, LeBonCoin, eBay, and more from one powerful dashboard. Annoncify helps you centralize all your online listings.',
  keywords: ['listings', 'vinted', 'leboncoin', 'ebay', 'amazon', 'marketplace', 'centralize'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={GeistSans.variable}>
        <body className="min-h-screen bg-brand-gray-950 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
