import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

const FormField = ({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className,
}: FormFieldProps) => {
  return (
    <div
      data-slot="form-field"
      className={cn('space-y-1.5', className)}
      {...(error ? { 'data-invalid': true } : {})}
    >
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export { FormField }
export type { FormFieldProps }
