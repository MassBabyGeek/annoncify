'use client'

import { useEffect, useState } from 'react'

interface ExtensionStatus {
  installed: boolean
  version: string | null
  checking: boolean
  isOutdated: boolean
}

const CURRENT_EXTENSION_VERSION = '1.0.0'

export function useExtensionDetection(): ExtensionStatus {
  const [status, setStatus] = useState<ExtensionStatus>({
    installed: false,
    version: null,
    checking: true,
    isOutdated: false,
  })

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleMessage = (event: MessageEvent) => {
      // Vérifier que le message vient de la même fenêtre
      if (event.source !== window) return

      const { type, version } = event.data

      if (type === 'ANNONCIFY_EXTENSION_INSTALLED' || type === 'ANNONCIFY_PONG') {
        const isOutdated = version !== CURRENT_EXTENSION_VERSION
        setStatus({
          installed: true,
          version,
          checking: false,
          isOutdated,
        })

        // Nettoyer le timeout si on a reçu une réponse
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    // Écouter les messages de l'extension
    window.addEventListener('message', handleMessage)

    // Envoyer un ping à l'extension
    window.postMessage({ type: 'ANNONCIFY_PING' }, '*')

    // Timeout après 2 secondes si pas de réponse
    timeoutId = setTimeout(() => {
      setStatus((prev) => {
        // Ne mettre à jour que si on n'a pas déjà détecté l'extension
        if (!prev.installed) {
          return {
            installed: false,
            version: null,
            checking: false,
            isOutdated: false,
          }
        }
        return prev
      })
    }, 2000)

    return () => {
      window.removeEventListener('message', handleMessage)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return status
}
