'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { PresetChip } from './PresetChip'

interface PresetItem {
  label: string
  isViolation: boolean
  lawColor?: string
}

interface PresetChipStripProps {
  presets: PresetItem[]
  activeIndex: number | null
  onSelect: (index: number) => void
}

const PresetChipStrip = ({ presets, activeIndex, onSelect }: PresetChipStripProps) => (
  <ScrollArea className="w-full">
    <div className="flex items-center gap-2 pb-2">
      {presets.map((preset, i) => (
        <PresetChip
          key={preset.label}
          label={preset.label}
          isActive={activeIndex === i}
          isViolation={preset.isViolation}
          lawColor={preset.lawColor}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
)

export { PresetChipStrip }
export type { PresetChipStripProps, PresetItem }
