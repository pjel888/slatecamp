'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FocusOption } from '@/types/testing'
import { ALE_SUBJECTS } from '@/types/testing'

interface SubjectEntry {
  subjectId: string
  subjectName: string
}

interface FocusSelectorProps {
  selected: FocusOption
  onChange: (value: FocusOption) => void
  selectedSubjectId?: string
  onSubjectChange?: (subjectId: string) => void
  subjects?: SubjectEntry[]
}

const FOCUS_OPTIONS: { value: FocusOption; label: string; helper?: string }[] = [
  { value: 'weakest', label: 'Prioritize weakest areas', helper: '(recommended)' },
  { value: 'single-subject', label: 'Focus on one subject' },
  { value: 'mixed', label: 'Mix all subjects equally' },
]

const FocusSelector = ({
  selected,
  onChange,
  selectedSubjectId,
  onSubjectChange,
  subjects,
}: FocusSelectorProps) => {
  const subjectList = subjects ?? ALE_SUBJECTS.map((s) => ({ subjectId: s.id, subjectName: s.name }))

  return (
    <div>
      <RadioGroup
        value={selected}
        onValueChange={(val) => onChange(val as FocusOption)}
        className="gap-3"
      >
        {FOCUS_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <RadioGroupItem value={opt.value} id={`focus-${opt.value}`} />
            <span className="text-[14px] text-[var(--foreground)] font-medium select-none">
              {opt.label}
              {opt.helper && (
                <span className="ml-1 text-[var(--muted-foreground)] font-normal">{opt.helper}</span>
              )}
            </span>
          </label>
        ))}
      </RadioGroup>

      {selected === 'single-subject' && (
        <div className="mt-3 ml-7">
          <Select
            value={selectedSubjectId}
            onValueChange={(val) => onSubjectChange?.(val)}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectList.map((s) => (
                <SelectItem key={s.subjectId} value={s.subjectId}>
                  {s.subjectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

FocusSelector.displayName = 'FocusSelector'

export { FocusSelector }
