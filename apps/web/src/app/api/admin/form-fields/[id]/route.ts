import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@annoncify/database'
import { isAdmin } from '@annoncify/auth/server'

// GET /api/admin/form-fields/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    const config = await prisma.formFieldConfig.findUnique({
      where: { id },
    })

    if (!config) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('Error fetching form field config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/form-fields/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const config = await prisma.formFieldConfig.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('Error updating form field config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/form-fields/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    await prisma.formFieldConfig.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting form field config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
