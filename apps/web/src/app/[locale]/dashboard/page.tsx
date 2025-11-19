import { redirect } from 'next/navigation'
import { currentUser } from '@annoncify/auth/server'
import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { Package, TrendingUp, Eye, Heart } from 'lucide-react'
import { ExtensionStatus } from '@/components/extension-status'

export default async function DashboardPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Find or create user in database
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      listings: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  // If user doesn't exist, create them
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: 'FREE',
      },
      include: {
        listings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  const stats = {
    totalListings: await prisma.listing.count({ where: { userId: user.id } }),
    activeListings: await prisma.listing.count({
      where: { userId: user.id, status: 'ACTIVE' },
    }),
    totalViews: await prisma.listing.aggregate({
      where: { userId: user.id },
      _sum: { views: true },
    }),
    totalFavorites: await prisma.listing.aggregate({
      where: { userId: user.id },
      _sum: { favorites: true },
    }),
  }

  return (
    <div className="min-h-screen bg-brand-gray-950 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user.firstName || 'User'}!
          </h1>
          <p className="text-brand-gray-400 mt-2">
            Here's an overview of your listings across all platforms
          </p>
        </div>

        {/* Extension Status */}
        <div className="mb-8">
          <ExtensionStatus />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-brand-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalListings}</div>
              <p className="text-xs text-brand-gray-500 mt-1">
                {stats.activeListings} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-brand-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.monthlyListingsCount}</div>
              <p className="text-xs text-brand-gray-500 mt-1">
                {user.role} plan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-brand-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalViews._sum.views || 0}
              </div>
              <p className="text-xs text-brand-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-brand-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalFavorites._sum.favorites || 0}
              </div>
              <p className="text-xs text-brand-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
            <CardDescription>Your latest imported listings</CardDescription>
          </CardHeader>
          <CardContent>
            {user.listings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-brand-gray-600 mx-auto mb-4" />
                <p className="text-brand-gray-400">No listings yet</p>
                <p className="text-sm text-brand-gray-500 mt-2">
                  Start by importing listings from your favorite platforms
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {user.listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-brand-gray-800 hover:border-brand-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{listing.title}</h3>
                      <p className="text-sm text-brand-gray-400">
                        {listing.platform} • €{listing.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-brand-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {listing.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {listing.favorites}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
