// ============================================================================
// SlateCamp CEO Dashboard — Type Contracts
// All components and Server Actions must use these types — no `any`.
// ============================================================================

// === FINANCIAL ===

export interface FinancialSummary {
  mrr: number
  arr: number
  monthlyBurn: number
  netBurn: number
  runwayMonths: number | null
  cashOnHand: number | null
}

export interface RevenueBreakdown {
  month: string
  proMonthly: number
  proExamPass: number
  institutional: number
  total: number
}

export interface UnitEconomics {
  cac: number | null
  ltv: number | null
  ltvCacRatio: number | null
  cacPaybackMonths: number | null
  monthlyChurnRate: number | null
  freeToProConversion: number
  arpu: number | null
}

// === USER & BEHAVIORAL ===

export interface CohortRow {
  cohortMonth: string
  totalUsers: number
  retentionByWeek: number[]
  avgReadinessScore: number
  conversionRate: number
}

export interface ChurnRiskSegment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  userCount: number
  avgDaysSinceLastSession: number
  avgReadinessScore: number
  avgScoreVelocity: number
}

export interface TimeToValue {
  medianDaysToFirstSession: number | null
  diagnosticCompletionRate: number
  medianDaysToConversion: number | null
  avgSessionsBeforeConversion: number | null
  avgScoreAtConversion: number | null
  freeToConversionRate: number
}

export interface EngagementSnapshot {
  snapshotDate: string
  dau: number
  wau: number
  mau: number
  dauMauRatio: number
  avgSessionsPerWeek: number
  avgStreakLength: number
}

export interface ChurnSignal {
  signalKey: string
  signalDescription: string
  affectedUsers: number
  churnMultiplier: number
}

// === TEAM ===

export type TeamDepartment =
  | 'engineering'
  | 'content'
  | 'design'
  | 'marketing'
  | 'operations'
  | 'consulting'

export type SystemRole =
  | 'ceo'
  | 'super_admin'
  | 'admin'
  | 'lead'
  | 'member'
  | 'consultant'
  | 'viewer'

export interface TeamMember {
  id: string
  displayName: string
  roleTitle: string
  department: TeamDepartment
  monthlyCostPhp: number | null
  systemRole: SystemRole
  startDate: string
  endDate: string | null
  userId: string | null
}

export interface DepartmentCost {
  department: string
  headcount: number
  totalMonthlyCost: number
  percentOfBurn: number
}

// === FINANCIAL ENTRIES ===

export type FinancialEntryType = 'revenue' | 'expense' | 'investment'

export interface FinancialEntry {
  id: string
  entryDate: string
  entryType: FinancialEntryType
  category: string
  amountPhp: number
  description: string | null
  isRecurring: boolean
  createdAt: string
  updatedAt: string
}

// === GATE STATUS ===

export interface GateStatus {
  id: string
  gateNumber: number
  enteredAt: string
  exitConditionsMet: Record<string, number | string | boolean>
  notes: string | null
}

// === CASH BALANCE ===

export interface CashBalanceEntry {
  id: string
  balanceDate: string
  amountPhp: number
  notes: string | null
  createdAt: string
}

// === CATEGORIES ===

export const REVENUE_CATEGORIES = [
  'subscription_revenue',
  'exam_pass_revenue',
  'institutional_revenue',
  'api_licensing_revenue',
  'data_intelligence_revenue',
  'white_label_revenue',
  'referral_credit',
  'other_revenue',
] as const

export const EXPENSE_CATEGORIES = [
  'salaries',
  'contractors',
  'ad_spend',
  'server_costs',
  'tools',
  'payment_processing',
  'content_production',
  'legal',
  'office',
  'miscellaneous',
] as const

export const INVESTMENT_CATEGORIES = [
  'founder_investment',
  'angel_round',
  'grant',
  'other_investment',
] as const

export const CATEGORY_LABELS: Record<string, string> = {
  subscription_revenue: 'Subscription Revenue',
  exam_pass_revenue: 'Exam Pass Revenue',
  institutional_revenue: 'Institutional Revenue',
  api_licensing_revenue: 'API Licensing',
  data_intelligence_revenue: 'Data Intelligence',
  white_label_revenue: 'White Label',
  referral_credit: 'Referral Credits',
  other_revenue: 'Other Revenue',
  salaries: 'Salaries',
  contractors: 'Contractors',
  ad_spend: 'Ad Spend',
  server_costs: 'Server / Infra',
  tools: 'Tools & Software',
  payment_processing: 'Payment Processing',
  content_production: 'Content Production',
  legal: 'Legal & Accounting',
  office: 'Office',
  miscellaneous: 'Miscellaneous',
  founder_investment: 'Founder Investment',
  angel_round: 'Angel Round',
  grant: 'Grant',
  other_investment: 'Other Investment',
}

export const DEPARTMENT_COLORS: Record<TeamDepartment, string> = {
  engineering: 'bg-primary/10 text-primary',
  content: 'bg-warning/10 text-warning',
  design: 'bg-purple-100 text-purple-700',
  marketing: 'bg-success/10 text-success',
  operations: 'bg-muted text-muted-foreground',
  consulting: 'bg-accent/10 text-accent',
}

// === FORMATTING HELPERS ===

export const formatPeso = (amount: number): string =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

export const formatPesoCompact = (amount: number): string => {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(0)}K`
  return formatPeso(amount)
}

export const formatPercent = (value: number, decimals = 1): string =>
  `${(value * 100).toFixed(decimals)}%`

export const formatRatio = (value: number): string =>
  `${value.toFixed(1)}:1`

// === CHART COLORS ===

export const CEO_CHART_COLORS = {
  cobalt: '#1B3FC4',
  signalGold: '#F5A623',
  neutral: '#94A3B8',
  success: '#2D9F6F',
  warning: '#D4951A',
  accent: '#E8853A',
} as const
