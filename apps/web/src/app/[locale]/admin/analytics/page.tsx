import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { TrendingUp, Users, Package, Activity } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const today = new Date(now.setHours(0, 0, 0, 0))

  // User Analytics
  const [
    totalUsers,
    newUsersLast30Days,
    newUsersLast7Days,
    newUsersToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
  ])

  // Listing Analytics
  const [
    totalListings,
    listingsLast30Days,
    listingsLast7Days,
    listingsToday,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.listing.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.listing.count({ where: { createdAt: { gte: today } } }),
  ])

  // Activity Analytics
  const [
    totalActivities,
    activitiesLast30Days,
    activitiesLast7Days,
    activitiesToday,
  ] = await Promise.all([
    prisma.userActivity.count(),
    prisma.userActivity.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.userActivity.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.userActivity.count({ where: { createdAt: { gte: today } } }),
  ])

  // Login Analytics
  const [
    totalLogins,
    loginsLast30Days,
    loginsLast7Days,
    loginsToday,
    successfulLogins,
    failedLogins,
  ] = await Promise.all([
    prisma.loginLog.count(),
    prisma.loginLog.count({ where: { createdAt: { gte: last30Days } } }),
    prisma.loginLog.count({ where: { createdAt: { gte: last7Days } } }),
    prisma.loginLog.count({ where: { createdAt: { gte: today } } }),
    prisma.loginLog.count({ where: { success: true } }),
    prisma.loginLog.count({ where: { success: false } }),
  ])

  // Platform distribution
  const platformStats = await prisma.listing.groupBy({
    by: ['platform'],
    _count: true,
  })

  // User role distribution
  const userRoleStats = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  })

  // Recent activities
  const recentActivities = await prisma.userActivity.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-brand-gray-400 mt-2">
          Comprehensive platform usage statistics and metrics
        </p>
      </div>

      {/* User Analytics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-brand-gray-400">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-brand-gray-400">
                Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{newUsersLast30Days}</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                New users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-brand-gray-400">
                Last 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{newUsersLast7Days}</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                New users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-brand-gray-400">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{newUsersToday}</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                New users
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Listing Analytics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Listing Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-brand-gray-400">
                Total Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalListings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-brand-gray-400">
                Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{listingsLast30Days}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-brand-gray-400">
                Last 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{listingsLast7Days}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-brand-gray-400">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{listingsToday}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity & Login Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Analytics
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-brand-gray-400">Total Activities</span>
                  <span className="text-xl font-bold text-white">{totalActivities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-gray-400">Last 30 Days</span>
                  <span className="text-xl font-bold text-white">{activitiesLast30Days}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-gray-400">Last 7 Days</span>
                  <span className="text-xl font-bold text-white">{activitiesLast7Days}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-gray-400">Today</span>
                  <span className="text-xl font-bold text-white">{activitiesToday}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Login Analytics</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-brand-gray-400">Total Logins</span>
                  <span className="text-xl font-bold text-white">{totalLogins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-gray-400">Last 30 Days</span>
                  <span className="text-xl font-bold text-white">{loginsLast30Days}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-brand-gray-400">Today</span>
                  <span className="text-xl font-bold text-white">{loginsToday}</span>
                </div>
                <div className="border-t border-brand-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400">Successful</span>
                    <span className="text-xl font-bold text-white">{successfulLogins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-400">Failed</span>
                    <span className="text-xl font-bold text-white">{failedLogins}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Listings by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformStats.map((stat) => (
                <div key={stat.platform} className="flex justify-between items-center">
                  <span className="text-brand-gray-400">{stat.platform}</span>
                  <span className="text-lg font-semibold text-white">{stat._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Users by subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRoleStats.map((stat) => (
                <div key={stat.role} className="flex justify-between items-center">
                  <span className="text-brand-gray-400">{stat.role}</span>
                  <span className="text-lg font-semibold text-white">{stat._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
