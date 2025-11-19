'use client'

import { useState } from 'react'
import { Button } from '@annoncify/ui'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FormFieldConfig {
  id: string
  categoryId: string
  platform: string
  fields: any
  name: string
  description: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface Props {
  configs: FormFieldConfig[]
}

export function FormFieldConfigList({ configs }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return
    }

    setDeleting(id)

    try {
      const response = await fetch(`/api/admin/form-fields/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete configuration')
      }

      router.refresh()
    } catch (error) {
      console.error('Error deleting configuration:', error)
      alert('Failed to delete configuration')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/form-fields/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle active status')
      }

      router.refresh()
    } catch (error) {
      console.error('Error toggling active status:', error)
      alert('Failed to toggle active status')
    }
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-gray-400">No form field configurations yet.</p>
        <p className="text-sm text-brand-gray-500 mt-2">
          Create your first configuration to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {configs.map((config) => (
        <div
          key={config.id}
          className="flex items-center justify-between p-4 rounded-lg bg-brand-gray-800 hover:bg-brand-gray-750 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white">{config.name}</h3>
              {!config.active && (
                <span className="px-2 py-1 text-xs rounded bg-brand-gray-700 text-brand-gray-400">
                  Inactive
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-brand-gray-400">
                Category: <span className="text-white">{config.categoryId}</span>
              </p>
              <p className="text-sm text-brand-gray-400">
                Platform:{' '}
                <span className="text-white capitalize">{config.platform.toLowerCase()}</span>
              </p>
              <p className="text-sm text-brand-gray-400">
                Fields:{' '}
                <span className="text-white">
                  {Array.isArray(config.fields) ? config.fields.length : 0}
                </span>
              </p>
            </div>
            {config.description && (
              <p className="text-sm text-brand-gray-500 mt-1">{config.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleToggleActive(config.id, config.active)}
              title={config.active ? 'Deactivate' : 'Activate'}
            >
              {config.active ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/admin/form-fields/${config.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(config.id)}
              disabled={deleting === config.id}
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
