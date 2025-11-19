import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { FormFieldConfigList } from './form-field-config-list'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function FormFieldsPage() {
  // Fetch all form field configurations
  const configs = await prisma.formFieldConfig.findMany({
    orderBy: [{ platform: 'asc' }, { categoryId: 'asc' }],
  })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Form Field Configurations</h1>
          <p className="text-brand-gray-400 mt-2">
            Manage dynamic form fields for each category/platform combination
          </p>
        </div>
        <Link
          href="/admin/form-fields/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-yellow-400 text-brand-gray-900 font-medium hover:bg-brand-yellow-500 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Configuration
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurations</CardTitle>
          <CardDescription>
            Form field configurations determine which fields are shown when creating listings for
            specific categories on specific platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormFieldConfigList configs={configs} />
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="mt-6 p-6 rounded-lg bg-brand-gray-900 border border-brand-gray-800">
        <h3 className="text-lg font-semibold text-white mb-2">How it works</h3>
        <div className="space-y-2 text-sm text-brand-gray-400">
          <p>
            • Each configuration defines the custom fields for a specific{' '}
            <span className="text-brand-yellow-400">(category + platform)</span> combination
          </p>
          <p>
            • When a user creates a listing and selects a category, the app will show the
            corresponding custom fields
          </p>
          <p>
            • The Chrome extension uses these configurations to auto-fill forms on each platform
          </p>
          <p>
            • Field types: text, number, select, combobox, date, textarea, checkbox, radio
          </p>
        </div>
      </div>
    </div>
  )
}
