import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { Users, Package, CreditCard, Activity, TrendingUp, DollarSign } from 'lucide-react'

export default async function AdminOverviewPage() {
  // Fetch key statistics
  const [
    totalUsers,
    totalListings,
    activeListings,
    totalSubscribers,
    recentActivity,
    todayLogins,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({
      where: {
        NOT: { role: 'FREE' },
      },
    }),
    prisma.userActivity.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
        },
      },
    }),
    prisma.loginLog.count({
      where: {
        success: true,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
        },
      },
    }),
  ])

  // Calculate conversion rate (subscribers / total users)
  const conversionRate = totalUsers > 0 ? ((totalSubscribers / totalUsers) * 100).toFixed(1) : '0'

  const stats = [
    {
      name: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      change: '+12% from last month',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Listings',
      value: activeListings.toLocaleString(),
      subtitle: `${totalListings.toLocaleString()} total`,
      icon: Package,
      change: '+8% from last month',
      changeType: 'positive' as const,
    },
    {
      name: 'Paid Subscribers',
      value: totalSubscribers.toLocaleString(),
      subtitle: `${conversionRate}% conversion`,
      icon: CreditCard,
      change: '+23% from last month',
      changeType: 'positive' as const,
    },
    {
      name: 'Today\'s Logins',
      value: todayLogins.toLocaleString(),
      subtitle: `${recentActivity} activities (24h)`,
      icon: Activity,
      change: '+5% from yesterday',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-brand-gray-400 mt-2">
          Overview of platform statistics and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-brand-gray-400">
                  {stat.name}
                </CardTitle>
                <Icon className="h-4 w-4 text-brand-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-brand-gray-500 mt-1">{stat.subtitle}</p>
                )}
                <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/form-fields"
              className="flex items-center justify-between p-4 rounded-lg bg-brand-gray-800 hover:bg-brand-gray-700 transition-colors"
            >
              <div>
                <p className="font-medium text-white">Manage Form Fields</p>
                <p className="text-sm text-brand-gray-400">
                  Configure category/platform forms
                </p>
              </div>
              <span className="text-brand-yellow-400">→</span>
            </a>
            <a
              href="/admin/users"
              className="flex items-center justify-between p-4 rounded-lg bg-brand-gray-800 hover:bg-brand-gray-700 transition-colors"
            >
              <div>
                <p className="font-medium text-white">View Users</p>
                <p className="text-sm text-brand-gray-400">Manage user accounts and roles</p>
              </div>
              <span className="text-brand-yellow-400">→</span>
            </a>
            <a
              href="/admin/analytics"
              className="flex items-center justify-between p-4 rounded-lg bg-brand-gray-800 hover:bg-brand-gray-700 transition-colors"
            >
              <div>
                <p className="font-medium text-white">View Analytics</p>
                <p className="text-sm text-brand-gray-400">
                  Detailed platform usage statistics
                </p>
              </div>
              <span className="text-brand-yellow-400">→</span>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Platform activity in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RecentActivityList />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function RecentActivityList() {
  const activities = await prisma.userActivity.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    // We can't include user directly as userId is nullable
    // We'll fetch user data separately if needed
  })

  if (activities.length === 0) {
    return (
      <p className="text-sm text-brand-gray-500 text-center py-4">No recent activity</p>
    )
  }

  const activityTypeLabels: Record<string, string> = {
    LOGIN: 'Logged in',
    LOGOUT: 'Logged out',
    LISTING_CREATED: 'Created listing',
    LISTING_UPDATED: 'Updated listing',
    LISTING_DELETED: 'Deleted listing',
    LISTING_PUBLISHED: 'Published listing',
    LISTING_UNPUBLISHED: 'Unpublished listing',
    SUBSCRIPTION_CREATED: 'Subscribed',
    SUBSCRIPTION_UPDATED: 'Updated subscription',
    SUBSCRIPTION_CANCELLED: 'Cancelled subscription',
    IMPORT_STARTED: 'Started import',
    IMPORT_COMPLETED: 'Completed import',
    PROFILE_UPDATED: 'Updated profile',
    SETTINGS_UPDATED: 'Updated settings',
  }

  return (
    <>
      {activities.map((activity: typeof activities[number]) => (
        <div key={activity.id} className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-brand-yellow-400" />
          <div className="flex-1">
            <p className="text-sm text-white">{activityTypeLabels[activity.type] || activity.type}</p>
            <p className="text-xs text-brand-gray-500">
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </>
  )
}
