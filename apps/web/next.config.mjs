import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@annoncify/ui', '@annoncify/auth', '@annoncify/database'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['img.clerk.com', 'images.unsplash.com'],
  },
  // Skip static generation for error pages to avoid Clerk compatibility issues
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
}

export default withNextIntl(nextConfig)
