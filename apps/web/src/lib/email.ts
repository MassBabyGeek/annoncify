import { Resend } from 'resend'
import { prisma, EmailTrigger, EmailLogStatus } from '@annoncify/database'

// Initialize Resend with API key (with fallback for build time)
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

interface EmailVariables {
  firstName?: string
  lastName?: string
  email?: string
  listingTitle?: string
  listingCount?: number | string
  subscriptionName?: string
  subscriptionEndDate?: string
  [key: string]: any
}

interface SendEmailOptions {
  userId: string
  email: string
  trigger: EmailTrigger
  variables?: EmailVariables
  campaignId?: string
}

/**
 * Replace variables in template content
 */
function replaceVariables(content: string, variables: EmailVariables): string {
  let result = content

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, String(value || ''))
  }

  return result
}

/**
 * Send an email using a template trigger
 */
export async function sendTriggeredEmail(options: SendEmailOptions) {
  try {
    const { userId, email, trigger, variables, campaignId } = options

    // Find active template for this trigger
    const template = await prisma.emailTemplate.findFirst({
      where: {
        trigger,
        status: 'ACTIVE',
      },
    })

    if (!template) {
      console.warn(`No active template found for trigger: ${trigger}`)
      return { success: false, error: 'No template found' }
    }

    // Replace variables in content
    const subject = replaceVariables(template.subject, variables || {})
    const htmlContent = replaceVariables(template.htmlContent, variables || {})
    const textContent = template.textContent
      ? replaceVariables(template.textContent, variables || {})
      : undefined

    // Create log entry
    const log = await prisma.emailLog.create({
      data: {
        userId,
        email,
        templateId: template.id,
        campaignId,
        subject,
        trigger,
        status: 'PENDING',
        metadata: variables || {},
      },
    })

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${template.fromName} <${template.fromEmail}>`,
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
      reply_to: template.replyTo || undefined,
      tags: [
        {
          name: 'trigger',
          value: trigger,
        },
        {
          name: 'template_id',
          value: template.id,
        },
      ],
    })

    if (error) {
      // Update log with error
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      })

      console.error('Failed to send email:', error)
      return { success: false, error: error.message }
    }

    // Update log with success
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    })

    return { success: true, emailId: data?.id, logId: log.id }
  } catch (error) {
    console.error('Error sending triggered email:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Send a campaign email
 */
export async function sendCampaignEmail(
  campaignId: string,
  userId: string,
  email: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) {
  try {
    // Create log entry
    const log = await prisma.emailLog.create({
      data: {
        userId,
        email,
        campaignId,
        subject,
        status: 'PENDING',
      },
    })

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Annoncify <noreply@annoncify.com>',
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
      tags: [
        {
          name: 'campaign_id',
          value: campaignId,
        },
      ],
    })

    if (error) {
      // Update log with error
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      })

      return { success: false, error: error.message }
    }

    // Update log with success
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    })

    // Update campaign stats
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        totalSent: {
          increment: 1,
        },
      },
    })

    return { success: true, emailId: data?.id, logId: log.id }
  } catch (error) {
    console.error('Error sending campaign email:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(
  email: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Annoncify <noreply@annoncify.com>',
      to: email,
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      text: textContent,
      tags: [
        {
          name: 'type',
          value: 'test',
        },
      ],
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error('Error sending test email:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Trigger email events for common user actions
 */
export const emailTriggers = {
  /**
   * Send welcome email after user registration
   */
  async userCreated(userId: string, email: string, firstName?: string) {
    return sendTriggeredEmail({
      userId,
      email,
      trigger: 'USER_CREATED',
      variables: {
        firstName: firstName || 'there',
        email,
      },
    })
  },

  /**
   * Send email when user starts a subscription
   */
  async subscriptionStarted(
    userId: string,
    email: string,
    subscriptionName: string,
    firstName?: string
  ) {
    return sendTriggeredEmail({
      userId,
      email,
      trigger: 'SUBSCRIPTION_STARTED',
      variables: {
        firstName: firstName || 'there',
        subscriptionName,
        email,
      },
    })
  },

  /**
   * Send email when subscription is cancelled
   */
  async subscriptionCancelled(
    userId: string,
    email: string,
    subscriptionName: string,
    firstName?: string
  ) {
    return sendTriggeredEmail({
      userId,
      email,
      trigger: 'SUBSCRIPTION_CANCELLED',
      variables: {
        firstName: firstName || 'there',
        subscriptionName,
        email,
      },
    })
  },

  /**
   * Send email when subscription is about to end (7 days before)
   */
  async subscriptionEnding(
    userId: string,
    email: string,
    subscriptionName: string,
    endDate: string,
    firstName?: string
  ) {
    return sendTriggeredEmail({
      userId,
      email,
      trigger: 'SUBSCRIPTION_ENDING',
      variables: {
        firstName: firstName || 'there',
        subscriptionName,
        subscriptionEndDate: endDate,
        email,
      },
    })
  },

  /**
   * Send email when listing is published
   */
  async listingPublished(
    userId: string,
    email: string,
    listingTitle: string,
    firstName?: string
  ) {
    return sendTriggeredEmail({
      userId,
      email,
      trigger: 'LISTING_PUBLISHED',
      variables: {
        firstName: firstName || 'there',
        listingTitle,
        email,
      },
    })
  },

  /**
   * Send email when listing is sold
   */
  async listingSold(
    userId: string,
    email: string,
    listingTitle: string,
    firstName?: string
  ) {
    return sendTriggeredEmail({
      userId,
      email,
      trigger: 'LISTING_SOLD',
      variables: {
        firstName: firstName || 'there',
        listingTitle,
        email,
      },
    })
  },

  /**
   * Send email when import is completed
   */
  async importCompleted(
    userId: string,
    email: string,
    platform: string,
    itemsImported: number,
    firstName?: string
  ) {
    return sendTriggeredEmail({
      userId,
      email,
      trigger: 'IMPORT_COMPLETED',
      variables: {
        firstName: firstName || 'there',
        platform,
        itemsImported: itemsImported.toString(),
        email,
      },
    })
  },

  /**
   * Send email to inactive users (30 days)
   */
  async inactiveUser(
    userId: string,
    email: string,
    listingCount: number,
    firstName?: string
  ) {
    return sendTriggeredEmail({
      userId,
      email,
      trigger: 'INACTIVE_USER',
      variables: {
        firstName: firstName || 'there',
        listingCount: listingCount.toString(),
        email,
      },
    })
  },
}
