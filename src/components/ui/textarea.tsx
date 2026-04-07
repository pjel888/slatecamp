'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({
  className,
  maxLength,
  onChange,
  value,
  defaultValue,
  ...props
}: React.ComponentProps<'textarea'>) {
  const [charCount, setCharCount] = React.useState(() => {
    const initial = (value ?? defaultValue ?? '') as string
    return initial.length
  })

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    },
    [onChange],
  )

  React.useEffect(() => {
    if (value !== undefined) {
      setCharCount((value as string).length)
    }
  }, [value])

  const showCounter = maxLength !== undefined

  return (
    <div data-slot="textarea-wrapper">
      <textarea
        data-slot="textarea"
        className={cn(
          'flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
          className,
        )}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...props}
      />
      {showCounter && (
        <p
          className={cn(
            'mt-1 text-right text-xs text-muted-foreground',
            maxLength - charCount <= 20 && maxLength - charCount > 0 && 'text-warning',
            maxLength - charCount <= 0 && 'text-destructive',
          )}
        >
          {charCount}/{maxLength}
        </p>
      )}
    </div>
  )
}

export { Textarea }
