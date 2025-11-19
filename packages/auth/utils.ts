import { auth } from '@clerk/nextjs/server'
import { prisma, UserRole } from '@annoncify/database'

/**
 * Get the current user from database
 * Syncs with Clerk if needed
 */
export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  return user
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return user.role === role
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(UserRole.ADMIN)
}

/**
 * Get user's monthly listing limit based on role
 */
export function getListingLimit(role: UserRole): number {
  const limits: Record<UserRole, number> = {
    [UserRole.FREE]: 5,
    [UserRole.STARTER]: 50,
    [UserRole.PRO]: 200,
    [UserRole.BUSINESS]: 1000,
    [UserRole.ENTERPRISE]: -1, // unlimited
    [UserRole.ADMIN]: -1, // unlimited
  }

  return limits[role]
}

/**
 * Check if user can create more listings this month
 */
export async function canCreateListing(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const limit = getListingLimit(user.role)

  // Unlimited
  if (limit === -1) return true

  // Check monthly count
  return user.monthlyListingsCount < limit
}

/**
 * Get remaining listings for current month
 */
export async function getRemainingListings(): Promise<number> {
  const user = await getCurrentUser()
  if (!user) return 0

  const limit = getListingLimit(user.role)

  // Unlimited
  if (limit === -1) return Infinity

  return Math.max(0, limit - user.monthlyListingsCount)
}
