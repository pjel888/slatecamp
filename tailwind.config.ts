import type { Config } from 'tailwindcss'
import { SLATECAMP_COLORS } from './src/lib/constants/colors'

/**
 * Tailwind v4 uses CSS-first config (@theme in globals.css).
 * This file extends theme so the same palette is available when using @config.
 * SlateCamp semantic utilities (e.g. bg-slatecamp-paper, text-slatecamp-ink-main)
 * are defined in src/app/globals.css @theme and in src/lib/constants/colors.ts.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...SLATECAMP_COLORS,
      },
    },
  },
  plugins: [],
}

export default config
