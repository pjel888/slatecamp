"use client"

import { useState } from "react"
import { CheckSquare, Square } from "@phosphor-icons/react"
import { updateChecklistCompletion } from "@/lib/actions/design-problems"

const BP344_ITEMS = [
  { id: "accessible_path_parking", label: "Accessible path from parking to entrance" },
  { id: "ramp_level_changes", label: "Ramp at all level changes (slope ≤ 1:12)" },
  { id: "accessible_toilet", label: "Accessible toilet (1.7m × 1.8m minimum)" },
  { id: "grab_bars", label: "Grab bars positioned correctly" },
  { id: "accessible_parking", label: "Accessible parking (1 per 50 standard)" },
  { id: "parking_closest_entrance", label: "Parking closest to accessible entrance" },
  { id: "elevator_multi_floor", label: "Elevator if multi-floor (if applicable)" },
  { id: "accessible_signage", label: "Accessible signage included" },
]

type BPComplianceChecklistProps = {
  sessionId: string
  initialCompletion: Record<string, boolean>
}

export const BPComplianceChecklist = ({ sessionId, initialCompletion }: BPComplianceChecklistProps) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(initialCompletion)
  const [saving, setSaving] = useState(false)

  const completedCount = Object.values(checked).filter(Boolean).length
  const totalCount = BP344_ITEMS.length

  const handleToggle = async (itemId: string) => {
    const next = { ...checked, [itemId]: !checked[itemId] }
    setChecked(next)
    setSaving(true)
    await updateChecklistCompletion(sessionId, next)
    setSaving(false)
  }

  return (
    <div className="rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#1A2332]">BP 344 Compliance</h3>
          <p className="text-xs text-[#8896A7] mt-0.5">Accessibility requirements checklist</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-[#1B3FC4]">{completedCount}</span>
          <span className="text-xs text-[#8896A7]">/{totalCount}</span>
          {saving && <p className="text-[10px] text-[#8896A7] mt-0.5">Saving...</p>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[#D4DAE3] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#1B3FC4] transition-all duration-150 ease-out"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Items */}
      <ul className="flex flex-col gap-1">
        {BP344_ITEMS.map((item) => {
          const isChecked = checked[item.id] ?? false
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className="w-full flex items-start gap-2.5 text-left py-1.5 px-0 rounded-sm hover:bg-[#F8F7F5] transition-colors duration-150 ease-out group"
              >
                <span className={`shrink-0 mt-0.5 ${isChecked ? "text-[#2D9F6F]" : "text-[#8896A7]"}`}>
                  {isChecked
                    ? <CheckSquare size={16} weight="fill" />
                    : <Square size={16} />
                  }
                </span>
                <span className={`text-xs leading-relaxed ${isChecked ? "text-[#4A5568] line-through" : "text-[#1A2332]"}`}>
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {completedCount === totalCount && (
        <div className="rounded-sm bg-[#EDFAF4] border border-[#2D9F6F]/20 px-3 py-2">
          <p className="text-xs text-[#2D9F6F] font-medium">All BP 344 requirements addressed</p>
        </div>
      )}
    </div>
  )
}
