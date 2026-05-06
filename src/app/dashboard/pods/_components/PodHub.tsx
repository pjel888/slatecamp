'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { CreatePodModal } from './CreatePodModal'
import { JoinPodForm } from './JoinPodForm'
import type { UserPod } from '@/lib/actions/pods'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PodHubProps {
  pods: UserPod[]
  isPro: boolean
}

// ─── Pod Card ─────────────────────────────────────────────────────────────────

const PodCard = ({ pod }: { pod: UserPod }) => (
  <Link
    href={`/dashboard/pods/${pod.pod_id}`}
    className="group flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 transition-shadow duration-150 hover:shadow-sm"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary-50">
        <Users size={18} className="text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-150">
          {pod.pod_name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {pod.member_count} of 6 members
        </p>
      </div>
    </div>
    <span className="ml-3 font-mono text-xs text-muted-foreground">{pod.invite_code}</span>
  </Link>
)

// ─── Component ───────────────────────────────────────────────────────────────

export const PodHub = ({ pods, isPro }: PodHubProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreated = (podId: string) => {
    setShowCreateModal(false)
    // Navigate to new pod — use window.location to trigger server re-render
    window.location.href = `/dashboard/pods/${podId}`
  }

  return (
    <>
      <div className="space-y-6">
        {/* Actions */}
        {isPro && (
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus size={14} aria-hidden="true" />}
            >
              New pod
            </Button>
          </div>
        )}

        {/* Pro-only notice */}
        {!isPro && (
          <div className="rounded-md border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Creating pods requires Pro.</span>{' '}
              Anyone can join a pod using an invite code.
            </p>
          </div>
        )}

        {/* Pod list */}
        {pods.length === 0 ? (
          <EmptyState
            icon={<Users size={28} className="text-muted-foreground" aria-hidden="true" />}
            title="No pods yet"
            description={
              isPro
                ? 'Create a pod and share the invite code with your study group.'
                : 'Join a pod using an invite code from a Pro member.'
            }
            action={
              isPro && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={<Plus size={14} aria-hidden="true" />}
                >
                  Create your first pod
                </Button>
              )
            }
            className="border-dashed"
          />
        ) : (
          <div className="space-y-2">
            {pods.map((pod) => (
              <PodCard key={pod.pod_id} pod={pod} />
            ))}
          </div>
        )}

        {/* Join section */}
        <div className="rounded-md border border-border bg-card p-4">
          <h2 className="mb-3 text-xs font-semibold text-foreground">
            Join a pod
          </h2>
          <JoinPodForm />
        </div>
      </div>

      {showCreateModal && (
        <CreatePodModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
