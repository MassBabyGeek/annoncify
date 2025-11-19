'use client'

import { useTranslations } from 'next-intl'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@annoncify/ui'
import { Check } from 'lucide-react'
import { SignInButton } from '@annoncify/auth'

export function Pricing() {
  const t = useTranslations('landing.pricing')

  const plans = [
    { key: 'free', popular: false },
    { key: 'starter', popular: false },
    { key: 'pro', popular: true },
    { key: 'business', popular: false },
  ]

  return (
    <section id="pricing" className="relative py-20 sm:py-32 bg-brand-gray-900/50 overflow-hidden">
      {/* Pricing Gradient Background - diagonal yellow to red */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow-400/15 via-transparent to-brand-red-500/15" />
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-brand-yellow-400/30 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-brand-red-500/30 to-transparent blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[800px] bg-gradient-to-r from-brand-yellow-400/10 via-brand-red-500/10 to-brand-yellow-400/10 blur-[80px] rotate-12" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            <span className="bg-gradient-to-r from-brand-yellow-400 via-brand-red-500 to-brand-yellow-400 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          <p className="text-lg text-brand-gray-400">{t('subtitle')}</p>
        </div>

        {/* Pricing grid */}
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {plans.map((plan) => {
            const features = t.raw(`${plan.key}.features` as any) as string[]
            const isPopular = plan.popular

            return (
              <Card
                key={plan.key}
                className={`relative flex flex-col transition-all duration-300 backdrop-blur-sm ${
                  isPopular
                    ? 'scale-105 border-brand-red-500 bg-gradient-to-br from-brand-red-500/10 to-brand-yellow-400/5 shadow-2xl shadow-brand-red-500/20 lg:scale-110'
                    : 'hover:scale-105 border-brand-gray-800 hover:border-brand-yellow-400/30'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                    <Badge className="bg-gradient-to-r from-brand-yellow-400 to-brand-red-500 text-white px-4 py-1 shadow-lg shadow-brand-red-500/30">
                      {t('popularBadge')}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">
                    {t(`${plan.key}.name` as any)}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t(`${plan.key}.description` as any)}
                  </CardDescription>
                  <div className="mt-6">
                    <span className={`text-5xl font-bold ${isPopular ? 'bg-gradient-to-r from-brand-yellow-400 to-brand-red-500 bg-clip-text text-transparent' : 'text-white'}`}>
                      €{t(`${plan.key}.price` as any)}
                    </span>
                    <span className="text-brand-gray-400">{t('perMonth')}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-brand-red-500' : 'text-brand-yellow-400'}`} />
                        <span className="text-sm text-brand-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <SignInButton mode="modal">
                    <Button
                      className={`w-full ${isPopular ? 'bg-gradient-to-r from-brand-yellow-400 via-brand-red-500 to-brand-red-600 hover:shadow-xl hover:shadow-brand-red-500/40' : ''}`}
                      variant={isPopular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {t(`${plan.key}.cta` as any)}
                    </Button>
                  </SignInButton>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
