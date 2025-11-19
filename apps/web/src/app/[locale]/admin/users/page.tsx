import { prisma } from '@annoncify/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@annoncify/ui'
import { UserManagementTable } from './user-management-table'

export default async function AdminUsersPage() {
  // Fetch all users with their stats
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          listings: true,
          importLogs: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate statistics
  const totalUsers = users.length
  const freeUsers = users.filter((u) => u.role === 'FREE').length
  const paidUsers = users.filter((u) => u.role !== 'FREE').length
  const adminUsers = users.filter((u) => u.role === 'ADMIN').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-brand-gray-400 mt-2">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              Free Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{freeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray-400">
              Paid Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paidUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-brand-gray-400">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
