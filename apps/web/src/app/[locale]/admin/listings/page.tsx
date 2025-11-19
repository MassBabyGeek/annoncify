import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { AdminListingsTable } from './admin-listings-table'

export default async function AdminListingsPage() {
  // Fetch all listings with user and publications
  const listings = await prisma.listing.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      publications: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate statistics
  const totalListings = listings.length
  const draftListings = listings.filter((l) => l.status === 'DRAFT').length
  const activeListings = listings.filter((l) => l.status === 'ACTIVE').length
  const soldListings = listings.filter((l) => l.status === 'SOLD').length

  // Platform stats
  const platformCounts = listings.reduce(
    (acc, listing) => {
      acc[listing.platform] = (acc[listing.platform] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Listings Management</h1>
        <p className="text-brand-gray-400 mt-2">
          View and manage all listings across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{draftListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray-400">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray-400">
              Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{soldListings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>Listings by primary platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(platformCounts).map(([platform, count]) => (
              <div
                key={platform}
                className="p-4 rounded-lg bg-brand-gray-800 border border-brand-gray-700"
              >
                <div className="text-sm text-brand-gray-400 mb-1">{platform}</div>
                <div className="text-2xl font-bold text-white">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
          <CardDescription>Complete overview of all platform listings</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminListingsTable listings={listings} />
        </CardContent>
      </Card>
    </div>
  )
}
