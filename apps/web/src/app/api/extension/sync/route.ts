import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'

/**
 * API endpoint pour synchroniser les données de l'extension Chrome
 * POST /api/extension/sync
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer les données de l'extension
    const data = await req.json()
    const { stats, messages, timestamp } = data

    // Trouver l'utilisateur dans la DB
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Synchroniser les statistiques
    if (stats && Array.isArray(stats)) {
      for (const stat of stats) {
        await prisma.listing.updateMany({
          where: {
            userId: dbUser.id,
            externalId: stat.id,
            platform: stat.platform.toUpperCase(),
          },
          data: {
            views: stat.views,
            favorites: stat.favorites,
            updatedAt: new Date(),
          },
        })
      }
    }

    // Synchroniser les messages (à implémenter selon votre schéma)
    if (messages && Array.isArray(messages)) {
      // TODO: Implémenter la synchronisation des messages
      console.log('Messages to sync:', messages.length)
    }

    return NextResponse.json({
      success: true,
      syncedStats: stats?.length || 0,
      syncedMessages: messages?.length || 0,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Extension sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint pour récupérer les commandes en attente
 * GET /api/extension/commands
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

    // TODO: Implémenter une table de commandes/tâches en attente
    // Pour l'instant, retourner un tableau vide
    return NextResponse.json({
      commands: [],
    })
  } catch (error) {
    console.error('Extension commands error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
