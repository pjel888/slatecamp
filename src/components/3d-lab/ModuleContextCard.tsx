'use client'

import { useEffect, useRef, useState } from 'react'
import type { ModuleConfig } from '@/types/3d-lab'

interface ModuleContextCardProps {
  config: ModuleConfig
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 6000

export const ModuleContextCard = ({ config, onDismiss }: ModuleContextCardProps) => {
  const [visible, setVisible] = useState(false)
  const [show, setShow] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const key = `module_${config.slug}_seen`
    const alreadySeen = localStorage.getItem(key)
    if (!alreadySeen) {
      setShow(true)
      requestAnimationFrame(() => setVisible(true))
    }
  }, [config.slug])

  const handleDismiss = () => {
    if (!show) return
    const key = `module_${config.slug}_seen`
    localStorage.setItem(key, 'true')
    setVisible(false)
    setTimeout(onDismiss, 150)
  }

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!show) return
    timerRef.current = setTimeout(handleDismiss, AUTO_DISMISS_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  // Dismiss on any canvas interaction
  useEffect(() => {
    if (!show) return
    const dismiss = () => handleDismiss()
    window.addEventListener('pointerdown', dismiss, { once: true })
    window.addEventListener('touchstart', dismiss, { once: true })
    window.addEventListener('wheel', dismiss, { passive: true, once: true } as AddEventListenerOptions)
    return () => {
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('touchstart', dismiss)
      window.removeEventListener('wheel', dismiss)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  if (!show) return null

  const hotspotCount = config.hotspots.length
  const estimatedMin = config.estimatedMinutes

  return (
    <div
      style={{
        position: 'fixed',
        top: '52px', // 36px top bar + 16px gap
        left: '16px',
        zIndex: 250,
        maxWidth: '280px',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4DAE3',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        padding: '12px',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 150ms ease-out',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Module code reference */}
        <p
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#8896A7',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {config.codeReference}
        </p>

        {/* Module title */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: '#1A2332',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {config.title}
        </p>

        {/* Learning objective */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '11px',
            color: '#4A5568',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {config.learningObjective}
        </p>

        {/* Metadata */}
        <p
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '10px',
            color: '#8896A7',
            margin: 0,
            lineHeight: 1.4,
            marginTop: '4px',
          }}
        >
          {hotspotCount} hotspot{hotspotCount !== 1 ? 's' : ''} · ~{estimatedMin} min
        </p>
      </div>

      {/* Progress bar — animates 0 → 100% over 6 seconds */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: '#EEF2FC',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: '#1B3FC4',
            width: visible ? '100%' : '0%',
            transition: visible ? `width ${AUTO_DISMISS_MS}ms linear` : 'none',
          }}
        />
      </div>
    </div>
  )
}
