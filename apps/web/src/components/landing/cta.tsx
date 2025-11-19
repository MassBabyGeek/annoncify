'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@annoncify/ui'
import { ArrowRight } from 'lucide-react'
import { SignInButton } from '@annoncify/auth'

export function CTA() {
  const t = useTranslations('landing.cta')

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* CTA Gradient Background - radial burst effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-red-500/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-radial from-brand-red-500/30 via-brand-yellow-400/20 to-transparent blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-red-500 via-brand-red-600 to-brand-yellow-400 p-8 shadow-2xl shadow-brand-red-500/30 sm:p-16">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6 drop-shadow-lg">
              {t('title')}
            </h2>
            <p className="text-lg text-white/90 mb-10 drop-shadow">{t('subtitle')}</p>

            <SignInButton mode="modal">
              <Button
                size="xl"
                variant="secondary"
                className="group shadow-xl hover:shadow-2xl bg-white hover:bg-brand-yellow-50 text-brand-gray-900 relative overflow-hidden"
              >
                <span className="relative z-10">{t('button')}</span>
                <ArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-brand-yellow-200/30 to-transparent" />
              </Button>
            </SignInButton>
          </div>

          {/* Decorative elements with gradient colors */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-brand-yellow-400/40 to-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-tr from-brand-red-400/40 to-white/20 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-brand-yellow-400/30 blur-2xl animate-pulse" />
        </div>
      </div>
    </section>
  )
}
