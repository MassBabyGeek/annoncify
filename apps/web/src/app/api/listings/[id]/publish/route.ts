import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'

/**
 * API endpoint pour mettre à jour le statut de publication
 * POST /api/listings/:id/publish
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Trouver l'utilisateur dans la DB
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Récupérer les données
    const data = await req.json()
    const { publicationId, externalId, externalUrl, status } = data

    // Vérifier que la publication appartient à l'utilisateur
    const publication = await prisma.listingPublication.findUnique({
      where: { id: publicationId },
      include: {
        listing: true,
      },
    })

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
    }

    if (publication.listing.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mettre à jour la publication
    const updatedPublication = await prisma.listingPublication.update({
      where: { id: publicationId },
      data: {
        status: status || 'ACTIVE',
        externalId,
        externalUrl,
        publishedAt: new Date(),
        lastSyncedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      publication: updatedPublication,
    })
  } catch (error) {
    console.error('Publication update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}
