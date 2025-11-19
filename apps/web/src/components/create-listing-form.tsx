'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea } from '@annoncify/ui'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { flattenCategories } from '@annoncify/shared/categories'
import { DynamicFormFields } from './dynamic-form-fields'
import type { FormField } from '@annoncify/shared'

const PLATFORMS = [
  { id: 'VINTED', name: 'Vinted', icon: '👕' },
  { id: 'LEBONCOIN', name: 'LeBonCoin', icon: '🏠' },
  { id: 'AMAZON', name: 'Amazon', icon: '📦', disabled: true },
  { id: 'EBAY', name: 'eBay', icon: '🛍️', disabled: true },
  { id: 'FACEBOOK_MARKETPLACE', name: 'Facebook', icon: '👥', disabled: true },
]

const CONDITIONS = [
  { value: 'new', label: 'Neuf avec étiquette' },
  { value: 'like_new', label: 'Très bon état' },
  { value: 'good', label: 'Bon état' },
  { value: 'used', label: 'Satisfaisant' },
]

interface ListingFormData {
  title: string
  description: string
  price: string
  category: string
  leboncoinCategory: string
  condition: string
  location: string
  zipCode: string
  imageUrls: string[]
  platforms: string[]
}

export function CreateListingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    leboncoinCategory: '',
    condition: 'good',
    location: '',
    zipCode: '',
    imageUrls: [],
    platforms: [],
  })

  // Custom fields for selected category/platform
  const [customFields, setCustomFields] = useState<FormField[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [loadingFields, setLoadingFields] = useState(false)

  const categories = flattenCategories()

  // Load custom fields when category changes
  useEffect(() => {
    const loadCustomFields = async () => {
      if (!formData.leboncoinCategory || !formData.platforms.includes('LEBONCOIN')) {
        setCustomFields([])
        setCustomFieldValues({})
        return
      }

      setLoadingFields(true)
      try {
        const response = await fetch(
          `/api/form-fields?categoryId=${formData.leboncoinCategory}&platform=LEBONCOIN`
        )
        const data = await response.json()

        if (data.success && data.data.fields) {
          setCustomFields(data.data.fields)
        } else {
          setCustomFields([])
        }
      } catch (error) {
        console.error('Error loading custom fields:', error)
        setCustomFields([])
      } finally {
        setLoadingFields(false)
      }
    }

    loadCustomFields()
  }, [formData.leboncoinCategory, formData.platforms])

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const togglePlatform = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        alert(`Le fichier ${file.name} n'est pas une image`)
        continue
      }

      // Convertir en base64
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

    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ...newImages]
    }))

    // Reset l'input pour permettre de re-sélectionner les mêmes fichiers
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Inclure les cookies Clerk
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          customFields: customFieldValues,
        }),
      })

      if (!response.ok) {
        // Vérifier si la réponse est du JSON ou du HTML
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.message || errorData.error || 'Failed to create listing')
        } else {
          // Si c'est du HTML, c'est probablement une erreur d'authentification
          const htmlText = await response.text()
          console.error('API returned HTML (authentication error?):', htmlText.substring(0, 200))
          throw new Error(`Erreur d'authentification (${response.status}). Veuillez vous reconnecter.`)
        }
      }

      const result = await response.json()
      console.log('Listing created:', result)

      // Rediriger vers la page listings
      router.push('/fr/dashboard/listings')
      router.refresh()
    } catch (error) {
      console.error('Error creating listing:', error)
      alert(`Erreur lors de la création de l'annonce: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>
            Créez votre annonce et choisissez les plateformes de publication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titre de l'annonce *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: iPhone 13 Pro Max 256GB"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="condition">État *</Label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
                required
              >
                {CONDITIONS.map(cond => (
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
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Paris"
              />
            </div>

            <div>
              <Label htmlFor="zipCode">Code postal</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="75000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Électronique, Vêtements, Maison..."
            />
          </div>

          <div>
            <Label htmlFor="leboncoinCategory">Catégorie LeBonCoin *</Label>
            <select
              id="leboncoinCategory"
              value={formData.leboncoinCategory}
              onChange={(e) => setFormData(prev => ({ ...prev, leboncoinCategory: e.target.value }))}
              className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {'  '.repeat(cat.depth)}
                  {cat.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-brand-gray-500 mt-1">
              Cette catégorie sera utilisée pour publier automatiquement sur LeBonCoin
            </p>
          </div>

          {/* Dynamic custom fields */}
          {loadingFields && (
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-brand-gray-400" />
              <p className="text-sm text-brand-gray-400 mt-2">Chargement des champs...</p>
            </div>
          )}
          {!loadingFields && customFields.length > 0 && (
            <DynamicFormFields
              fields={customFields}
              values={customFieldValues}
              onChange={handleCustomFieldChange}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos *</CardTitle>
          <CardDescription>
            Ajoutez des photos depuis votre ordinateur (LeBonCoin exige au moins 1 photo)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="photos" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-brand-gray-700 rounded-lg hover:border-brand-yellow-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-brand-gray-500" />
                  <p className="text-sm text-brand-gray-400">
                    Cliquez pour ajouter des photos
                  </p>
                  <p className="text-xs text-brand-gray-600 mt-1">
                    JPG, PNG, WebP (max 10 photos)
                  </p>
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
            <p className="text-sm text-red-400">
              Au moins une photo est requise pour LeBonCoin
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plateformes de publication *</CardTitle>
          <CardDescription>
            Sélectionnez sur quelles plateformes vous souhaitez publier cette annonce
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                type="button"
                onClick={() => !platform.disabled && togglePlatform(platform.id)}
                disabled={platform.disabled}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${formData.platforms.includes(platform.id)
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
          disabled={loading || formData.platforms.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            'Créer l\'annonce'
          )}
        </Button>
      </div>
    </form>
  )
}
