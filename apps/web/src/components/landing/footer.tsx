'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function Footer() {
  const t = useTranslations('landing.footer')

  const footerLinks = {
    product: [
      { label: t('features'), href: '#features' },
      { label: t('pricing'), href: '#pricing' },
    ],
    company: [
      { label: t('about'), href: '/about' },
      { label: t('contact'), href: '/contact' },
    ],
    legal: [
      { label: t('privacy'), href: '/privacy' },
      { label: t('terms'), href: '/terms' },
    ],
  }

  return (
    <footer className="relative border-t border-brand-gray-800 bg-brand-gray-900 overflow-hidden">
      {/* Footer gradient background - subtle bottom glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-red-500/30 to-transparent" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[400px] rounded-full bg-gradient-to-t from-brand-yellow-400/10 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[400px] rounded-full bg-gradient-to-t from-brand-red-500/10 to-transparent blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-yellow-400 to-brand-red-500 bg-clip-text text-transparent group-hover:from-brand-red-500 group-hover:to-brand-yellow-400 transition-all duration-300">
                Annoncify
              </span>
            </Link>
            <p className="text-sm text-brand-gray-400">{t('tagline')}</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('product')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('company')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('legal')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-gray-800 pt-8">
          <p className="text-center text-sm text-brand-gray-400">
            © {new Date().getFullYear()} Annoncify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
