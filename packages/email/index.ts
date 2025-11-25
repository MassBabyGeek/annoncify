import { Resend } from 'resend'

// Initialize Resend with API key (with fallback for build time)
// During build, Next.js may try to evaluate this module without runtime env vars
export const resend = new Resend(process.env.RESEND_API_KEY || 're_build_placeholder')

// Templates are not exported to avoid Next.js trying to compile them during build
// Import them directly from ./templates/* when needed
