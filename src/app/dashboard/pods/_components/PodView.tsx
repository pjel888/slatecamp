'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, ArrowLeft, SignOut, Crown, TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { leavePod } from '@/lib/actions/pods'
import type { PodData } from '@/lib/actions/pods'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PodViewProps {
  pod: PodData
  currentUserId: string
}

// ─── Score Delta Badge ────────────────────────────────────────────────────────

const DeltaBadge = ({ delta }: { delta: number }) => {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#EDFAF4] px-1.5 py-0.5 text-xs font-medium text-[#2D9F6F]">
        <TrendUp size={12} aria-hidden="true" />
        +{delta}%
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#FDF0F0] px-1.5 py-0.5 text-xs font-medium text-[#D64545]">
        <TrendDown size={12} aria-hidden="true" />
        {delta}%
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#F8F7F5] px-1.5 py-0.5 text-xs font-medium text-[#8896A7]">
      <Minus size={12} aria-hidden="true" />
      0%
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const MemberAvatar = ({
  displayName,
  avatarUrl,
}: {
  displayName: string | null
  avatarUrl: string | null
}) => {
  const initials = displayName
    ? displayName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={displayName ?? 'Member'}
        className="h-8 w-8 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2FC] text-xs font-semibold text-[#1B3FC4]">
      {initials}
    </div>
  )
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
        className="inline-flex items-center gap-1.5 text-xs text-[#4A5568] transition-colors duration-150 hover:text-[#1A2332]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All pods
      </button>

      {/* Goal Reached Banner */}
      {pod.goal_reached && (
        <div className="rounded-md border border-[#2D9F6F]/30 bg-[#EDFAF4] px-4 py-3">
          <p className="text-sm font-semibold text-[#2D9F6F]">
            Pod Goal Reached
          </p>
          <p className="mt-0.5 text-xs text-[#2D9F6F]/80">
            Every member has reached 70% readiness. Keep strengthening together.
          </p>
        </div>
      )}

      {/* Pod Header Card */}
      <div className="rounded-md border border-[#D4DAE3] bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-[#1A2332]">{pod.pod_name}</h1>
            <p className="mt-0.5 text-xs text-[#8896A7]">
              {pod.member_count} of 6 members
            </p>
          </div>

          {/* Invite code */}
          <div className="flex items-center gap-1.5 rounded-sm border border-[#D4DAE3] bg-[#F8F7F5] px-3 py-1.5">
            <span className="font-mono text-xs text-[#4A5568]">{pod.invite_code}</span>
            <button
              onClick={handleCopyCode}
              aria-label="Copy invite code"
              className="ml-1 rounded-sm p-0.5 text-[#8896A7] transition-colors duration-150 hover:text-[#1B3FC4]"
            >
              {copied ? (
                <Check size={13} className="text-[#2D9F6F]" aria-hidden="true" />
              ) : (
                <Copy size={13} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="rounded-md border border-[#D4DAE3] bg-white">
        <div className="border-b border-[#D4DAE3] px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#8896A7]">
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
                  isCurrentUser && 'bg-[#F8F7F5]',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MemberAvatar
                    displayName={member.display_name}
                    avatarUrl={member.avatar_url}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-[#1A2332]">
                        {member.display_name ?? 'Member'}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] text-[#8896A7]">(you)</span>
                      )}
                      {isCreator && (
                        <Crown
                          size={12}
                          className="text-[#D4951A]"
                          aria-label="Pod creator"
                        />
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#8896A7]">
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
      <div className="flex items-center justify-between rounded-md border border-[#D4DAE3] bg-white px-4 py-3">
        <p className="text-xs text-[#4A5568]">
          You can rejoin with the same invite code.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLeave}
          disabled={isPending}
          leftIcon={<SignOut size={14} aria-hidden="true" />}
          className="text-[#D64545] hover:text-[#D64545]"
        >
          {isPending ? 'Leaving…' : 'Leave pod'}
        </Button>
      </div>

      {leaveError && (
        <p className="text-xs text-[#D64545]">{leaveError}</p>
      )}
    </div>
  )
}
