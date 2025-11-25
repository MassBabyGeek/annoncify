import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'

export default async function AdminSubscriptionsPage() {
  // Fetch subscription plans
  const subscriptionPlans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: 'asc' },
  })

  // Fetch users with active subscriptions
  const subscribedUsers = await prisma.user.findMany({
    where: {
      stripeSubscriptionId: {
        not: null,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = subscribedUsers.reduce((total: number, user: typeof subscribedUsers[number]) => {
    const plan = subscriptionPlans.find((p: typeof subscriptionPlans[number]) => p.stripePriceId === user.stripePriceId)
    if (plan && plan.interval === 'month') {
      return total + plan.price
    }
    return total
  }, 0)

  // Group users by role (subscription tier)
  const usersByTier = subscribedUsers.reduce(
    (acc: Record<string, number>, user: typeof subscribedUsers[number]) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate conversion rate
  const totalUsers = await prisma.user.count()
  const conversionRate = totalUsers > 0 ? ((subscribedUsers.length / totalUsers) * 100).toFixed(1) : '0'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
        <p className="text-brand-gray-400 mt-2">
          Manage subscription plans and monitor revenue
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">€{mrr.toFixed(2)}</div>
            <p className="text-xs text-brand-gray-500 mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{subscribedUsers.length}</div>
            <p className="text-xs text-brand-gray-500 mt-1">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{conversionRate}%</div>
            <p className="text-xs text-brand-gray-500 mt-1">Free to paid conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray-400 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              ARPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              €{subscribedUsers.length > 0 ? (mrr / subscribedUsers.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-brand-gray-500 mt-1">Average Revenue Per User</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Available subscription tiers and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-lg bg-brand-gray-800 border border-brand-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  {!plan.active && (
                    <span className="px-2 py-1 text-xs rounded bg-brand-gray-700 text-brand-gray-400">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-white">
                    €{plan.price}
                    <span className="text-sm font-normal text-brand-gray-400">
                      /{plan.interval}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-brand-gray-400">
                    <span>Monthly Listings:</span>
                    <span className="text-white">
                      {plan.monthlyListings === -1 ? 'Unlimited' : plan.monthlyListings}
                    </span>
                  </div>
                  <div className="flex justify-between text-brand-gray-400">
                    <span>Analytics:</span>
                    <span className="text-white">{plan.analytics ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-brand-gray-400">
                    <span>Auto-republish:</span>
                    <span className="text-white">{plan.autoRepublish ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-brand-gray-400">
                    <span>Priority Support:</span>
                    <span className="text-white">{plan.supportPriority ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                {plan.features.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-brand-gray-700">
                    <p className="text-xs text-brand-gray-500 mb-2">Features:</p>
                    <ul className="text-xs text-brand-gray-400 space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {subscriptionPlans.length === 0 && (
            <div className="text-center py-8 text-brand-gray-500">
              No subscription plans configured yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriber Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriber Distribution</CardTitle>
          <CardDescription>Active subscribers by tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.entries(usersByTier) as [string, number][]).map(([tier, count]) => {
              const percentage = subscribedUsers.length > 0
                ? ((count / subscribedUsers.length) * 100).toFixed(1)
                : '0'

              return (
                <div key={tier}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white">{tier}</span>
                    <span className="text-sm text-brand-gray-400">
                      {count} users ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-brand-gray-800 rounded-full h-2">
                    <div
                      className="bg-brand-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {subscribedUsers.length === 0 && (
            <div className="text-center py-8 text-brand-gray-500">
              No active subscriptions yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
