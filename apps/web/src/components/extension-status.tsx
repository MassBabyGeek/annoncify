'use client'

import { useExtensionDetection } from '@/hooks/use-extension-detection'
import { AlertCircle, CheckCircle, Download, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@annoncify/ui'

interface ExtensionStatusProps {
  showInstallButton?: boolean
  compact?: boolean
}

export function ExtensionStatus({ showInstallButton = true, compact = false }: ExtensionStatusProps) {
  const { installed, version, checking, isOutdated } = useExtensionDetection()

  if (checking) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
        <Loader2 className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} animate-spin text-brand-gray-400`} />
        <span className="text-brand-gray-400">Vérification de l'extension...</span>
      </div>
    )
  }

  if (!installed) {
    return (
      <div className={`flex items-center gap-3 ${compact ? '' : 'p-4 rounded-lg bg-brand-yellow-400/10 border border-brand-yellow-400/20'}`}>
        <AlertCircle className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-brand-yellow-400 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-brand-yellow-400`}>
            Extension non installée
          </p>
          {!compact && (
            <p className="text-sm text-brand-gray-400 mt-1">
              Installez l'extension Chrome pour publier vos annonces automatiquement
            </p>
          )}
        </div>
        {showInstallButton && (
          <Link href="#download-extension">
            <Button variant="outline" size={compact ? 'sm' : 'default'}>
              <Download className="h-4 w-4 mr-2" />
              Installer
            </Button>
          </Link>
        )}
      </div>
    )
  }

  if (isOutdated) {
    return (
      <div className={`flex items-center gap-3 ${compact ? '' : 'p-4 rounded-lg bg-orange-400/10 border border-orange-400/20'}`}>
        <RefreshCw className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-orange-400 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-orange-400`}>
            Mise à jour disponible
          </p>
          {!compact && (
            <p className="text-sm text-brand-gray-400 mt-1">
              Version installée : {version} • Mettez à jour l'extension pour bénéficier des dernières fonctionnalités
            </p>
          )}
        </div>
        {showInstallButton && (
          <Link href="#download-extension">
            <Button variant="outline" size={compact ? 'sm' : 'default'}>
              <Download className="h-4 w-4 mr-2" />
              Mettre à jour
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'p-4 rounded-lg bg-green-400/10 border border-green-400/20'}`}>
      <CheckCircle className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-green-400 flex-shrink-0`} />
      <div className="flex-1">
        <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-green-400`}>
          Extension installée
        </p>
        {!compact && (
          <p className="text-sm text-brand-gray-400 mt-1">
            Version {version} • Tout est prêt pour publier vos annonces
          </p>
        )}
      </div>
    </div>
  )
}
