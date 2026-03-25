import { createClient } from '@/lib/supabase/server'
import type { TeamMember, DepartmentCost } from '@/types/ceo'

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ceo_team_members')
    .select(
      'id, display_name, role_title, department, monthly_cost_php, system_role, start_date, end_date, user_id',
    )
    .order('end_date', { ascending: true, nullsFirst: true })
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Failed to fetch team members:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    displayName: row.display_name as string,
    roleTitle: row.role_title as string,
    department: row.department as TeamMember['department'],
    monthlyCostPhp: row.monthly_cost_php as number | null,
    systemRole: row.system_role as TeamMember['systemRole'],
    startDate: row.start_date as string,
    endDate: row.end_date as string | null,
    userId: row.user_id as string | null,
  }))
}

export const getDepartmentCosts = (members: TeamMember[]): DepartmentCost[] => {
  const active = members.filter((m) => m.endDate === null)
  const totalCost = active.reduce((sum, m) => sum + (m.monthlyCostPhp ?? 0), 0)

  const grouped = new Map<string, { headcount: number; totalMonthlyCost: number }>()

  for (const member of active) {
    const existing = grouped.get(member.department) ?? { headcount: 0, totalMonthlyCost: 0 }
    grouped.set(member.department, {
      headcount: existing.headcount + 1,
      totalMonthlyCost: existing.totalMonthlyCost + (member.monthlyCostPhp ?? 0),
    })
  }

  return Array.from(grouped.entries())
    .map(([department, { headcount, totalMonthlyCost }]) => ({
      department,
      headcount,
      totalMonthlyCost,
      percentOfBurn: totalCost > 0 ? (totalMonthlyCost / totalCost) * 100 : 0,
    }))
    .sort((a, b) => b.totalMonthlyCost - a.totalMonthlyCost)
}
