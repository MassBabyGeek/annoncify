'use client'

import { Input, Label, Textarea } from '@annoncify/ui'
import type { FormField } from '@annoncify/shared'

interface Props {
  fields: FormField[]
  values: Record<string, any>
  onChange: (fieldId: string, value: any) => void
}

export function DynamicFormFields({ fields, values, onChange }: Props) {
  if (fields.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="border-t border-brand-gray-700 pt-4">
        <h3 className="text-lg font-semibold text-white mb-4">Champs spécifiques</h3>
        <div className="space-y-4">
          {fields.map((field) => (
            <DynamicField
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={(value) => onChange(field.id, value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface DynamicFieldProps {
  field: FormField
  value: any
  onChange: (value: any) => void
}

function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
            required={field.required}
          >
            <option value="">{field.placeholder || 'Sélectionnez une option'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'combobox':
        // For combobox with grouped options
        if (field.groupedOptions) {
          return (
            <select
              id={field.id}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
              required={field.required}
            >
              <option value="">{field.placeholder || 'Sélectionnez une option'}</option>
              {field.groupedOptions.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )
        }
        // Fallback to regular select
        return (
          <select
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
            required={field.required}
          >
            <option value="">{field.placeholder || 'Sélectionnez une option'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.id}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-brand-gray-700 bg-brand-gray-800"
            />
            <Label htmlFor={field.id} className="cursor-pointer !mb-0">
              {field.label}
            </Label>
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="border-brand-gray-700 bg-brand-gray-800"
                  required={field.required}
                />
                <Label
                  htmlFor={`${field.id}-${option.value}`}
                  className="cursor-pointer !mb-0"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        )

      default:
        return (
          <Input
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
    }
  }

  // Don't render label for checkbox (it's rendered inside the field)
  if (field.type === 'checkbox') {
    return <div>{renderField()}</div>
  }

  return (
    <div>
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  )
}
