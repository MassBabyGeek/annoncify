'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea } from '@annoncify/ui'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PlatformFormSection } from './platform-form-section'

const PLATFORMS = [
  { id: 'LEBONCOIN', name: 'LeBonCoin', icon: '🏠' },
  { id: 'VINTED', name: 'Vinted', icon: '👕', disabled: true },
  { id: 'EBAY', name: 'eBay', icon: '🛍️', disabled: true },
  { id: 'FACEBOOK_MARKETPLACE', name: 'Facebook', icon: '👥', disabled: true },
]

const CONDITIONS = [
  { value: 'new', label: 'Neuf avec étiquette' },
  { value: 'like_new', label: 'Très bon état' },
  { value: 'good', label: 'Bon état' },
  { value: 'used', label: 'Satisfaisant' },
]

interface PlatformData {
  categoryId: string
  fields: Record<string, any>
}

interface ListingFormData {
  title: string
  description: string
  price: string
  condition: string
  location: string
  zipCode: string
  imageUrls: string[]
  platforms: string[]
  platformsData: Record<string, PlatformData>
}

export function CreateListingFormV2() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    price: '',
    condition: 'good',
    location: '',
    zipCode: '',
    imageUrls: [],
    platforms: [],
    platformsData: {},
  })

  const togglePlatform = (platformId: string) => {
    setFormData((prev) => {
      const isRemoving = prev.platforms.includes(platformId)

      if (isRemoving) {
        // Remove platform and its data
        const { [platformId]: _, ...restPlatformsData } = prev.platformsData
        return {
          ...prev,
          platforms: prev.platforms.filter((p) => p !== platformId),
          platformsData: restPlatformsData,
        }
      } else {
        // Add platform with empty data
        return {
          ...prev,
          platforms: [...prev.platforms, platformId],
          platformsData: {
            ...prev.platformsData,
            [platformId]: {
              categoryId: '',
              fields: {},
            },
          },
        }
      }
    })
  }

  const updatePlatformCategory = (platformId: string, categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      platformsData: {
        ...prev.platformsData,
        [platformId]: {
          ...prev.platformsData[platformId],
          categoryId,
          fields: {}, // Reset fields when category changes
        },
      },
    }))
  }

  const updatePlatformFields = (platformId: string, fields: Record<string, any>) => {
    setFormData((prev) => ({
      ...prev,
      platformsData: {
        ...prev.platformsData,
        [platformId]: {
          ...prev.platformsData[platformId],
          fields,
        },
      },
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.type.startsWith('image/')) {
        alert(`Le fichier ${file.name} n'est pas une image`)
        continue
      }

      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })

      const base64 = await base64Promise
      newImages.push(base64)
    }

    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ...newImages],
    }))

    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate that all selected platforms have a category
      const missingCategories = formData.platforms.filter(
        (p) => !formData.platformsData[p]?.categoryId
      )

      if (missingCategories.length > 0) {
        alert(`Veuillez sélectionner une catégorie pour : ${missingCategories.join(', ')}`)
        setLoading(false)
        return
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          condition: formData.condition,
          location: formData.location,
          zipCode: formData.zipCode,
          imageUrls: formData.imageUrls,
          platforms: formData.platforms,
          customFields: formData.platformsData,
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || 'Failed to create listing')
        } else {
          const htmlText = await response.text()
          console.error('API returned HTML:', htmlText.substring(0, 200))
          throw new Error(`Erreur d'authentification (${response.status})`)
        }
      }

      const result = await response.json()
      console.log('Listing created:', result)

      router.push('/fr/dashboard/listings')
      router.refresh()
    } catch (error) {
      console.error('Error creating listing:', error)
      alert(`Erreur: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>Informations communes à toutes les plateformes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titre de l'annonce *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: iPhone 13 Pro Max 256GB"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre article en détail..."
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="condition">État *</Label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData((prev) => ({ ...prev, condition: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
                required
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Ville</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Paris"
              />
            </div>

            <div>
              <Label htmlFor="zipCode">Code postal</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                placeholder="75000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Photos *</CardTitle>
          <CardDescription>Ajoutez des photos depuis votre ordinateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="photos" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-brand-gray-700 rounded-lg hover:border-brand-yellow-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-brand-gray-500" />
                  <p className="text-sm text-brand-gray-400">Cliquez pour ajouter des photos</p>
                  <p className="text-xs text-brand-gray-600 mt-1">JPG, PNG, WebP (max 10 photos)</p>
                </div>
              </div>
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </Label>
          </div>

          {formData.imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.imageUrls.length === 0 && (
            <p className="text-sm text-red-400">Au moins une photo est requise</p>
          )}
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Plateformes de publication *</CardTitle>
          <CardDescription>
            Sélectionnez les plateformes sur lesquelles publier cette annonce
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => !platform.disabled && togglePlatform(platform.id)}
                disabled={platform.disabled}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    formData.platforms.includes(platform.id)
                      ? 'border-brand-yellow-400 bg-brand-yellow-400/10'
                      : 'border-brand-gray-700 hover:border-brand-gray-600'
                  }
                  ${platform.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="text-3xl mb-2">{platform.icon}</div>
                <div className="font-medium text-white">{platform.name}</div>
                {platform.disabled && (
                  <div className="text-xs text-brand-gray-500 mt-1">Bientôt disponible</div>
                )}
              </button>
            ))}
          </div>
          {formData.platforms.length === 0 && (
            <p className="text-sm text-red-400 mt-4">
              Veuillez sélectionner au moins une plateforme
            </p>
          )}
        </CardContent>
      </Card>

      {/* Platform-Specific Forms */}
      {formData.platforms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Catégories et champs spécifiques par plateforme
          </h2>
          {formData.platforms.map((platformId) => (
            <PlatformFormSection
              key={platformId}
              platform={platformId}
              categoryId={formData.platformsData[platformId]?.categoryId || ''}
              customFieldValues={formData.platformsData[platformId]?.fields || {}}
              onCategoryChange={(categoryId) => updatePlatformCategory(platformId, categoryId)}
              onFieldsChange={(fields) => updatePlatformFields(platformId, fields)}
            />
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/fr/dashboard/listings')}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading || formData.platforms.length === 0 || formData.imageUrls.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            "Créer l'annonce"
          )}
        </Button>
      </div>
    </form>
  )
}
