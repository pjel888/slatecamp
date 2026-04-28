'use client'

import { useState, useTransition } from 'react'
import { Warning } from '@phosphor-icons/react/dist/ssr'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { assignSystemRole } from '@/lib/actions/ceo/team-actions'
import type { TeamMember, SystemRole } from '@/types/ceo'

interface RoleAssignmentModalProps {
  member: TeamMember
  isOpen: boolean
  onClose: () => void
}

const ROLE_OPTIONS: { value: SystemRole; label: string; description: string }[] = [
  { value: 'ceo',         label: 'CEO',          description: 'Chief Executive Officer. Full business and admin access.' },
  { value: 'super_admin', label: 'Super Admin', description: 'Full platform access including billing and team management.' },
  { value: 'admin',       label: 'Admin',       description: 'Manage content, questions, and users. Cannot manage billing.' },
  { value: 'lead',        label: 'Lead',         description: 'Team lead access: review analytics and manage content.' },
  { value: 'member',      label: 'Member',       description: 'Standard authenticated user access.' },
  { value: 'consultant',  label: 'Consultant',   description: 'Read-only access to specific reporting views.' },
  { value: 'viewer',      label: 'Viewer',       description: 'Read-only access to the platform.' },
]

export const RoleAssignmentModal = ({ member, isOpen, onClose }: RoleAssignmentModalProps) => {
  const [selectedRole, setSelectedRole] = useState<SystemRole>(member.systemRole)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await assignSystemRole(member.id, selectedRole)
      if (!result.success) {
        setError(result.error ?? 'Failed to assign role.')
        return
      }
      onClose()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Assign System Role</DialogTitle>
          <DialogDescription>
            Updating role for <span className="font-medium text-foreground">{member.displayName}</span>.
            Current role: <span className="font-mono text-[11px]">{member.systemRole}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Warning */}
        <div className="flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2.5 text-[11px] text-warning">
          <Warning size={14} className="mt-0.5 shrink-0" />
          <span>
            This updates <span className="font-mono">profiles.role</span> in the live database.
            Changes take effect immediately.
          </span>
        </div>

        {/* Role Options */}
        <div className="flex flex-col gap-2">
          {ROLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors duration-150',
                selectedRole === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/80 hover:bg-muted/40',
              )}
            >
              <input
                type="radio"
                name="system_role"
                value={option.value}
                checked={selectedRole === option.value}
                onChange={() => setSelectedRole(option.value)}
                className="mt-0.5 accent-primary"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{option.label}</span>
                <span className="text-[11px] text-muted-foreground">{option.description}</span>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <p className="text-[11px] text-destructive">{error}</p>
        )}

        <DialogFooter>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-sm border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || selectedRole === member.systemRole}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save Role Assignment'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
