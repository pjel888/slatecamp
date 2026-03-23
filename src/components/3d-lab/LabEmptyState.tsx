'use client'

import { Cube } from '@phosphor-icons/react'

export const LabEmptyState = () => {
  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full gap-3"
      style={{ backgroundColor: '#F2F0EB' }}
    >
      {/* DM Mono eyebrow */}
      <span
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          color: '#8896A7',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        3D Lab
      </span>

      {/* Cube icon at 30% cobalt opacity */}
      <Cube
        size={40}
        weight="thin"
        style={{ color: 'rgba(27,63,196,0.3)' }}
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
        No 3D model yet for this topic.
      </p>

      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          color: '#4A5568',
          margin: 0,
        }}
      >
        Check back — we&apos;re building it.
      </p>
    </div>
  )
}
