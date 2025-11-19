import type { Config } from 'tailwindcss'
import sharedConfig from '@annoncify/config/tailwind'

const config: Config = {
  content: ['./components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  presets: [sharedConfig],
}

export default config
