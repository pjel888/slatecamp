// src/app/calculators/_components/FloatingCameraBar.tsx
// Floating camera preset bar for Calculator Suite — matches site dev controls pattern.
// Frosted glass overlay positioned at bottom-center of the canvas.
'use client'

import { type ReactNode } from 'react'

// ─── Camera Preset Types ──────────────────────────────────────────────────────

export type CalcCameraPreset =
  | 'perspective'
  | 'top'
  | 'front'
  | 'iso-ne'
  | 'iso-nw'
  | 'iso-se'
  | 'iso-sw'

export interface CalcCameraConfig {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
  isOrtho: boolean
  zoom: number
}

/**
 * Camera preset configurations for calculator tools.
 * Positions are relative to a typical calculator scene (wall or floor at origin).
 */
export function getCalcCameraPresets(toolType: string): Record<CalcCameraPreset, CalcCameraConfig> {
  // Scene-center estimates based on tool type
  const cx = toolType === 'flooring' ? 2 : 2
  const cy = 0
  const cz = toolType === 'flooring' ? 1.5 : 0

  return {
    perspective: {
      position: [cx + 4, 4, cz + 5],
      target: [cx, cy + 1, cz],
      fov: 45,
      isOrtho: false,
      zoom: 1,
    },
    top: {
      position: [cx, 20, cz],
      target: [cx, cy, cz],
      fov: 45,
      isOrtho: true,
      zoom: 80,
    },
    front: {
      position: [cx, cy + 1.5, cz + 20],
      target: [cx, cy + 1.5, cz],
      fov: 45,
      isOrtho: true,
      zoom: 80,
    },
    'iso-ne': {
      position: [cx + 8, 6, cz + 8],
      target: [cx, cy, cz],
      fov: 35,
      isOrtho: true,
      zoom: 70,
    },
    'iso-nw': {
      position: [cx - 8, 6, cz + 8],
      target: [cx, cy, cz],
      fov: 35,
      isOrtho: true,
      zoom: 70,
    },
    'iso-se': {
      position: [cx + 8, 6, cz - 8],
      target: [cx, cy, cz],
      fov: 35,
      isOrtho: true,
      zoom: 70,
    },
    'iso-sw': {
      position: [cx - 8, 6, cz - 8],
      target: [cx, cy, cz],
      fov: 35,
      isOrtho: true,
      zoom: 70,
    },
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

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

// ─── Camera Options ───────────────────────────────────────────────────────────

const CAMERA_OPTIONS: { value: CalcCameraPreset; label: string; icon: () => ReactNode; group: string }[] = [
  { value: 'perspective', label: '3D', icon: OrbitIcon, group: 'main' },
  { value: 'top', label: 'Plan', icon: PlanIcon, group: 'main' },
  { value: 'front', label: 'Front', icon: FrontIcon, group: 'main' },
  { value: 'iso-ne', label: 'NE', icon: IsoIcon, group: 'iso' },
  { value: 'iso-nw', label: 'NW', icon: IsoIcon, group: 'iso' },
  { value: 'iso-se', label: 'SE', icon: IsoIcon, group: 'iso' },
  { value: 'iso-sw', label: 'SW', icon: IsoIcon, group: 'iso' },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface FloatingCameraBarProps {
  current: CalcCameraPreset
  onChange: (preset: CalcCameraPreset) => void
}

export function FloatingCameraBar({ current, onChange }: FloatingCameraBarProps) {
  return (
    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 pointer-events-auto">
      <div className="flex items-center gap-0.5 rounded-md border border-white/20 bg-foreground/40 px-1.5 py-1.5 backdrop-blur-xl shadow-lg">
        {/* Main views */}
        {CAMERA_OPTIONS.filter(o => o.group === 'main').map((opt) => {
          const Icon = opt.icon
          const active = current === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              title={opt.label}
              className={`flex items-center gap-1 rounded-sm px-2 py-1.5 text-[10px] font-medium transition-all duration-150 ${
                active ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <Icon />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          )
        })}

        <div className="mx-0.5 h-5 w-px bg-white/15" />

        {/* Isometric corners */}
        {CAMERA_OPTIONS.filter(o => o.group === 'iso').map((opt) => {
          const active = current === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              title={`Isometric ${opt.label}`}
              className={`rounded-sm px-1.5 py-1.5 text-[9px] font-mono font-medium transition-all duration-150 ${
                active ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
