"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { getViewerEntitlements } from "@/lib/entitlements/get-viewer-entitlements";
import { ENTITLEMENT_FEATURE_KEYS } from "@/lib/entitlements/feature-keys";
import {
  logEntitlementAuditEvent,
  serializeOverrideState,
} from "@/lib/entitlements/audit";

export type FinalStretchPhase = "final_approach" | "countdown" | "final_week" | "exam_eve";

export interface FinalStretchState {
  active: boolean;
  daysLeft: number | null;
  phase: FinalStretchPhase | null;
  /** Free user and upsell not yet shown for this profile */
  showUpsellModal: boolean;
}

function getPhase(daysLeft: number): FinalStretchPhase {
  if (daysLeft <= 3) return "exam_eve";
  if (daysLeft <= 7) return "final_week";
  if (daysLeft <= 20) return "countdown";
  return "final_approach";
}

/**
 * Calculates Final Stretch state from user_global_stats.
 */
export async function getFinalStretchState(): Promise<FinalStretchState> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return { active: false, daysLeft: null, phase: null, showUpsellModal: false };
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
  ])

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('target_exam_date, final_stretch_upsell_shown')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!stats?.target_exam_date) {
    return { active: false, daysLeft: null, phase: null, showUpsellModal: false };
  }

  const target = new Date(stats.target_exam_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffMs = target.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));

  if (daysLeft > 30) {
    return { active: false, daysLeft, phase: null, showUpsellModal: false };
  }

  const phase = getPhase(daysLeft);
  const isPaid =
    entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.questionsUnlimited]?.allowed ?? false
  const showUpsellModal = !isPaid && !stats.final_stretch_upsell_shown;

  logEntitlementAuditEvent({
    eventName: showUpsellModal ? 'entitlement.denied' : 'entitlement.decision',
    timestamp: new Date().toISOString(),
    traceId: entitlements.traceId,
    userId: entitlements.userId,
    routeOrAction: 'final-stretch:getFinalStretchState',
    featureKey: ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
    normalizedRole: entitlements.normalizedRole,
    roleSource: entitlements.roleResolution.resolvedFrom,
    rawTier: entitlements.rawTier,
    subscriptionStatus: entitlements.subscriptionStatus,
    effectiveTier: entitlements.effectiveTier,
    overrideState: serializeOverrideState(entitlements.overrides),
    decision: !showUpsellModal,
    denialReason: showUpsellModal ? 'insufficient_tier' : undefined,
    decisionSource: 'final-stretch',
    trace: ['final-stretch', `showUpsellModal=${showUpsellModal}`],
  })

  return { active: true, daysLeft, phase, showUpsellModal };
}

/**
 * Identifies weak taxonomy nodes for final focus.
 */
export async function getWeakNodesForFinalStretch(
  limit = 3
): Promise<{ node_id: string; node_name: string; percentage: number; suggestedCount: number }[]> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return [];

  const { data: masteries } = await supabase
    .from("user_node_mastery")
    .select("topic_id, current_mastery_weight, taxonomy_tree(name)")
    .eq("user_id", user.id)
    .lt("current_mastery_weight", 0.75)
    .order("current_mastery_weight", { ascending: true })
    .limit(limit);

  if (!masteries?.length) return [];

  return masteries.map((m: any) => ({
    node_id: m.topic_id,
    node_name: m.taxonomy_tree?.name ?? "Topic",
    percentage: Math.round(m.current_mastery_weight * 100),
    suggestedCount: 15,
  }));
}

export async function markFinalStretchUpsellShown(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return;
  await supabase
    .from("user_global_stats")
    .update({ final_stretch_upsell_shown: true })
    .eq("user_id", user.id);
}
