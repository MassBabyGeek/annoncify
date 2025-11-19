'use client'

import { useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import { DeleteListingButton } from '@/components/delete-listing-button'

interface Listing {
  id: string
  title: string
  price: number
  platform: string
  status: string
  createdAt: Date
  user: {
    email: string
    firstName: string | null
    lastName: string | null
  }
  publications: Array<{
    platform: string
    status: string
  }>
}

interface Props {
  listings: Listing[]
}

export function AdminListingsTable({ listings }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-400 bg-green-400/10'
      case 'DRAFT':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'SOLD':
        return 'text-blue-400 bg-blue-400/10'
      case 'PAUSED':
        return 'text-gray-400 bg-gray-400/10'
      case 'EXPIRED':
        return 'text-orange-400 bg-orange-400/10'
      case 'DELETED':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-brand-gray-400 bg-brand-gray-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray-500" />
          <input
            type="text"
            placeholder="Search listings by title or user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white placeholder:text-brand-gray-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="SOLD">Sold</option>
          <option value="PAUSED">Paused</option>
          <option value="EXPIRED">Expired</option>
          <option value="DELETED">Deleted</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Title
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                User
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Price
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Platform
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Publications
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Created
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.map((listing) => (
              <tr
                key={listing.id}
                className="border-b border-brand-gray-800 hover:bg-brand-gray-800/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-white max-w-xs truncate">
                    {listing.title}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-brand-gray-400">
                  {listing.user.firstName || listing.user.lastName
                    ? `${listing.user.firstName || ''} ${listing.user.lastName || ''}`.trim()
                    : listing.user.email}
                </td>
                <td className="py-3 px-4 text-sm text-white">
                  €{listing.price.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-sm text-brand-gray-400">
                  {listing.platform}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(listing.status)}`}
                  >
                    {listing.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {listing.publications.map((pub, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded text-xs bg-brand-gray-700 text-brand-gray-300"
                        title={`${pub.platform}: ${pub.status}`}
                      >
                        {pub.platform.substring(0, 2)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-brand-gray-400">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  {listing.status !== 'DELETED' && (
                    <DeleteListingButton listingId={listing.id} listingTitle={listing.title} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredListings.length === 0 && (
          <div className="text-center py-8 text-brand-gray-500">
            No listings found matching your filters.
          </div>
        )}
      </div>

      <div className="text-sm text-brand-gray-500">
        Showing {filteredListings.length} of {listings.length} listings
      </div>
    </div>
  )
}
