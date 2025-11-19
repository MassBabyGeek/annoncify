import { currentUser } from '@annoncify/auth/server'
import { redirect } from 'next/navigation'
import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@annoncify/ui'
import { Eye, Heart, Package, Plus } from 'lucide-react'
import { PublishButtons } from '@/components/publish-buttons'
import { DeleteListingButton } from '@/components/delete-listing-button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ListingsPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  if (!user) {
    redirect('/sign-in')
  }

  const listings = await prisma.listing.findMany({
    where: {
      userId: user.id,
      status: { not: 'DELETED' }, // Exclure les annonces supprimées
    },
    include: {
      publications: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const platformIcons: Record<string, string> = {
    VINTED: '👕',
    LEBONCOIN: '🏠',
    AMAZON: '📦',
    EBAY: '🛍️',
    FACEBOOK_MARKETPLACE: '👥',
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500/10 text-gray-400',
    ACTIVE: 'bg-green-500/10 text-green-400',
    PAUSED: 'bg-yellow-500/10 text-yellow-400',
    SOLD: 'bg-blue-500/10 text-blue-400',
    EXPIRED: 'bg-red-500/10 text-red-400',
    DELETED: 'bg-red-500/10 text-red-400',
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Toutes les annonces</h1>
          <p className="text-brand-gray-400 mt-2">
            Gérez vos annonces sur toutes les plateformes
          </p>
        </div>
        <Link href="/fr/dashboard/import">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-brand-gray-600 mb-4" />
            <p className="text-brand-gray-400 text-lg mb-2">Aucune annonce</p>
            <p className="text-sm text-brand-gray-500 mb-4">
              Créez votre première annonce pour commencer
            </p>
            <Link href="/fr/dashboard/import">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer une annonce
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const firstImage = listing.images[0]
            return (
              <Card key={listing.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  {firstImage && (
                    <div className="aspect-square relative bg-brand-gray-800">
                      <img
                        src={firstImage}
                        alt={listing.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{listing.title}</CardTitle>
                  <CardDescription className="mb-4">
                    {listing.price.toFixed(2)} € • {listing.condition || 'Occasion'}
                  </CardDescription>

                  {/* Platform status badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.publications.map((pub) => (
                      <div
                        key={pub.id}
                        className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                          statusColors[pub.status]
                        }`}
                        title={`${pub.platform}: ${pub.status}`}
                      >
                        <span>{platformIcons[pub.platform]}</span>
                        <span>{pub.status}</span>
                      </div>
                    ))}
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center gap-4 text-sm text-brand-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {listing.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {listing.favorites}
                    </span>
                  </div>

                  {/* Publish buttons for platforms not yet published */}
                  <PublishButtons listing={listing} />

                  {/* Delete button */}
                  <div className="mt-4">
                    <DeleteListingButton listingId={listing.id} listingTitle={listing.title} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
