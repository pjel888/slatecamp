'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, ArrowLeft, SignOut, Crown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DeltaBadge } from '@/components/shared/delta-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { leavePod } from '@/lib/actions/pods'
import type { PodData } from '@/lib/actions/pods'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PodViewProps {
  pod: PodData
  currentUserId: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export const PodView = ({ pod, currentUserId }: PodViewProps) => {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [leaveError, setLeaveError] = useState<string | null>(null)

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(pod.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeave = () => {
    setLeaveError(null)
    startTransition(async () => {
      const result = await leavePod(pod.pod_id)
      if (result.ok === false) {
        setLeaveError(result.error)
        return
      }
      router.push('/dashboard/pods')
    })
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/pods')}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All pods
      </button>

      {/* Goal Reached Banner */}
      {pod.goal_reached && (
        <div className="rounded-md border border-success/30 bg-success-50 px-4 py-3">
          <p className="text-sm font-semibold text-success">
            Pod Goal Reached
          </p>
          <p className="mt-0.5 text-xs text-success/80">
            Every member has reached 70% readiness. Keep strengthening together.
          </p>
        </div>
      )}

      {/* Pod Header Card */}
      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">{pod.pod_name}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {pod.member_count} of 6 members
            </p>
          </div>

          {/* Invite code */}
          <div className="flex items-center gap-1.5 rounded-sm border border-border bg-background px-3 py-1.5">
            <span className="font-mono text-xs text-muted-foreground">{pod.invite_code}</span>
            <button
              onClick={handleCopyCode}
              aria-label="Copy invite code"
              className="ml-1 rounded-sm p-0.5 text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              {copied ? (
                <Check size={13} className="text-success" aria-hidden="true" />
              ) : (
                <Copy size={13} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Members
          </h2>
        </div>

        <ul className="divide-y divide-border">
          {pod.members.map((member) => {
            const isCreator = member.user_id === pod.created_by
            const isCurrentUser = member.user_id === currentUserId

            return (
              <li
                key={member.user_id}
                className={cn(
                  'flex items-center justify-between px-4 py-3',
                  isCurrentUser && 'bg-background',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    displayName={member.display_name}
                    avatarUrl={member.avatar_url}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-foreground">
                        {member.display_name ?? 'Member'}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] text-muted-foreground">(you)</span>
                      )}
                      {isCreator && (
                        <Crown
                          size={12}
                          className="text-warning"
                          aria-label="Pod creator"
                        />
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Score change since joining
                    </p>
                  </div>
                </div>

                <DeltaBadge delta={member.score_delta} />
              </li>
            )
          })}
        </ul>
      </div>

      {/* Leave Pod */}
      <div className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground">
          You can rejoin with the same invite code.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLeave}
          disabled={isPending}
          leftIcon={<SignOut size={14} aria-hidden="true" />}
          className="text-destructive hover:text-destructive"
        >
          {isPending ? 'Leaving…' : 'Leave pod'}
        </Button>
      </div>

      {leaveError && (
        <p className="text-xs text-destructive">{leaveError}</p>
      )}
    </div>
  )
}
