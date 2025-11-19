'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { Download, LayoutDashboard, TrendingUp, RefreshCw } from 'lucide-react'

const iconMap = {
  import: Download,
  dashboard: LayoutDashboard,
  analytics: TrendingUp,
  auto: RefreshCw,
}

export function Features() {
  const t = useTranslations('landing.features')

  const features = [
    {
      key: 'import',
      icon: iconMap.import,
      gradient: 'from-brand-red-500 to-brand-red-600',
    },
    {
      key: 'dashboard',
      icon: iconMap.dashboard,
      gradient: 'from-brand-yellow-400 to-brand-yellow-500',
    },
    {
      key: 'analytics',
      icon: iconMap.analytics,
      gradient: 'from-brand-red-500 to-brand-yellow-400',
    },
    {
      key: 'auto',
      icon: iconMap.auto,
      gradient: 'from-brand-yellow-400 to-brand-red-500',
    },
  ]

  return (
    <section id="features" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Features Gradient Background - inversed from hero (red to yellow) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tl from-brand-red-500/20 via-brand-yellow-400/10 to-transparent" />
        <div className="absolute top-1/2 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-l from-brand-red-500/30 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-brand-yellow-400/25 to-transparent blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
            <span className="bg-gradient-to-r from-brand-red-400 via-brand-yellow-400 to-brand-red-400 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          <p className="text-lg text-brand-gray-400">{t('subtitle')}</p>
        </div>

        {/* Features grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.key}
                className="group relative overflow-hidden transition-all duration-300 hover:scale-105 border-brand-gray-800 hover:border-brand-yellow-400/30"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                />
                <CardHeader>
                  <div
                    className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-${feature.gradient.split('-')[1]}-500/20 group-hover:shadow-2xl transition-all duration-300`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">
                    {t(`${feature.key}.title` as any)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {t(`${feature.key}.description` as any)}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
