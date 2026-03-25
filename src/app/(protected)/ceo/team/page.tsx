import { Users, Plus } from '@phosphor-icons/react'
import { verifyCeoAccess } from '@/lib/queries/ceo/auth'
import { getTeamMembers, getDepartmentCosts } from '@/lib/queries/ceo/team-queries'
import { TeamTable } from '@/components/ceo/TeamTable'
import { DepartmentCostChart } from '@/components/ceo/DepartmentCostChart'
import { formatPeso } from '@/types/ceo'

export const metadata = {
  title: 'Team — CEO Dashboard',
}

const CeoTeamPage = async () => {
  await verifyCeoAccess()

  const members = await getTeamMembers()
  const departmentCosts = getDepartmentCosts(members)

  const activeMembers = members.filter((m) => m.endDate === null)
  const totalMonthlyCost = activeMembers.reduce(
    (sum, m) => sum + (m.monthlyCostPhp ?? 0),
    0,
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            <h1 className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Team
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {activeMembers.length} active{' '}
            {activeMembers.length === 1 ? 'member' : 'members'}
            {totalMonthlyCost > 0 && (
              <>
                {' · '}
                <span className="font-mono tabular-nums">
                  {formatPeso(totalMonthlyCost)}/month
                </span>
              </>
            )}
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150">
          <Plus className="h-3.5 w-3.5" weight="bold" />
          Add Team Member
        </button>
      </div>

      {/* Team Roster */}
      <section className="flex flex-col gap-3">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Team Roster
        </p>
        <div className="bg-card border border-border rounded-md p-4">
          {members.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No team members yet. Add your first team member to get started.
            </div>
          ) : (
            <TeamTable members={members} />
          )}
        </div>
      </section>

      {/* Cost Allocation */}
      {departmentCosts.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Cost Allocation
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Pie Chart */}
            <div className="bg-card border border-border rounded-md p-4">
              <DepartmentCostChart data={departmentCosts} />
            </div>

            {/* Cost Summary List */}
            <div className="bg-card border border-border rounded-md p-4">
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  By Department
                </p>
                <div className="flex flex-col divide-y divide-border">
                  {departmentCosts.map((dept) => (
                    <div
                      key={dept.department}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium capitalize text-foreground">
                          {dept.department}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {dept.headcount} {dept.headcount === 1 ? 'person' : 'people'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-sm tabular-nums font-medium text-foreground">
                          {formatPeso(dept.totalMonthlyCost)}
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                          {dept.percentOfBurn.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {totalMonthlyCost > 0 && (
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm font-medium text-foreground">Total</span>
                    <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                      {formatPeso(totalMonthlyCost)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default CeoTeamPage
