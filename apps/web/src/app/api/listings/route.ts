import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma, Platform } from '@annoncify/database'

/**
 * API endpoint pour créer une nouvelle annonce
 * POST /api/listings
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[API] POST /api/listings - Start')

    // Vérifier l'authentification
    const user = await currentUser()
    console.log('[API] User:', user?.id)

    if (!user) {
      console.log('[API] No user found - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Trouver l'utilisateur dans la DB
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })
    console.log('[API] DB User:', dbUser?.id)

    if (!dbUser) {
      console.log('[API] User not found in DB')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Récupérer les données de la requête
    const data = await req.json()
    console.log('[API] Request data:', JSON.stringify(data, null, 2))

    const {
      title,
      description,
      price,
      category,
      leboncoinCategory,
      condition,
      location,
      zipCode,
      imageUrls,
      platforms, // Array de platform IDs
      customFields, // Custom fields data
    } = data

    // Valider les données
    if (!title || !description || !price || !platforms || platforms.length === 0) {
      console.log('[API] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[API] Creating listing...')

    // Extract category from customFields if available (for backward compatibility)
    let extractedCategory = category || leboncoinCategory
    if (customFields) {
      // Try to get category from any platform
      for (const platformId of Object.keys(customFields)) {
        if (customFields[platformId]?.categoryId) {
          extractedCategory = customFields[platformId].categoryId
          break
        }
      }
    }

    // Créer l'annonce avec les publications pour chaque plateforme
    const listing = await prisma.listing.create({
      data: {
        userId: dbUser.id,
        title,
        description,
        price: parseFloat(price),
        currency: 'EUR',
        platform: platforms[0] as Platform, // Garder pour compatibilité
        category: extractedCategory,
        leboncoinCategory: customFields?.LEBONCOIN?.categoryId || leboncoinCategory,
        condition,
        location,
        zipCode,
        images: imageUrls || [],
        tags: [],
        status: 'DRAFT',
        customFields: customFields || {},
        publications: {
          create: platforms.map((platformId: string) => ({
            platform: platformId as Platform,
            status: 'DRAFT',
          })),
        },
      },
      include: {
        publications: true,
      },
    })

    console.log('[API] Listing created:', listing.id)

    return NextResponse.json({
      success: true,
      listing,
    })
  } catch (error) {
    console.error('[API] Listing creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint pour récupérer toutes les annonces de l'utilisateur
 * GET /api/listings
 */
export async function GET(req: NextRequest) {
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

    const listings = await prisma.listing.findMany({
      where: { userId: dbUser.id },
      include: {
        publications: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      listings,
    })
  } catch (error) {
    console.error('Listings fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
