'use client'

import { BuildingApartment } from '@phosphor-icons/react'

interface LabErrorStateProps {
  wikiUrl?: string
}

export const LabErrorState = ({ wikiUrl }: LabErrorStateProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full gap-3"
      style={{ backgroundColor: '#F2F0EB' }}
    >
      <BuildingApartment
        size={32}
        weight="thin"
        style={{ color: '#8896A7' }}
      />

      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          color: '#1A2332',
          margin: 0,
        }}
      >
        3D model unavailable
      </p>

      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          color: '#4A5568',
          margin: 0,
        }}
      >
        The wiki article has all the information you need.
      </p>

      {wikiUrl && (
        <a
          href={wikiUrl}
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '10px',
            color: '#1B3FC4',
            textDecoration: 'none',
            transition: 'color 150ms ease-out',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#1535A8'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#1B3FC4'
          }}
        >
          Go to wiki →
        </a>
      )}
    </div>
  )
}
