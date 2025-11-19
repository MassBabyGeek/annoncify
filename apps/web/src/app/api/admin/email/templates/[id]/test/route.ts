import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'
import { sendTestEmail } from '@/lib/email'

/**
 * API endpoint to send a test email
 * POST /api/admin/email/templates/[id]/test
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Get template
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Replace variables with test data
    const testVariables = {
      firstName: 'John',
      lastName: 'Doe',
      email: email,
      listingTitle: 'Test Listing',
      listingCount: '5',
      subscriptionName: 'Pro Plan',
      subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
        'fr-FR'
      ),
      platform: 'LeBonCoin',
      itemsImported: '10',
    }

    let subject = template.subject
    let htmlContent = template.htmlContent
    let textContent = template.textContent || undefined

    // Replace variables
    for (const [key, value] of Object.entries(testVariables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      subject = subject.replace(regex, value)
      htmlContent = htmlContent.replace(regex, value)
      if (textContent) {
        textContent = textContent.replace(regex, value)
      }
    }

    // Send test email
    const result = await sendTestEmail(email, subject, htmlContent, textContent)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: result.emailId })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    )
  }
}
