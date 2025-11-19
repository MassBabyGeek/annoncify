import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'

/**
 * API endpoint to get email statistics
 * GET /api/admin/email/stats
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total counts
    const [totalTemplates, totalCampaigns, totalEmailsSent, emailsByStatus] = await Promise.all([
      prisma.emailTemplate.count(),
      prisma.emailCampaign.count(),
      prisma.emailLog.count({
        where: {
          status: {
            in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED'],
          },
        },
      }),
      prisma.emailLog.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
    ])

    // Get emails by trigger
    const emailsByTrigger = await prisma.emailLog.groupBy({
      by: ['trigger'],
      _count: {
        trigger: true,
      },
      where: {
        trigger: {
          not: null,
        },
      },
    })

    // Get recent emails (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentEmails = await prisma.emailLog.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        id: true,
        email: true,
        subject: true,
        status: true,
        trigger: true,
        createdAt: true,
        sentAt: true,
        openedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    // Calculate open rate and click rate
    const delivered = emailsByStatus.find((s) => s.status === 'DELIVERED')?._count.status || 0
    const opened = emailsByStatus.find((s) => s.status === 'OPENED')?._count.status || 0
    const clicked = emailsByStatus.find((s) => s.status === 'CLICKED')?._count.status || 0

    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0
    const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalTemplates,
        totalCampaigns,
        totalEmailsSent,
        emailsByStatus: emailsByStatus.map((s) => ({
          status: s.status,
          count: s._count.status,
        })),
        emailsByTrigger: emailsByTrigger.map((t) => ({
          trigger: t.trigger,
          count: t._count.trigger,
        })),
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        recentEmails,
      },
    })
  } catch (error) {
    console.error('Error fetching email stats:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}
