import { redirect } from 'next/navigation'
import { currentUser, isAdmin } from '@annoncify/auth/server'
import { UserButton } from '@annoncify/auth'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Package,
  BarChart3,
  Shield,
} from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    redirect('/dashboard')
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Form Fields', href: '/admin/form-fields', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Listings', href: '/admin/listings', icon: Package },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-brand-gray-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-brand-gray-900 border-r border-brand-gray-800">
        <div className="flex h-16 items-center px-6 border-b border-brand-gray-800">
          <Link href="/" className="text-xl font-bold gradient-text flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-yellow-400" />
            Admin
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-brand-gray-300 hover:bg-brand-gray-800 hover:text-white transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          {/* Back to Dashboard link */}
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-gray-800 text-brand-gray-300 hover:bg-brand-gray-700 hover:text-white transition-colors text-sm"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-brand-gray-800">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName || 'Admin'}
              </p>
              <p className="text-xs text-brand-gray-400 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main>{children}</main>
      </div>
    </div>
  )
}
