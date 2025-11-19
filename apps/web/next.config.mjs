import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@annoncify/ui', '@annoncify/auth', '@annoncify/database'],
  images: {
    domains: ['img.clerk.com', 'images.unsplash.com'],
  },
}

export default withNextIntl(nextConfig)
