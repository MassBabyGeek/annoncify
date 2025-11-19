import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@annoncify/database'

// GET /api/form-fields?categoryId=motos&platform=LEBONCOIN
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const platform = searchParams.get('platform')

    if (!categoryId || !platform) {
      return NextResponse.json(
        { error: 'Missing categoryId or platform parameter' },
        { status: 400 }
      )
    }

    const config = await prisma.formFieldConfig.findUnique({
      where: {
        categoryId_platform: {
          categoryId,
          platform: platform as any,
        },
        active: true,
      },
    })

    if (!config) {
      return NextResponse.json({ success: true, data: { fields: [] } })
    }

    return NextResponse.json({ success: true, data: { fields: config.fields } })
  } catch (error) {
    console.error('Error fetching form fields:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
