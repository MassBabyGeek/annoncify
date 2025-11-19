import { notFound } from 'next/navigation'
import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { FormFieldConfigEditor } from '../form-field-config-editor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditFormFieldConfigPage({ params }: Props) {
  const { id } = await params

  const config = await prisma.formFieldConfig.findUnique({
    where: { id },
  })

  if (!config) {
    notFound()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Form Field Configuration</h1>
        <p className="text-brand-gray-400 mt-2">
          Update the form field configuration for {config.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Details</CardTitle>
          <CardDescription>
            Modify the custom fields for this category/platform combination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormFieldConfigEditor
            initialConfig={{
              id: config.id,
              categoryId: config.categoryId,
              platform: config.platform,
              name: config.name,
              description: config.description,
              fields: config.fields as any,
              active: config.active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
