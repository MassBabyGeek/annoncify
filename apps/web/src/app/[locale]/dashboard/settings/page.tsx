import { currentUser } from '@annoncify/auth/server'
import { redirect } from 'next/navigation'
import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { UserButton } from '@annoncify/auth'

export default async function SettingsPage() {
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-brand-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
              <div>
                <p className="font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-brand-gray-400">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-brand-gray-400">Current Plan</p>
              <p className="text-2xl font-bold text-white">{user.role}</p>
              <p className="text-sm text-brand-gray-400">
                {user.monthlyListingsCount} / {getListingLimit(user.role)} listings
                this month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-brand-gray-400">
              Email notifications are coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getListingLimit(role: string): number {
  const limits: Record<string, number> = {
    FREE: 5,
    STARTER: 50,
    PRO: 200,
    BUSINESS: 500,
    ENTERPRISE: 99999,
    ADMIN: 99999,
  }
  return limits[role] || 5
}
