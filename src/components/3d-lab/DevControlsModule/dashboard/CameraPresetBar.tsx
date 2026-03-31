'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import type { CameraPreset } from '@/lib/pd1096/types'

const CAMERA_OPTIONS: { value: CameraPreset; label: string }[] = [
  { value: 'orbit', label: 'Orbit' },
  { value: 'top', label: 'Plan' },
  { value: 'front', label: 'Front' },
  { value: 'isometric', label: 'Iso' },
]

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
              ? 'border-[#1B3FC4] bg-[#EEF2FC] text-[#1B3FC4]'
              : 'border-[#D4DAE3] text-[#1A2332] hover:bg-[#EEF2FC]'
          }`}
        >
          {opt.label}
        </button>
      ))}
      <button
        onClick={() => setShowDimensions(!showDimensions)}
        className={`rounded-sm border px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 ${
          showDimensions
            ? 'border-[#1B3FC4] bg-[#EEF2FC] text-[#1B3FC4]'
            : 'border-[#D4DAE3] text-[#1A2332] hover:bg-[#EEF2FC]'
        }`}
      >
        Dims
      </button>
    </div>
  )
}
