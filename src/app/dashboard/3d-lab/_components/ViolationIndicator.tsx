// src/app/dashboard/3d-lab/_components/ViolationIndicator.tsx
'use client'

import { Html } from '@react-three/drei'
import { AlertTriangle } from 'lucide-react'

interface ViolationIndicatorProps {
  position: [number, number, number]
  message: string
  codeRef: string
  visible: boolean
  distanceFactor?: number
}

export function ViolationIndicator({ position, message, codeRef, visible, distanceFactor = 8 }: ViolationIndicatorProps) {
  if (!visible) return null
  return (
    <Html position={position} distanceFactor={distanceFactor} occlude={false}>
      <div style={{ pointerEvents: 'none' }} className="flex items-start gap-1 bg-red-50/95 backdrop-blur-sm border border-red-300 rounded px-2 py-1 shadow-md max-w-[200px] -translate-x-1/2">
        <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold text-red-700 leading-tight">{message}</p>
          <p className="text-[9px] text-red-500 mt-0.5">{codeRef}</p>
        </div>
      </div>
    </Html>
  )
}
