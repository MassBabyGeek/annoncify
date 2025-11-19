'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@annoncify/ui'
import { useAuth, SignInButton, UserButton } from '@annoncify/auth'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const t = useTranslations('nav')
  const { isSignedIn } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-brand-gray-800/50 bg-brand-gray-950/80 backdrop-blur-xl">
      {/* Subtle top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-yellow-400/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-brand-yellow-400 via-brand-red-500 to-brand-yellow-400 bg-clip-text text-transparent hover:from-brand-red-500 hover:via-brand-yellow-400 hover:to-brand-red-500 transition-all duration-300">
              Annoncify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="#features"
              className="text-sm font-medium text-brand-gray-300 transition-colors hover:text-white"
            >
              {t('features')}
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-brand-gray-300 transition-colors hover:text-white"
            >
              {t('pricing')}
            </Link>
            {isSignedIn && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-brand-gray-300 transition-colors hover:text-white"
              >
                {t('dashboard')}
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost">{t('signIn')}</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button>{t('signUp')}</Button>
                </SignInButton>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-lg p-2 text-brand-gray-400 hover:bg-brand-gray-800 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-gray-800 bg-brand-gray-900">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="#features"
              className="block rounded-lg px-3 py-2 text-base font-medium text-brand-gray-300 hover:bg-brand-gray-800 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('features')}
            </Link>
            <Link
              href="#pricing"
              className="block rounded-lg px-3 py-2 text-base font-medium text-brand-gray-300 hover:bg-brand-gray-800 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('pricing')}
            </Link>
            {isSignedIn && (
              <Link
                href="/dashboard"
                className="block rounded-lg px-3 py-2 text-base font-medium text-brand-gray-300 hover:bg-brand-gray-800 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('dashboard')}
              </Link>
            )}
            <div className="pt-4 flex items-center space-x-3">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="flex-1">
                      {t('signIn')}
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button className="flex-1">{t('signUp')}</Button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
