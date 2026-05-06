'use client'

import { useId, type ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
}: CheckboxFieldProps) => {
  const id = useId()

  return (
    <Label htmlFor={id} className="gap-2 text-xs font-normal text-foreground">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="size-3.5"
      />
      {label}
    </Label>
  )
}
