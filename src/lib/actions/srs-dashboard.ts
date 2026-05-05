"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { retentionAfterDays } from "@/lib/srs/retention";

export interface SRSDashboardData {
  dueCount: number;
  avgRetentionPercent: number | null;
  nextReviewAt: string | null;
  nextReviewCount: number;
}

export async function getSRSDashboardData(
  _examProfileId: string
): Promise<SRSDashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getUser();

  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();

  const { data: dueItems } = await supabase
    .from("user_srs_cards")
    .select("updated_at, interval_days")
    .eq("user_id", user.id)
    .lte("next_review_at", now);

  if (dueItems && dueItems.length > 0) {
    const retentions = dueItems.map((item: { updated_at: string; interval_days: number | null }) => {
      const updated = new Date(item.updated_at).getTime();
      const daysSince = (Date.now() - updated) / (24 * 60 * 60 * 1000);
      return retentionAfterDays(daysSince, item.interval_days ?? 1);
    });
    const avg = retentions.reduce((a: number, b: number) => a + b, 0) / retentions.length;
    return {
      dueCount: dueItems.length,
      avgRetentionPercent: Math.round(avg * 100),
      nextReviewAt: null,
      nextReviewCount: 0,
    };
  }

  const { data: nextItems } = await supabase
    .from("user_srs_cards")
    .select("next_review_at")
    .eq("user_id", user.id)
    .gt("next_review_at", now)
    .order("next_review_at", { ascending: true })
    .limit(1);

  const nextReviewAt = nextItems?.[0]?.next_review_at ?? null;
  let nextReviewCount = 0;
  if (nextReviewAt) {
    const { count } = await supabase
      .from("user_srs_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("next_review_at", nextReviewAt);
    nextReviewCount = count ?? 0;
  }

  return {
    dueCount: 0,
    avgRetentionPercent: null,
    nextReviewAt,
    nextReviewCount: nextReviewCount ?? 0,
  };
}
