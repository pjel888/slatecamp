'use client'

import React from 'react'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import type { CameraPreset } from '@/lib/pd1096/types'

// ─── Icon components (inline SVGs — no external dependency) ─────────────────

function OrbitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <ellipse cx="8" cy="8" rx="7" ry="3" />
    </svg>
  )
}

function PlanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="8" y1="2" x2="8" y2="14" />
    </svg>
  )
}

function FrontIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="12" height="10" rx="1" />
      <line x1="2" y1="4" x2="8" y2="2" />
      <line x1="14" y1="4" x2="8" y2="2" />
    </svg>
  )
}

function IsoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2 L14 5.5 L14 10.5 L8 14 L2 10.5 L2 5.5 Z" />
      <line x1="8" y1="2" x2="8" y2="14" />
      <line x1="2" y1="5.5" x2="14" y2="5.5" />
    </svg>
  )
}

function DimensionsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="14" x2="14" y2="14" />
      <line x1="2" y1="12" x2="2" y2="14" />
      <line x1="14" y1="12" x2="14" y2="14" />
      <line x1="2" y1="2" x2="2" y2="10" />
      <line x1="2" y1="2" x2="4" y2="2" />
      <line x1="2" y1="10" x2="4" y2="10" />
    </svg>
  )
}

const CAMERA_OPTIONS: { value: CameraPreset; label: string; icon: () => React.ReactNode; group?: string }[] = [
  { value: 'perspective', label: '3D', icon: OrbitIcon, group: 'main' },
  { value: 'top', label: 'Plan', icon: PlanIcon, group: 'main' },
  { value: 'front', label: 'Front', icon: FrontIcon, group: 'main' },
  { value: 'iso-ne', label: 'NE', icon: IsoIcon, group: 'iso' },
  { value: 'iso-nw', label: 'NW', icon: IsoIcon, group: 'iso' },
  { value: 'iso-se', label: 'SE', icon: IsoIcon, group: 'iso' },
  { value: 'iso-sw', label: 'SW', icon: IsoIcon, group: 'iso' },
]

// ─── Floating Camera Bar (positioned over 3D viewport) ─────────────────────
// Frosted glass background, centered at the bottom of the canvas.

export function FloatingCameraBar() {
  const current = useDevControlsStore((s) => s.cameraPreset)
  const setCameraPreset = useDevControlsStore((s) => s.setCameraPreset)
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const setShowDimensions = useDevControlsStore((s) => s.setShowDimensions)

  return (
    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-0.5 rounded-md border border-white/20 bg-foreground/40 px-1.5 py-1.5 backdrop-blur-xl shadow-lg">
        {/* Main views */}
        {CAMERA_OPTIONS.filter(o => o.group === 'main').map((opt) => {
          const Icon = opt.icon
          const active = current === opt.value
          return (
            <button key={opt.value} onClick={() => setCameraPreset(opt.value)} title={opt.label}
              className={`flex items-center gap-1 rounded-sm px-2 py-1.5 text-[10px] font-medium transition-all duration-150 ${
                active ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}>
              <Icon /><span className="hidden sm:inline">{opt.label}</span>
            </button>
          )
        })}

        <div className="mx-0.5 h-5 w-px bg-white/15" />

        {/* Isometric corners */}
        {CAMERA_OPTIONS.filter(o => o.group === 'iso').map((opt) => {
          const active = current === opt.value
          return (
            <button key={opt.value} onClick={() => setCameraPreset(opt.value)} title={`Isometric ${opt.label}`}
              className={`rounded-sm px-1.5 py-1.5 text-[9px] font-mono font-medium transition-all duration-150 ${
                active ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}>
              {opt.label}
            </button>
          )
        })}

        <div className="mx-0.5 h-5 w-px bg-white/15" />

        {/* Dimensions toggle */}
        <button
          onClick={() => setShowDimensions(!showDimensions)}
          title="Dimensions"
          className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-medium transition-all duration-150 ${
            showDimensions
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:bg-white/10 hover:text-white/90'
          }`}
        >
          <DimensionsIcon />
          <span className="hidden sm:inline">Dims</span>
        </button>
      </div>
    </div>
  )
}

// ─── Right Panel Camera Bar (legacy export — kept for mobile bottom sheet) ──

export function CameraPresetBar() {
  const current = useDevControlsStore((s) => s.cameraPreset)
  const setCameraPreset = useDevControlsStore((s) => s.setCameraPreset)
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const setShowDimensions = useDevControlsStore((s) => s.setShowDimensions)

  return (
    <div className="flex gap-1.5">
      {CAMERA_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setCameraPreset(opt.value)}
          className={`flex-1 rounded-sm border px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 ${
            current === opt.value
              ? 'border-primary bg-primary-50 text-primary'
              : 'border-border text-foreground hover:bg-primary-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
      <button
        onClick={() => setShowDimensions(!showDimensions)}
        className={`rounded-sm border px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 ${
          showDimensions
            ? 'border-primary bg-primary-50 text-primary'
            : 'border-border text-foreground hover:bg-primary-50'
        }`}
      >
        Dims
      </button>
    </div>
  )
}
