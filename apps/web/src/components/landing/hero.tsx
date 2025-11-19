'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@annoncify/ui'
import { ArrowRight, Sparkles } from 'lucide-react'
import { SignInButton } from '@annoncify/auth'

export function Hero() {
  const t = useTranslations('landing.hero')

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
      {/* Hero Gradient Background */}
      <div className="absolute inset-0 -z-10">
        {/* Main gradient: elegant yellow to red */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow-400/30 via-brand-red-500/20 to-brand-red-600/30" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-brand-yellow-400/40 to-transparent blur-[100px] animate-pulse" />
        <div className="absolute top-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-brand-red-500/40 to-transparent blur-[120px] animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-brand-yellow-400/20 via-brand-red-500/20 to-transparent blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge with gradient border */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-yellow-400/30 bg-gradient-to-r from-brand-yellow-400/10 to-brand-red-500/10 px-4 py-2 text-sm font-medium text-brand-yellow-400 backdrop-blur-sm animate-fade-in-up shadow-lg shadow-brand-yellow-400/20">
            <Sparkles className="h-4 w-4" />
            <span className="bg-gradient-to-r from-brand-yellow-400 to-brand-red-400 bg-clip-text text-transparent font-semibold">
              Centralize all your online listings
            </span>
          </div>

          {/* Title with gradient text */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in-up [animation-delay:100ms]">
            <span className="bg-gradient-to-r from-white via-brand-yellow-100 to-white bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-lg leading-8 text-brand-gray-300 sm:text-xl lg:text-2xl animate-fade-in-up [animation-delay:200ms]">
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up [animation-delay:300ms]">
            <SignInButton mode="modal">
              <Button size="xl" className="group relative overflow-hidden bg-gradient-to-r from-brand-yellow-400 via-brand-red-500 to-brand-red-600 hover:shadow-2xl hover:shadow-brand-red-500/50 transition-all duration-300">
                <span className="relative z-10">{t('cta')}</span>
                <ArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                {/* Animated shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Button>
            </SignInButton>
            <Button size="xl" variant="outline" asChild className="border-brand-yellow-400/30 hover:bg-brand-yellow-400/10 hover:border-brand-yellow-400/50">
              <a href="#pricing">{t('secondaryCta')}</a>
            </Button>
          </div>

          {/* Platform logos */}
          <div className="mt-16 animate-fade-in-up [animation-delay:400ms]">
            <p className="mb-6 text-sm font-medium uppercase tracking-wide bg-gradient-to-r from-brand-gray-500 via-brand-yellow-400/60 to-brand-gray-500 bg-clip-text text-transparent">
              Import from your favorite platforms
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
              <div className="flex h-12 items-center justify-center rounded-lg bg-white px-6 text-lg font-bold text-gray-900">
                Vinted
              </div>
              <div className="flex h-12 items-center justify-center rounded-lg bg-white px-6 text-lg font-bold text-gray-900">
                LeBonCoin
              </div>
              <div className="flex h-12 items-center justify-center rounded-lg bg-white px-6 text-lg font-bold text-gray-900">
                eBay
              </div>
              <div className="flex h-12 items-center justify-center rounded-lg bg-white px-6 text-lg font-bold text-gray-900">
                Amazon
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
