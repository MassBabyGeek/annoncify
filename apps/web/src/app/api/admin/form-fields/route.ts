import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@annoncify/database'
import { isAdmin } from '@annoncify/auth/server'

// GET /api/admin/form-fields
export async function GET(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const configs = await prisma.formFieldConfig.findMany({
      orderBy: [{ platform: 'asc' }, { categoryId: 'asc' }],
    })

    return NextResponse.json({ success: true, data: configs })
  } catch (error) {
    console.error('Error fetching form field configs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/form-fields
export async function POST(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { categoryId, platform, fields, name, description, active = true } = body

    // Validation
    if (!categoryId || !platform || !fields || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: categoryId, platform, fields, name' },
        { status: 400 }
      )
    }

    // Check if configuration already exists
    const existing = await prisma.formFieldConfig.findUnique({
      where: {
        categoryId_platform: {
          categoryId,
          platform,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Configuration already exists for this category/platform combination' },
        { status: 409 }
      )
    }

    const config = await prisma.formFieldConfig.create({
      data: {
        categoryId,
        platform,
        fields,
        name,
        description,
        active,
      },
    })

    return NextResponse.json({ success: true, data: config }, { status: 201 })
  } catch (error) {
    console.error('Error creating form field config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
