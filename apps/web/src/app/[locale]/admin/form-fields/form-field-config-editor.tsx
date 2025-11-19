'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label, Textarea } from '@annoncify/ui'
import { Plus, Trash2, Save, X } from 'lucide-react'
import type { FormField, FieldType } from '@annoncify/shared'
import { FieldOptionsEditor } from './field-options-editor'

interface Props {
  initialConfig?: {
    id?: string
    categoryId: string
    platform: string
    name: string
    description: string | null
    fields: FormField[]
    active: boolean
  }
}

const FIELD_TYPES: FieldType[] = [
  'text',
  'number',
  'select',
  'combobox',
  'date',
  'textarea',
  'checkbox',
  'radio',
]

const PLATFORMS = ['LEBONCOIN', 'VINTED', 'EBAY', 'FACEBOOK_MARKETPLACE']

export function FormFieldConfigEditor({ initialConfig }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(initialConfig?.name || '')
  const [categoryId, setCategoryId] = useState(initialConfig?.categoryId || '')
  const [platform, setPlatform] = useState(initialConfig?.platform || 'LEBONCOIN')
  const [description, setDescription] = useState(initialConfig?.description || '')
  const [active, setActive] = useState(initialConfig?.active ?? true)
  const [fields, setFields] = useState<FormField[]>(initialConfig?.fields || [])

  const [editingField, setEditingField] = useState<number | null>(null)

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
    }
    setFields([...fields, newField])
    setEditingField(fields.length)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
    if (editingField === index) {
      setEditingField(null)
    }
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialConfig?.id
        ? `/api/admin/form-fields/${initialConfig.id}`
        : '/api/admin/form-fields'

      const method = initialConfig?.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId,
          platform,
          description: description || null,
          fields,
          active,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save configuration')
      }

      router.push('/admin/form-fields')
      router.refresh()
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Configuration Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., LeBonCoin - Motos"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryId">Category ID *</Label>
            <Input
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="e.g., motos"
              required
            />
            <p className="text-xs text-brand-gray-500 mt-1">
              Must match the category ID from your categories
            </p>
          </div>

          <div>
            <Label htmlFor="platform">Platform *</Label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
              required
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this configuration..."
            rows={2}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-brand-gray-700 bg-brand-gray-800"
          />
          <Label htmlFor="active" className="cursor-pointer">
            Active
          </Label>
        </div>
      </div>

      {/* Fields Editor */}
      <div className="border-t border-brand-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Form Fields</h3>
          <Button type="button" onClick={addField} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-brand-gray-500">
            No fields yet. Click "Add Field" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-brand-gray-800 border border-brand-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">
                      {field.label || field.name || `Field ${index + 1}`}
                    </h4>
                    <p className="text-sm text-brand-gray-400">
                      Type: {field.type} • {field.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setEditingField(editingField === index ? null : index)
                      }
                    >
                      {editingField === index ? (
                        <X className="h-4 w-4" />
                      ) : (
                        'Edit'
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                {editingField === index && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-brand-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`field-${index}-id`}>Field ID *</Label>
                        <Input
                          id={`field-${index}-id`}
                          value={field.id}
                          onChange={(e) => updateField(index, { id: e.target.value })}
                          placeholder="field_id"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`field-${index}-name`}>Field Name *</Label>
                        <Input
                          id={`field-${index}-name`}
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          placeholder="field_name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`field-${index}-label`}>Label *</Label>
                      <Input
                        id={`field-${index}-label`}
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="Field Label"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`field-${index}-type`}>Type *</Label>
                        <select
                          id={`field-${index}-type`}
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, { type: e.target.value as FieldType })
                          }
                          className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`field-${index}-placeholder`}>Placeholder</Label>
                        <Input
                          id={`field-${index}-placeholder`}
                          value={field.placeholder || ''}
                          onChange={(e) =>
                            updateField(index, { placeholder: e.target.value })
                          }
                          placeholder="Optional placeholder"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`field-${index}-required`}
                        checked={field.required || false}
                        onChange={(e) =>
                          updateField(index, { required: e.target.checked })
                        }
                        className="rounded border-brand-gray-700 bg-brand-gray-800"
                      />
                      <Label
                        htmlFor={`field-${index}-required`}
                        className="cursor-pointer"
                      >
                        Required field
                      </Label>
                    </div>

                    {(field.type === 'select' ||
                      field.type === 'combobox' ||
                      field.type === 'radio') && (
                      <div>
                        <FieldOptionsEditor
                          options={field.options || []}
                          onChange={(options) => updateField(index, { options })}
                          grouped={field.type === 'combobox'}
                        />

                        {field.type === 'combobox' && field.groupedOptions && (
                          <div className="mt-4 p-3 rounded-md bg-brand-gray-900 border border-brand-gray-700">
                            <Label className="text-xs text-brand-gray-400 mb-2">
                              Advanced: Grouped Options (JSON)
                            </Label>
                            <Textarea
                              value={JSON.stringify(field.groupedOptions || [], null, 2)}
                              onChange={(e) => {
                                try {
                                  const groupedOptions = JSON.parse(e.target.value)
                                  updateField(index, { groupedOptions })
                                } catch {}
                              }}
                              placeholder='[{"label":"Group 1","options":[{"value":"val","label":"Label"}]}]'
                              rows={6}
                              className="font-mono text-xs"
                            />
                            <p className="text-xs text-brand-gray-500 mt-1">
                              For grouped options like motorcycle brands with categories
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-brand-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/form-fields')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            'Saving...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
