import { cn } from '@/lib/utils'

interface FormFieldProps extends React.ComponentProps<'div'> {
  label: React.ReactNode
  htmlFor?: string
  required?: boolean
  error?: React.ReactNode
  hint?: React.ReactNode
}

const FormField = ({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className,
  ...props
}: FormFieldProps) => {
  return (
    <div
      data-slot="form-field"
      data-invalid={error ? true : undefined}
      className={cn('space-y-1.5', className)}
      {...props}
    >
      <label
        data-slot="form-field-label"
        htmlFor={htmlFor}
        className="text-xs font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p data-slot="form-field-error" className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p data-slot="form-field-hint" className="text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export { FormField }
export type { FormFieldProps }
