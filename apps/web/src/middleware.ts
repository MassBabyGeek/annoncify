import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/:locale',
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Skip intl middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return
  }

  // Run intl middleware
  return intlMiddleware(request)
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
