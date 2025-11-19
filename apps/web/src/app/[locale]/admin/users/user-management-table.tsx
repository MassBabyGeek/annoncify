'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@annoncify/ui'
import { Search } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: Date
  monthlyListingsCount: number
  _count: {
    listings: number
    importLogs: number
  }
}

interface Props {
  users: User[]
}

const ROLES = ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE', 'ADMIN']

export function UserManagementTable({ users }: Props) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update user role')
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase()
    return (
      user.email.toLowerCase().includes(search) ||
      user.firstName?.toLowerCase().includes(search) ||
      user.lastName?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray-500" />
        <input
          type="text"
          placeholder="Search users by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white placeholder:text-brand-gray-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                User
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Role
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Listings
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-brand-gray-400">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-brand-gray-800 hover:bg-brand-gray-800/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-white">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : 'No name'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-brand-gray-400">{user.email}</td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className="px-3 py-1 rounded-md border border-brand-gray-700 bg-brand-gray-800 text-white text-sm disabled:opacity-50"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-sm text-brand-gray-400">
                  {user._count.listings}
                </td>
                <td className="py-3 px-4 text-sm text-brand-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-brand-gray-500">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
