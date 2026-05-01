import { createClient } from '@supabase/supabase-js'

type CheckResult = {
  name: string
  status: 'pass' | 'fail'
  summary: string
}

type FeatureFlagRow = {
  key: string | null
  target_tier: unknown
}

const CANONICAL_TIERS = new Set(['free', 'pro', 'prime', 'institutional', 'enterprise'])
const CANONICAL_FEATURE_KEYS = new Set([
  'readiness_score_live',
  'analytics_dashboard_full',
  'taxonomy_heatmap_full',
  'questions_all_difficulty',
  'questions_unlimited',
  'camp_trails_full_library',
  'focus_review_protocol',
  'endurance_cycle',
  'full_exam',
  '3d_lab_full',
  'ai_assistant_unlimited',
  'paywall_enabled',
  'storm_mode_enabled',
  'full_exam_enabled',
  'endurance_mode_enabled',
  'custom_session_enabled',
  'subject_mode_enabled',
  'focus_review_enabled',
  'chill_mode_enabled',
  'ai_tutor_enabled',
  'calibration_enabled',
  'developer_portal',
  'dev_toolbar',
  'dev_override_write',
  'admin_cms',
  'ceo_portal',
  'srs_review',
])
const LEGACY_REVIEW_STATUSES = ['review', 'pending_review']
const REQUIRED_MIGRATION = 'supabase/migrations/20260430110000_fix_feature_flag_read_grants.sql'

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

const formatError = (error: { message?: string; code?: string } | null): string => {
  if (!error) {
    return 'unknown error'
  }

  return [error.code, error.message].filter(Boolean).join(': ') || JSON.stringify(error)
}

const addResult = (results: CheckResult[], result: CheckResult): void => {
  results.push(result)
  const marker = result.status === 'pass' ? '✓' : '✗'
  const sink = result.status === 'pass' ? console.log : console.error
  sink(`${marker} ${result.name}: ${result.summary}`)
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Auth cleanup readiness check failed: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const results: CheckResult[] = []

  const featureFlagsWithDeprecatedColumn = await supabase
    .from('feature_flags')
    .select('key,target_tier,target_roles')
    .range(0, 9999)
    .returns<(FeatureFlagRow & { target_roles: unknown })[]>()

  const targetRolesColumnRemoved =
    Boolean(featureFlagsWithDeprecatedColumn.error) &&
    formatError(featureFlagsWithDeprecatedColumn.error).includes('target_roles')

  const featureFlagResult = targetRolesColumnRemoved
    ? await supabase
        .from('feature_flags')
        .select('key,target_tier')
        .range(0, 9999)
        .returns<FeatureFlagRow[]>()
    : featureFlagsWithDeprecatedColumn

  const featureFlags = featureFlagResult.data
  const featureFlagsError = featureFlagResult.error

  if (featureFlagsError) {
    addResult(results, {
      name: 'feature_flags readable',
      status: 'fail',
      summary: `${formatError(featureFlagsError)}; apply ${REQUIRED_MIGRATION} before schema/type cleanup.`,
    })
  } else {
    addResult(results, {
      name: 'feature_flags readable',
      status: 'pass',
      summary: `${featureFlags?.length ?? 0} rows inspected.`,
    })

    if (targetRolesColumnRemoved) {
      addResult(results, {
        name: 'feature_flags.target_roles removed',
        status: 'pass',
        summary: 'Deprecated target_roles column is absent from the runtime schema.',
      })
    } else {
      const roleTargetedFlags = (featureFlagsWithDeprecatedColumn.data ?? [])
        .map((row) => ({
          key: row.key ?? '<unknown>',
          roles: asStringArray(row.target_roles),
        }))
        .filter((row) => row.roles.length > 0)

      addResult(results, {
        name: 'feature_flags.target_roles empty',
        status: roleTargetedFlags.length === 0 ? 'pass' : 'fail',
        summary: roleTargetedFlags.length === 0
          ? 'No role-targeted rows remain.'
          : `${roleTargetedFlags.length} rows still have target_roles: ${roleTargetedFlags.map((row) => row.key).join(', ')}`,
      })
    }

    const nonCanonicalTierFlags = (featureFlags ?? [])
      .map((row) => ({
        key: row.key ?? '<unknown>',
        tiers: asStringArray(row.target_tier).filter((tier) => !CANONICAL_TIERS.has(tier)),
      }))
      .filter((row) => row.tiers.length > 0)

    addResult(results, {
      name: 'feature_flags.target_tier canonical',
      status: nonCanonicalTierFlags.length === 0 ? 'pass' : 'fail',
      summary: nonCanonicalTierFlags.length === 0
        ? 'All target_tier values are canonical.'
        : `${nonCanonicalTierFlags.length} rows contain non-canonical tiers: ${nonCanonicalTierFlags
          .map((row) => `${row.key} [${row.tiers.join(', ')}]`)
          .join('; ')}`,
    })

    const unknownFeatureKeys = (featureFlags ?? [])
      .map((row) => row.key ?? '<unknown>')
      .filter((key) => !CANONICAL_FEATURE_KEYS.has(key))

    addResult(results, {
      name: 'feature_flags.key canonical',
      status: unknownFeatureKeys.length === 0 ? 'pass' : 'fail',
      summary: unknownFeatureKeys.length === 0
        ? 'All feature flag keys match the application entitlement vocabulary.'
        : `${unknownFeatureKeys.length} unknown feature flag key(s): ${unknownFeatureKeys.join(', ')}`,
    })
  }

  const legacyStatusChecks = [
    { table: 'wiki_articles', idColumn: 'article_id' },
    { table: 'wiki_ei_prompts', idColumn: 'prompt_id' },
  ]

  for (const check of legacyStatusChecks) {
    const { count, error } = await supabase
      .from(check.table)
      .select(check.idColumn, { count: 'exact', head: true })
      .in('status', LEGACY_REVIEW_STATUSES)

    if (error) {
      addResult(results, {
        name: `${check.table} legacy review statuses`,
        status: 'fail',
        summary: `${formatError(error)}; launch DB legacy-status readiness could not be proven.`,
      })
      continue
    }

    addResult(results, {
      name: `${check.table} legacy review statuses`,
      status: count === 0 ? 'pass' : 'fail',
      summary: count === 0
        ? 'No review/pending_review rows remain.'
        : `${count ?? 0} rows still use review or pending_review.`,
    })
  }

  const { data: subscriptionTiers, error: legacySubscriptionTierError } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .range(0, 9999)

  const legacySubscriptionTierCount = (subscriptionTiers ?? []).filter(
    (row) => row.tier === 'camp' || row.tier === 'insurance',
  ).length

  if (legacySubscriptionTierError) {
    addResult(results, {
      name: 'user_subscriptions legacy tiers',
      status: 'fail',
      summary: `${formatError(legacySubscriptionTierError)}; subscription tier readiness could not be proven.`,
    })
  } else {
    addResult(results, {
      name: 'user_subscriptions legacy tiers',
      status: legacySubscriptionTierCount === 0 ? 'pass' : 'fail',
      summary: legacySubscriptionTierCount === 0
        ? 'No camp/insurance subscription tiers remain.'
        : `${legacySubscriptionTierCount ?? 0} rows still use camp or insurance tiers.`,
    })
  }

  const failed = results.filter((result) => result.status === 'fail')

  if (failed.length > 0) {
    console.error(`Auth cleanup readiness check failed: ${failed.length} gate(s) are not ready.`)
    process.exit(1)
  }

  console.log('Auth cleanup readiness check passed.')
}

main().catch((error: unknown) => {
  console.error('Auth cleanup readiness check crashed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
