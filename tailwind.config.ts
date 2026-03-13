import type { Config } from 'tailwindcss'

/**
 * Tailwind v4 uses CSS-first config (@theme in globals.css).
 * Semantic colors (surfaces, ink, accents) are defined via CSS variables
 * in src/app/globals.css and consumed through Tailwind utilities.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
