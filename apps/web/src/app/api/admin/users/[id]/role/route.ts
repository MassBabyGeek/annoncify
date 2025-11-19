import { NextRequest, NextResponse } from 'next/server'
import { prisma, UserRole } from '@annoncify/database'
import { isAdmin } from '@annoncify/auth/server'

// PATCH /api/admin/users/[id]/role
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
    const { role } = await request.json()

    if (!role || !Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
