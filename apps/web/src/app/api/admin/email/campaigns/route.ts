import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'
import { sendCampaignEmail } from '@/lib/email'

/**
 * API endpoint to get all email campaigns
 * GET /api/admin/email/campaigns
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

    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            logs: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, campaigns })
  } catch (error) {
    console.error('Error fetching email campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * API endpoint to create and send an email campaign
 * POST /api/admin/email/campaigns
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const {
      name,
      description,
      targetRole,
      targetUserIds,
      templateId,
      subject,
      htmlContent,
      textContent,
      scheduledAt,
      sendNow,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })
    }

    if (!templateId && (!subject || !htmlContent)) {
      return NextResponse.json(
        { error: 'Either templateId or (subject and htmlContent) is required' },
        { status: 400 }
      )
    }

    // Get target users
    let targetUsers
    if (targetUserIds && targetUserIds.length > 0) {
      // Specific users
      targetUsers = await prisma.user.findMany({
        where: {
          id: {
            in: targetUserIds,
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      })
    } else if (targetRole) {
      // Filter by role
      targetUsers = await prisma.user.findMany({
        where: {
          role: targetRole,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      })
    } else {
      // All users
      targetUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      })
    }

    // Create campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        description,
        targetRole,
        targetUserIds: targetUserIds || [],
        templateId,
        subject,
        htmlContent,
        textContent,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        totalRecipients: targetUsers.length,
        status: sendNow ? 'ACTIVE' : 'DRAFT',
      },
    })

    // Send emails if sendNow is true
    if (sendNow) {
      let emailSubject = subject
      let emailHtmlContent = htmlContent
      let emailTextContent = textContent

      // If using template, fetch it
      if (templateId) {
        const template = await prisma.emailTemplate.findUnique({
          where: { id: templateId },
        })

        if (template) {
          emailSubject = template.subject
          emailHtmlContent = template.htmlContent
          emailTextContent = template.textContent || undefined
        }
      }

      // Send emails to all recipients
      const sendPromises = targetUsers.map(async (targetUser) => {
        // Replace variables
        const variables = {
          firstName: targetUser.firstName || 'there',
          email: targetUser.email,
        }

        let personalizedSubject = emailSubject
        let personalizedHtml = emailHtmlContent
        let personalizedText = emailTextContent

        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
          personalizedSubject = personalizedSubject.replace(regex, value)
          personalizedHtml = personalizedHtml.replace(regex, value)
          if (personalizedText) {
            personalizedText = personalizedText.replace(regex, value)
          }
        }

        return sendCampaignEmail(
          campaign.id,
          targetUser.id,
          targetUser.email,
          personalizedSubject,
          personalizedHtml,
          personalizedText
        )
      })

      await Promise.all(sendPromises)

      // Update campaign status
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: {
          sentAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Error creating email campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}
