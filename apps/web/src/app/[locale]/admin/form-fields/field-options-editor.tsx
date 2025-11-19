'use client'

import { useState } from 'react'
import { Button, Input, Label } from '@annoncify/ui'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { FieldOption } from '@annoncify/shared'

interface Props {
  options: FieldOption[]
  onChange: (options: FieldOption[]) => void
  grouped?: boolean
}

export function FieldOptionsEditor({ options, onChange, grouped = false }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addOption = () => {
    const newOption: FieldOption = {
      value: '',
      label: '',
    }
    onChange([...options, newOption])
    setEditingIndex(options.length)
  }

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], ...updates }
    onChange(newOptions)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-white">
          Options {grouped ? '(Simple list - use JSON for grouped)' : ''}
        </Label>
        <Button type="button" size="sm" variant="ghost" onClick={addOption}>
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>

      {options.length === 0 ? (
        <div className="text-center py-4 text-sm text-brand-gray-500 border border-dashed border-brand-gray-700 rounded-md">
          No options yet. Click "Add Option" to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {options.map((option, index) => (
            <div
              key={index}
              className="p-3 rounded-md bg-brand-gray-800 border border-brand-gray-700"
            >
              <div className="flex items-start gap-2">
                <GripVertical className="h-5 w-5 text-brand-gray-500 mt-2 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`option-${index}-value`} className="text-xs">
                        Value (ID) *
                      </Label>
                      <Input
                        id={`option-${index}-value`}
                        value={option.value}
                        onChange={(e) => updateOption(index, { value: e.target.value })}
                        placeholder="e.g., honda"
                        className="h-8 text-sm"
                        required
                      />
                      <p className="text-xs text-brand-gray-500 mt-0.5">
                        Value sent to backend
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`option-${index}-label`} className="text-xs">
                        Label (Display) *
                      </Label>
                      <Input
                        id={`option-${index}-label`}
                        value={option.label}
                        onChange={(e) => updateOption(index, { label: e.target.value })}
                        placeholder="e.g., Honda"
                        className="h-8 text-sm"
                        required
                      />
                      <p className="text-xs text-brand-gray-500 mt-0.5">
                        Text shown to user
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  {option.value && option.label && (
                    <div className="text-xs text-brand-gray-400 bg-brand-gray-900 p-2 rounded">
                      Preview: <span className="text-white">{option.label}</span> → sends{' '}
                      <code className="text-brand-yellow-400">{option.value}</code>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeOption(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {options.length > 0 && (
        <div className="text-xs text-brand-gray-500 flex items-center gap-2">
          <span>{options.length} option(s) defined</span>
          {options.some((o) => !o.value || !o.label) && (
            <span className="text-yellow-500">⚠ Some options are incomplete</span>
          )}
        </div>
      )}
    </div>
  )
}
