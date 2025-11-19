import { redirect } from 'next/navigation'
import { currentUser, isAdmin } from '@annoncify/auth/server'
import Link from 'next/link'
import { LayoutDashboard, Package, Settings, Upload } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { UserProfileSection } from './user-profile-section'

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const t = await getTranslations('dashboard.nav')
  const userIsAdmin = await isAdmin()

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('listings'), href: '/dashboard/listings', icon: Package },
    { name: t('createListing'), href: '/dashboard/import', icon: Upload },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-brand-gray-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-brand-gray-900 border-r border-brand-gray-800">
        <div className="flex h-16 items-center px-6 border-b border-brand-gray-800">
          <Link href="/" className="text-xl font-bold gradient-text">
            Annoncify
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

        <div className="absolute bottom-4 left-4 right-4">
          <UserProfileSection
            firstName={user.firstName}
            email={user.emailAddresses[0]?.emailAddress}
            isAdmin={userIsAdmin}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main>{children}</main>
      </div>
    </div>
  )
}
