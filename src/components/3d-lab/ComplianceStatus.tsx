'use client'

import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import type { ComplianceState } from '@/types/3d-lab'

interface ComplianceStatusProps {
  state: ComplianceState
  codeReference: string
}

const CONFIG = {
  compliant: {
    icon: CheckCircle,
    iconColor: '#1B7A3C',
    bg: '#EDFAF4',
    border: '#A7D9BC',
    label: 'Compliant',
    description: (ref: string) => `All values within ${ref} limits.`,
  },
  'at-limit': {
    icon: Warning,
    iconColor: '#D4951A',
    bg: '#FEF8ED',
    border: '#E8CC8A',
    label: 'At limit',
    description: (_ref: string) => 'One value exactly at maximum/minimum.',
  },
  violation: {
    icon: XCircle,
    iconColor: '#D64545',
    bg: '#FDF0F0',
    border: '#EDBBBB',
    label: 'Violation',
    description: (_ref: string) => 'One or more values exceed code limits.',
  },
} as const

export const ComplianceStatus = ({ state, codeReference }: ComplianceStatusProps) => {
  const cfg = CONFIG[state]
  const Icon = cfg.icon

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: cfg.bg,
        border: `0.5px solid ${cfg.border}`,
        borderRadius: '6px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={14} weight="fill" color={cfg.iconColor} />
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '10px',
            fontWeight: 500,
            color: cfg.iconColor,
            letterSpacing: '0.02em',
          }}
        >
          {cfg.label}
        </span>
      </div>
      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '11px',
          color: '#4A5568',
          margin: 0,
          lineHeight: 1.45,
        }}
      >
        {cfg.description(codeReference)}
      </p>
    </div>
  )
}
