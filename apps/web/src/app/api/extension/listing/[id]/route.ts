import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'

/**
 * API endpoint pour récupérer les données d'une annonce
 * GET /api/extension/listing/:id
 */
export async function GET(
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

    // Récupérer l'annonce
    const listing = await prisma.listing.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Vérifier que l'annonce appartient bien à l'utilisateur
    if (listing.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Formater les données pour l'extension
    return NextResponse.json({
      success: true,
      data: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency || 'EUR',
        category: listing.category || 'other',
        leboncoinCategory: listing.leboncoinCategory || '', // Backward compatibility
        condition: listing.condition || 'used',
        images: listing.images || [],
        location: {
          city: listing.location || 'Paris',
          zipCode: listing.zipCode || '75000',
          country: 'FR',
        },
        customFields: listing.customFields || {}, // Platform-specific fields
      },
    })
  } catch (error) {
    console.error('Extension listing fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}
