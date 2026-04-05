'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TextChildrenProps {
  children: ReactNode
}

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

interface ToggleButtonProps {
  label: string
  active: boolean
  onClick: () => void
  className?: string
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

export const SectionLabel = ({ children }: TextChildrenProps) => (
  <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
    {children}
  </p>
)

export const Separator = () => <hr className="my-3 border-border" />

export const FieldLabel = ({ children }: TextChildrenProps) => (
  <label className="block text-xs font-medium text-foreground">
    {children}
  </label>
)

export const NumberInput = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  className,
}: NumberInputProps) => (
  <input
    type="number"
    value={value}
    min={min}
    max={max}
    step={step}
    onChange={(event) => onChange(Number(event.target.value))}
    className={cn(
      'mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none transition-colors duration-150 focus:border-primary',
      className,
    )}
  />
)

export const PresetButton = ({
  label,
  active,
  onClick,
  className,
}: ToggleButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-sm border px-2.5 py-1 font-mono text-[10px] transition-colors duration-150',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border text-muted-foreground hover:bg-muted',
      className,
    )}
  >
    {label}
  </button>
)

export const ToggleButton = ({
  label,
  active,
  onClick,
  className,
}: ToggleButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-sm border py-1.5 font-mono text-[10px] transition-colors duration-150',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border text-muted-foreground hover:bg-muted',
      className,
    )}
  >
    {label}
  </button>
)

export const CheckboxField = ({
  label,
  checked,
  onChange,
}: CheckboxFieldProps) => (
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-3.5 w-3.5 rounded-sm border-border accent-primary"
    />
    <span className="text-xs text-foreground">{label}</span>
  </label>
)
