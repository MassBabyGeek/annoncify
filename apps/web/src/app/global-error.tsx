'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-brand-gray-950 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">Error</h1>
            <h2 className="text-2xl font-semibold text-brand-gray-300 mb-4">
              Something went wrong!
            </h2>
            <p className="text-brand-gray-400 mb-8">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="inline-block px-6 py-3 bg-brand-yellow-400 text-brand-gray-950 font-semibold rounded-lg hover:bg-brand-yellow-500 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
