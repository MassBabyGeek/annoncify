import { useTranslations } from 'next-intl'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { ExtensionDownload } from '@/components/landing/extension-download'
import { Pricing } from '@/components/landing/pricing'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'
import { Navbar } from '@/components/navbar'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-brand-gray-950">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ExtensionDownload />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
