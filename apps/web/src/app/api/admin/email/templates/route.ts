import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'

/**
 * API endpoint to get all email templates
 * GET /api/admin/email/templates
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

    // Get all templates with stats
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            logs: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, templates })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * API endpoint to create a new email template
 * POST /api/admin/email/templates
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
      subject,
      preheader,
      htmlContent,
      textContent,
      trigger,
      delayMinutes,
      fromName,
      fromEmail,
      replyTo,
      status,
    } = body

    // Validate required fields
    if (!name || !subject || !htmlContent || !trigger) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, htmlContent, trigger' },
        { status: 400 }
      )
    }

    // Create template
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        preheader,
        htmlContent,
        textContent,
        trigger,
        delayMinutes: delayMinutes || 0,
        fromName: fromName || 'Annoncify',
        fromEmail: fromEmail || 'noreply@annoncify.com',
        replyTo,
        status: status || 'DRAFT',
      },
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}
