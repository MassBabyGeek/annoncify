import type { Config } from 'tailwindcss'
import sharedConfig from '@annoncify/config/tailwind'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/components/**/*.{ts,tsx}',
  ],
  presets: [sharedConfig],
}

export default config
