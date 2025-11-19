'use client'

import { UserButton } from '@annoncify/auth'
import Link from 'next/link'
import { Shield } from 'lucide-react'

interface UserProfileSectionProps {
  firstName?: string | null
  email?: string
  isAdmin?: boolean
}

export function UserProfileSection({ firstName, email, isAdmin }: UserProfileSectionProps) {
  return (
    <div className="space-y-3">
      {/* Admin access link */}
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-yellow-400/10 text-brand-yellow-400 hover:bg-brand-yellow-400/20 transition-colors text-sm font-medium"
        >
          <Shield className="h-4 w-4" />
          Admin Panel →
        </Link>
      )}

      <div className="flex items-center gap-3 p-4 rounded-lg bg-brand-gray-800">
        <UserButton afterSignOutUrl="/" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {firstName || 'User'}
          </p>
          <p className="text-xs text-brand-gray-400 truncate">
            {email}
          </p>
        </div>
      </div>
    </div>
  )
}
