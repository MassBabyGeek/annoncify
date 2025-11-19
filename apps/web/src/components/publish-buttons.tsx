'use client'

import { Button } from '@annoncify/ui'
import { Share2, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface ListingPublication {
  id: string
  platform: string
  status: string
  externalId?: string | null
  publishedAt?: Date | null
}

interface Listing {
  id: string
  publications: ListingPublication[]
}

interface PublishButtonsProps {
  listing: Listing
}

const PLATFORMS = [
  { id: 'VINTED', name: 'Vinted', icon: '👕' },
  { id: 'LEBONCOIN', name: 'LeBonCoin', icon: '🏠' },
]

export function PublishButtons({ listing }: PublishButtonsProps) {
  const [publishing, setPublishing] = useState<string | null>(null)

  const handlePublish = async (platform: string) => {
    try {
      setPublishing(platform)

      // Vérifier que la publication existe
      const publication = listing.publications.find((p) => p.platform === platform)
      if (!publication) {
        alert('Cette plateforme n\'est pas configurée pour cette annonce')
        return
      }

      // Envoyer un message à l'extension Chrome
      const message = {
        action: 'PUBLISH_LISTING',
        payload: {
          listingId: listing.id,
          publicationId: publication.id,
          platform: platform.toLowerCase(),
          apiUrl: window.location.origin,
        },
        timestamp: Date.now(),
        requestId: crypto.randomUUID(),
      }

      // Vérifier que l'extension est installée
      if (!window.chrome?.runtime) {
        alert(
          "L'extension Chrome Annoncify n'est pas installée. Veuillez l'installer pour publier vos annonces."
        )
        return
      }

      // Envoyer le message à l'extension
      window.postMessage(
        {
          type: 'ANNONCIFY_PUBLISH',
          ...message,
        },
        '*'
      )

      alert(
        `Publication sur ${platform} en cours... L'extension va ouvrir un nouvel onglet et remplir automatiquement le formulaire.`
      )
    } catch (error) {
      console.error('Publish error:', error)
      alert('Erreur lors de la publication')
    } finally {
      setPublishing(null)
    }
  }

  // Filtrer les plateformes qui ne sont pas encore publiées (status DRAFT)
  const availablePlatforms = PLATFORMS.filter((platform) => {
    const publication = listing.publications.find((p) => p.platform === platform.id)
    return publication && publication.status === 'DRAFT'
  })

  if (availablePlatforms.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <CheckCircle className="h-4 w-4" />
        <span>Publié sur toutes les plateformes</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-brand-gray-500 mb-2">Publier sur :</p>
      <div className="flex gap-2 flex-wrap">
        {availablePlatforms.map((platform) => (
          <Button
            key={platform.id}
            size="sm"
            variant="outline"
            onClick={() => handlePublish(platform.id)}
            disabled={publishing !== null}
            className="flex-1 min-w-[120px]"
          >
            {publishing === platform.id ? (
              'Publication...'
            ) : (
              <>
                <Share2 className="h-3 w-3 mr-1" />
                <span className="mr-1">{platform.icon}</span>
                {platform.name}
              </>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
