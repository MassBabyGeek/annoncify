'use client'

import { Button } from '@annoncify/ui'
import { Download, Chrome, CheckCircle2 } from 'lucide-react'
import { ExtensionStatus } from '@/components/extension-status'

export function ExtensionDownload() {
  return (
    <section id="download-extension" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-yellow-400/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-radial from-brand-yellow-400/20 to-transparent blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-yellow-400/30 bg-brand-yellow-400/10 px-4 py-2 text-sm font-medium text-brand-yellow-400 mb-6">
              <Chrome className="h-4 w-4" />
              Extension Chrome
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-4">
              Téléchargez l'extension Chrome
            </h2>
            <p className="text-lg text-brand-gray-300">
              Publiez vos annonces automatiquement sur Vinted, LeBonCoin et plus encore
            </p>
          </div>

          {/* Extension Status */}
          <div className="mb-8">
            <ExtensionStatus showInstallButton={false} />
          </div>

          {/* Download Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-gray-800 to-brand-gray-900 border border-brand-gray-700 p-8">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />

            <div className="relative">
              <div className="flex items-start gap-6 mb-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-yellow-400 to-brand-red-500 flex items-center justify-center shadow-lg shadow-brand-yellow-400/20">
                  <Chrome className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Annoncify Extension
                  </h3>
                  <p className="text-brand-gray-400">
                    Version 1.0.0 • Compatible avec Chrome, Edge et Brave
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  'Publication automatique sur toutes les plateformes',
                  'Synchronisation en temps réel avec votre dashboard',
                  'Gestion des messages et notifications',
                  'Interface simple et intuitive'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-brand-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Download button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="group flex-1 bg-gradient-to-r from-brand-yellow-400 via-brand-red-500 to-brand-red-600 hover:shadow-xl hover:shadow-brand-red-500/30 transition-all duration-300"
                  asChild
                >
                  <a href="/extension/annoncify-extension.zip" download>
                    <Download className="h-5 w-5 mr-2 transition-transform group-hover:translate-y-1" />
                    Télécharger l'extension
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-brand-gray-600 hover:bg-brand-gray-800"
                  asChild
                >
                  <a href="/docs/extension-installation" target="_blank" rel="noopener noreferrer">
                    Guide d'installation
                  </a>
                </Button>
              </div>

              {/* Info note */}
              <div className="mt-6 p-4 rounded-lg bg-brand-gray-800/50 border border-brand-gray-700">
                <p className="text-sm text-brand-gray-400">
                  <strong className="text-brand-gray-300">Note :</strong> L'extension nécessite un compte Annoncify actif.
                  Après l'installation, connectez-vous avec vos identifiants dans le popup de l'extension.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
