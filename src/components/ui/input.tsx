'use client'

import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { cva, type VariantProps } from 'class-variance-authority'
import { MagnifyingGlass, X } from '@phosphor-icons/react/dist/ssr'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

const inputVariants = cva(
  'w-full min-w-0 rounded-sm border border-input bg-transparent py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-3.5 text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> & VariantProps<typeof inputVariants>

function Input({
  className,
  type,
  size = 'md',
  ...props
}: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  SearchInput                                                       */
/* ------------------------------------------------------------------ */

interface SearchInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'size'> {
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  shortcutHint?: string
  debounceMs?: number
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const searchIconSize: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-4',
}

const searchInputPadding: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'pl-8',
  md: 'pl-9',
  lg: 'pl-10',
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      onClear,
      placeholder = 'Search...',
      shortcutHint,
      debounceMs = 300,
      loading = false,
      size = 'md',
      className,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(controlledValue ?? '')
    const isControlled = controlledValue !== undefined
    const displayValue = isControlled ? controlledValue : internalValue

    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
      if (isControlled) {
        setInternalValue(controlledValue)
      }
    }, [controlledValue, isControlled])

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if (!isControlled) {
          setInternalValue(newValue)
        }

        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
          onChange?.(newValue)
        }, debounceMs)
      },
      [onChange, debounceMs, isControlled],
    )

    React.useEffect(() => {
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
      }
    }, [])

    const handleClear = React.useCallback(() => {
      if (!isControlled) {
        setInternalValue('')
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      onChange?.('')
      onClear?.()
    }, [onChange, onClear, isControlled])

    const hasValue = displayValue.length > 0

    return (
      <div data-slot="search-input" className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          {loading ? (
            <Spinner
              className={cn(searchIconSize[size], 'text-muted-foreground')}
            />
          ) : (
            <MagnifyingGlass
              className={cn(searchIconSize[size], 'text-muted-foreground')}
            />
          )}
        </span>

        <InputPrimitive
          ref={ref}
          type="text"
          data-slot="input"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            inputVariants({ size }),
            searchInputPadding[size],
            (shortcutHint || hasValue) && 'pr-16',
            className,
          )}
          {...props}
        />

        <span className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {shortcutHint && !hasValue && (
            <kbd className="pointer-events-none inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
              {shortcutHint}
            </kbd>
          )}
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className={searchIconSize[size]} />
            </button>
          )}
        </span>
      </div>
    )
  },
)
SearchInput.displayName = 'SearchInput'

export { Input, SearchInput, inputVariants }
