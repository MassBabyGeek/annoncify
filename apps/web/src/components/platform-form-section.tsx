'use client'

import { useState, useEffect } from 'react'
import { Label, Card, CardContent, CardHeader, CardTitle } from '@annoncify/ui'
import { flattenCategories } from '@annoncify/shared/categories'
import { DynamicFormFields } from './dynamic-form-fields'
import type { FormField } from '@annoncify/shared'
import { Loader2 } from 'lucide-react'

interface Props {
  platform: string
  categoryId: string
  customFieldValues: Record<string, any>
  onCategoryChange: (categoryId: string) => void
  onFieldsChange: (values: Record<string, any>) => void
}

export function PlatformFormSection({
  platform,
  categoryId,
  customFieldValues,
  onCategoryChange,
  onFieldsChange,
}: Props) {
  const [customFields, setCustomFields] = useState<FormField[]>([])
  const [loading, setLoading] = useState(false)
  const categories = flattenCategories()

  // Load custom fields when category changes
  useEffect(() => {
    const loadFields = async () => {
      if (!categoryId) {
        setCustomFields([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `/api/form-fields?categoryId=${categoryId}&platform=${platform}`
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
        setLoading(false)
      }
    }

    loadFields()
  }, [categoryId, platform])

  const platformNames: Record<string, string> = {
    LEBONCOIN: 'LeBonCoin',
    VINTED: 'Vinted',
    EBAY: 'eBay',
    FACEBOOK_MARKETPLACE: 'Facebook Marketplace',
  }

  const platformIcons: Record<string, string> = {
    LEBONCOIN: '🏠',
    VINTED: '👕',
    EBAY: '🛍️',
    FACEBOOK_MARKETPLACE: '👥',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{platformIcons[platform]}</span>
          {platformNames[platform] || platform}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div>
          <Label htmlFor={`category-${platform}`}>
            Catégorie {platformNames[platform]} *
          </Label>
          <select
            id={`category-${platform}`}
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {'  '.repeat(cat.depth)}
                {cat.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-brand-gray-500 mt-1">
            Les champs spécifiques s'afficheront selon la catégorie choisie
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-brand-gray-400" />
            <p className="text-sm text-brand-gray-400 mt-2">Chargement des champs...</p>
          </div>
        )}

        {/* Custom Fields */}
        {!loading && categoryId && customFields.length > 0 && (
          <DynamicFormFields
            fields={customFields}
            values={customFieldValues}
            onChange={(fieldId, value) => {
              onFieldsChange({
                ...customFieldValues,
                [fieldId]: value,
              })
            }}
          />
        )}

        {/* No fields message */}
        {!loading && categoryId && customFields.length === 0 && (
          <div className="text-center py-4 text-sm text-brand-gray-500 border border-dashed border-brand-gray-700 rounded-md">
            Aucun champ spécifique pour cette catégorie sur {platformNames[platform]}
          </div>
        )}

        {/* No category selected */}
        {!categoryId && (
          <div className="text-center py-4 text-sm text-brand-gray-500">
            Sélectionnez une catégorie pour voir les champs spécifiques
          </div>
        )}
      </CardContent>
    </Card>
  )
}
