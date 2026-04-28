'use client'

const ADMIN_ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'content_admin', label: 'Content Admin' },
  { value: 'sme_reviewer', label: 'SME Reviewer' },
  { value: 'developer', label: 'Developer' },
  { value: 'ceo', label: 'CEO' },
]

export const RoleSelect = ({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) => {
  return (
    <select
      id="role"
      name="role"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      className="h-8 w-full rounded-sm border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
    >
      <option value="">Select role...</option>
      {ADMIN_ROLE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
