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
    className="group flex items-center justify-between rounded-md border border-[#D4DAE3] bg-white px-4 py-3 transition-shadow duration-150 hover:shadow-sm"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#EEF2FC]">
        <Users size={18} className="text-[#1B3FC4]" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#1A2332] group-hover:text-[#1B3FC4] transition-colors duration-150">
          {pod.pod_name}
        </p>
        <p className="mt-0.5 text-xs text-[#8896A7]">
          {pod.member_count} of 6 members
        </p>
      </div>
    </div>
    <span className="ml-3 font-mono text-xs text-[#8896A7]">{pod.invite_code}</span>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-[#1A2332]">Study Pods</h1>
            <p className="mt-0.5 text-xs text-[#8896A7]">
              Track score progress together — privately.
            </p>
          </div>

          {isPro && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus size={14} aria-hidden="true" />}
            >
              New pod
            </Button>
          )}
        </div>

        {/* Pro-only notice */}
        {!isPro && (
          <div className="rounded-md border border-[#D4DAE3] bg-[#F8F7F5] px-4 py-3">
            <p className="text-xs text-[#4A5568]">
              <span className="font-medium text-[#1A2332]">Creating pods requires Pro.</span>{' '}
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
        <div className="rounded-md border border-[#D4DAE3] bg-white p-4">
          <h2 className="mb-3 text-xs font-semibold text-[#1A2332]">
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
