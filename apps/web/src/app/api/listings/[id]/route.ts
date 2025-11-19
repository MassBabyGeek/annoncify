import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'

/**
 * DELETE endpoint pour supprimer une annonce
 * DELETE /api/listings/[id]
 *
 * Permissions:
 * - Utilisateur normal: peut supprimer ses propres annonces
 * - Admin: peut supprimer n'importe quelle annonce
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API] DELETE /api/listings/[id] - Start')

    // Vérifier l'authentification
    const user = await currentUser()
    if (!user) {
      console.log('[API] No user found - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Trouver l'utilisateur dans la DB
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      console.log('[API] User not found in DB')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Récupérer l'annonce
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!listing) {
      console.log('[API] Listing not found')
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Vérifier les permissions
    const isOwner = listing.userId === dbUser.id
    const isAdmin = dbUser.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      console.log('[API] Forbidden - User is not owner or admin')
      return NextResponse.json(
        { error: 'You do not have permission to delete this listing' },
        { status: 403 }
      )
    }

    console.log(`[API] Deleting listing ${params.id} (isAdmin: ${isAdmin}, isOwner: ${isOwner})`)

    // Soft delete : mettre le status à DELETED
    await prisma.listing.update({
      where: { id: params.id },
      data: {
        status: 'DELETED',
      },
    })

    // Logger l'activité
    await prisma.userActivity.create({
      data: {
        userId: dbUser.id,
        type: 'LISTING_DELETED',
        action: `Deleted listing: ${listing.title}`,
        metadata: {
          listingId: listing.id,
          listingTitle: listing.title,
          isAdmin,
        },
      },
    })

    console.log('[API] Listing deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    console.error('[API] Listing deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint pour récupérer une annonce spécifique
 * GET /api/listings/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        publications: true,
        user: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Vérifier les permissions (owner ou admin)
    const isOwner = listing.userId === dbUser.id
    const isAdmin = dbUser.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to view this listing' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      listing,
    })
  } catch (error) {
    console.error('Listing fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
