import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { FormFieldConfigEditor } from '../form-field-config-editor'

export default function NewFormFieldConfigPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">New Form Field Configuration</h1>
        <p className="text-brand-gray-400 mt-2">
          Create a new form field configuration for a category/platform combination
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Details</CardTitle>
          <CardDescription>
            Define the custom fields that will be shown when creating listings for this
            category/platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormFieldConfigEditor />
        </CardContent>
      </Card>
    </div>
  )
}
