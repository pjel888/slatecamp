import packageJson from '../../../package.json'
import tsconfig from '../../../tsconfig.json'

const stripRange = (value?: string) => value?.replace(/^[\^~]/, '') ?? 'unknown'

const version = (pkg: string) =>
  stripRange(
    packageJson.dependencies?.[pkg as keyof typeof packageJson.dependencies] ??
      packageJson.devDependencies?.[pkg as keyof typeof packageJson.devDependencies]
  )

export interface DeveloperTechStackRow {
  label: string
  pkg: string
  version: string
  notes?: string
}

const UI_VERSION = `${version('@base-ui/react')} / ${version('shadcn')}`
const THREE_VERSION = `${version('three')} / ${version('@react-three/fiber')}`
const CONTENT_VERSION = version('next-mdx-remote')

export const developerNextVersion = version('next')
const developerTypeScriptStrictMode = String(tsconfig.compilerOptions.strict)

export const developerPortalTechStack: DeveloperTechStackRow[] = [
  { label: 'Framework', pkg: 'next', version: developerNextVersion },
  { label: 'Runtime', pkg: 'react / react-dom', version: `${version('react')} / ${version('react-dom')}` },
  { label: 'Language', pkg: 'typescript', version: version('typescript') },
  { label: 'Styling', pkg: 'tailwindcss', version: version('tailwindcss') },
  { label: 'UI', pkg: '@base-ui/react + shadcn', version: UI_VERSION },
  { label: 'Database', pkg: '@supabase/supabase-js', version: version('@supabase/supabase-js') },
  { label: 'SSR Auth', pkg: '@supabase/ssr', version: version('@supabase/ssr'), notes: 'Cookie-based' },
  { label: 'State', pkg: 'zustand', version: version('zustand') },
  { label: '3D', pkg: 'three / @react-three/fiber', version: THREE_VERSION },
  { label: 'Charts', pkg: 'recharts', version: version('recharts') },
  { label: 'Animation', pkg: 'framer-motion', version: version('framer-motion') },
  {
    label: 'Payments',
    pkg: 'deferred provider adapter',
    version: 'not bundled',
    notes: 'PayRex SDK is intentionally not bundled for the payment-free launch; checkout/webhook paths fail closed until a future paid-launch implementation re-vets the provider.',
  },
  { label: 'Validation', pkg: 'zod', version: version('zod') },
  {
    label: 'Content',
    pkg: 'next-mdx-remote',
    version: CONTENT_VERSION,
    notes: 'MDX runtime via next-mdx-remote/rsc',
  },
]

export const developerArchitectureTechStack: DeveloperTechStackRow[] = developerPortalTechStack.map((row) => ({
  ...row,
  notes:
    row.label === 'Framework'
      ? 'App Router, Server Components'
      : row.label === 'Language'
        ? `strict: ${developerTypeScriptStrictMode}`
        : row.label === 'Styling'
          ? 'CSS-first config'
          : row.label === 'UI'
            ? 'Radix-based'
            : row.label === 'Database'
              ? 'PostgreSQL'
              : row.notes ?? '',
}))
