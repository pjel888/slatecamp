export interface PortalConfig {
  label: string
  basePath: string
  topbarBg: string
  accentColor: string
  accentLightColor: string
  backLabel?: string
  backHref?: string
}

export const PORTALS = {
  admin: {
    label: 'Admin Console',
    basePath: '/admin',
    topbarBg: '#6B1A1A',
    accentColor: '#B91C1C',
    accentLightColor: '#FEF2F2',
    backLabel: 'Dashboard',
    backHref: '/dashboard',
  },
  developer: {
    label: 'Developer Portal',
    basePath: '/developer',
    topbarBg: '#0F1F5C',
    accentColor: '#1B3FC4',
    accentLightColor: '#EEF2FC',
    backLabel: 'Dashboard',
    backHref: '/dashboard',
  },
  ceo: {
    label: 'CEO Dashboard',
    basePath: '/ceo',
    topbarBg: '#7A4B1A',
    accentColor: '#E8853A',
    accentLightColor: '#FFF5EC',
    backLabel: 'Dashboard',
    backHref: '/dashboard',
  },
} as const satisfies Record<string, PortalConfig>

export type PortalKey = keyof typeof PORTALS
