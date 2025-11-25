import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-brand-gray-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-brand-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-brand-yellow-400 text-brand-gray-950 font-semibold rounded-lg hover:bg-brand-yellow-500 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
