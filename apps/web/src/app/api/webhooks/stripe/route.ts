import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@annoncify/database'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) break

        // Update user subscription
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        })

        if (!user) break

        // Determine role based on price ID
        let role = user.role
        const priceId = subscription.items.data[0]?.price.id

        if (priceId === process.env.STRIPE_PRICE_ID_STARTER) {
          role = 'STARTER'
        } else if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
          role = 'PRO'
        } else if (priceId === process.env.STRIPE_PRICE_ID_BUSINESS) {
          role = 'BUSINESS'
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            role,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            role: 'FREE',
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        })
        break
      }
    }

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        source: 'stripe',
        eventType: event.type,
        eventId: event.id,
        payload: event as any,
        processed: true,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
