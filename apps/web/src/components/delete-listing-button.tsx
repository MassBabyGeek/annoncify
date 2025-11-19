'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@annoncify/ui'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DeleteListingButtonProps {
  listingId: string
  listingTitle: string
}

export function DeleteListingButton({ listingId, listingTitle }: DeleteListingButtonProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.actions')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('deleteError'))
      }

      // Recharger la page pour afficher la liste mise à jour
      router.refresh()
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert(error instanceof Error ? error.message : t('deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isDeleting ? 'Suppression...' : t('delete')}
    </Button>
  )
}
