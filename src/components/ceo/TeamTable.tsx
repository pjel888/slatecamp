'use client'

import { useState, useMemo } from 'react'
import { Pencil, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RoleAssignmentModal } from '@/components/ceo/RoleAssignmentModal'
import type { TeamMember, TeamDepartment } from '@/types/ceo'
import { DEPARTMENT_COLORS, formatPeso } from '@/types/ceo'
import { DataTable, type Column } from '@/components/shared/data-table'

type FilterTab = 'all' | TeamDepartment

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Content', value: 'content' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Ops', value: 'operations' },
  { label: 'Consulting', value: 'consulting' },
]

interface TeamTableProps {
  members: TeamMember[]
}

export const TeamTable = ({ members }: TeamTableProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [showAlumni, setShowAlumni] = useState(false)
  const [assignModalMember, setAssignModalMember] = useState<TeamMember | null>(null)

  const now = new Date()

  const { activeMembers, alumniMembers } = useMemo(() => {
    const filtered =
      activeFilter === 'all'
        ? members
        : members.filter((m) => m.department === activeFilter)

    return {
      activeMembers: filtered.filter(
        (m) => m.endDate === null || new Date(m.endDate) > now,
      ),
      alumniMembers: filtered.filter(
        (m) => m.endDate !== null && new Date(m.endDate) <= now,
      ),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, activeFilter])

  const buildColumns = (isAlumni: boolean): Column<TeamMember>[] => [
    {
      key: 'displayName',
      header: 'Name',
      sortable: true,
      render: (member) => (
        <span className={cn('text-sm font-medium text-foreground', isAlumni && 'opacity-60')}>
          {member.displayName}
        </span>
      ),
    },
    {
      key: 'roleTitle',
      header: 'Role Title',
      sortable: true,
      render: (member) => (
        <span className={cn('text-sm text-muted-foreground', isAlumni && 'opacity-60')}>
          {member.roleTitle}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (member) => (
        <span
          className={cn(
            'inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium',
            DEPARTMENT_COLORS[member.department],
            isAlumni && 'opacity-60',
          )}
        >
          {member.department}
        </span>
      ),
    },
    {
      key: 'monthlyCostPhp',
      header: 'Monthly Cost',
      sortable: true,
      type: 'number',
      render: (member) => (
        <span className={cn('font-mono text-sm tabular-nums text-foreground', isAlumni && 'opacity-60')}>
          {member.monthlyCostPhp !== null ? formatPeso(member.monthlyCostPhp) : '—'}
        </span>
      ),
    },
    {
      key: 'systemRole',
      header: 'System Role',
      sortable: true,
      render: (member) => (
        <span
          className={cn(
            'inline-flex items-center rounded-sm border border-border px-2 py-0.5 text-[11px] text-muted-foreground',
            isAlumni && 'opacity-60',
          )}
        >
          {member.systemRole}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Since',
      sortable: true,
      type: 'date',
    },
    {
      key: 'status',
      header: 'Status',
      render: (member) =>
        isAlumni ? (
          <span className="inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            Alumni
          </span>
        ) : (
          <span className="inline-flex items-center rounded-sm bg-success/10 px-2 py-0.5 text-[11px] text-success">
            Active
          </span>
        ),
    },
    {
      key: 'actions',
      header: '',
      type: 'action',
      render: (member) => (
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-150"
            aria-label={`Edit ${member.displayName}`}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          {member.userId && (
            <button
              onClick={() => setAssignModalMember(member)}
              className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-150"
              aria-label={`Assign role to ${member.displayName}`}
            >
              <ShieldCheck className="h-3 w-3" />
              Role
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Department filter tabs */}
      <div className="mb-4 flex flex-wrap gap-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={cn(
              'rounded-sm px-3 py-1.5 text-[11px] font-medium transition-colors duration-150',
              activeFilter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={buildColumns(false) as unknown as Column<Record<string, unknown>>[]}
        data={activeMembers as unknown as Record<string, unknown>[]}
        keyField="id"
        defaultSort={{ key: 'startDate', direction: 'asc' }}
        pageSize={20}
        emptyMessage="No active members in this department."
      />

      {/* Alumni section */}
      {alumniMembers.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAlumni((v) => !v)}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            {showAlumni ? 'Hide alumni' : `Show ${alumniMembers.length} alumni`}
          </button>
          {showAlumni && (
            <div className="mt-3">
              <DataTable
                columns={buildColumns(true) as unknown as Column<Record<string, unknown>>[]}
                data={alumniMembers as unknown as Record<string, unknown>[]}
                keyField="id"
                defaultSort={{ key: 'startDate', direction: 'asc' }}
                pageSize={0}
                emptyMessage="No alumni."
              />
            </div>
          )}
        </div>
      )}

      {/* Role Assignment Modal */}
      {assignModalMember && (
        <RoleAssignmentModal
          member={assignModalMember}
          isOpen={assignModalMember !== null}
          onClose={() => setAssignModalMember(null)}
        />
      )}
    </div>
  )
}
