'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PodMember {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  score_delta: number
  joined_at: string
}

export interface PodData {
  pod_id: string
  pod_name: string
  invite_code: string
  created_by: string
  created_at: string
  member_count: number
  members: PodMember[]
  goal_reached: boolean
}

export interface UserPod {
  pod_id: string
  pod_name: string
  invite_code: string
  member_count: number
  created_by: string
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MAX_MEMBERS = 6
const GOAL_THRESHOLD = 70

// ─── Actions ─────────────────────────────────────────────────────────────────

export const createPod = async (
  name: string,
): Promise<ActionResult<{ pod_id: string; invite_code: string }>> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  // Pro-only: check subscription tier
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub || sub.tier === 'free') {
    return {
      ok: false,
      error: 'Study Pods are available to Pro subscribers only.',
    }
  }

  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Pod name is required.' }
  if (trimmed.length > 60) return { ok: false, error: 'Pod name must be 60 characters or less.' }

  // Create pod
  const { data: pod, error: podError } = await supabase
    .from('study_pods')
    .insert({ pod_name: trimmed, created_by: user.id })
    .select('pod_id, invite_code')
    .single()

  if (podError || !pod) {
    return { ok: false, error: 'Failed to create pod. Please try again.' }
  }

  // Auto-join creator
  const { error: joinError } = await supabase
    .from('pod_members')
    .insert({ pod_id: pod.pod_id, user_id: user.id })

  if (joinError) {
    return { ok: false, error: 'Pod created but failed to join. Please try again.' }
  }

  revalidatePath('/dashboard/pods')
  return { ok: true, data: { pod_id: pod.pod_id, invite_code: pod.invite_code } }
}

export const joinPod = async (
  inviteCode: string,
): Promise<ActionResult<{ pod_id: string }>> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const trimmed = inviteCode.trim().toLowerCase()
  if (!trimmed) return { ok: false, error: 'Invite code is required.' }

  // Find the pod
  const { data: pod, error: podError } = await supabase
    .from('study_pods')
    .select('pod_id, pod_name')
    .eq('invite_code', trimmed)
    .maybeSingle()

  if (podError || !pod) {
    return { ok: false, error: 'Invalid invite code. Please check and try again.' }
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', pod.pod_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return { ok: true, data: { pod_id: pod.pod_id } }
  }

  // Check member count
  const { count } = await supabase
    .from('pod_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('pod_id', pod.pod_id)

  if ((count ?? 0) >= MAX_MEMBERS) {
    return {
      ok: false,
      error: `This pod is full (max ${MAX_MEMBERS} members).`,
    }
  }

  const { error: joinError } = await supabase
    .from('pod_members')
    .insert({ pod_id: pod.pod_id, user_id: user.id })

  if (joinError) {
    return { ok: false, error: 'Failed to join pod. Please try again.' }
  }

  revalidatePath('/dashboard/pods')
  return { ok: true, data: { pod_id: pod.pod_id } }
}

export const leavePod = async (
  podId: string,
): Promise<ActionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('pod_members')
    .delete()
    .eq('pod_id', podId)
    .eq('user_id', user.id)

  if (error) {
    return { ok: false, error: 'Failed to leave pod. Please try again.' }
  }

  revalidatePath('/dashboard/pods')
  return { ok: true, data: undefined }
}

export const getPodData = async (
  podId: string,
): Promise<ActionResult<PodData>> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  // Verify caller is a member
  const { data: membership } = await supabase
    .from('pod_members')
    .select('user_id')
    .eq('pod_id', podId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) return { ok: false, error: 'You are not a member of this pod.' }

  // Fetch pod info
  const { data: pod, error: podError } = await supabase
    .from('study_pods')
    .select('pod_id, pod_name, invite_code, created_by, created_at')
    .eq('pod_id', podId)
    .single()

  if (podError || !pod) return { ok: false, error: 'Pod not found.' }

  // Fetch all members + join timestamps
  const { data: members, error: membersError } = await supabase
    .from('pod_members')
    .select('user_id, joined_at')
    .eq('pod_id', podId)

  if (membersError || !members) return { ok: false, error: 'Failed to load members.' }

  const memberIds = members.map((m: { user_id: string }) => m.user_id)

  // Fetch profiles for members
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', memberIds)

  const profileMap = new Map<string, { id: string; display_name: string | null; avatar_url: string | null }>(
    (profiles ?? []).map((p: { id: string; display_name: string | null; avatar_url: string | null }) => [
      p.id,
      p,
    ]),
  )

  // Fetch current readiness scores
  const { data: globalStats } = await supabase
    .from('user_global_stats')
    .select('user_id, global_readiness_score')
    .in('user_id', memberIds)

  const currentScoreMap = new Map<string, number>(
    (globalStats as Array<{ user_id: string; global_readiness_score: number }> ?? []).map(
      (g) => [g.user_id, g.global_readiness_score ?? 0],
    ),
  )

  // For each member, find the readiness snapshot closest to their joined_at
  const podMembers: PodMember[] = await Promise.all(
    members.map(async (m: { user_id: string; joined_at: string }) => {
      const profile = profileMap.get(m.user_id)
      const currentScore = currentScoreMap.get(m.user_id) ?? 0

      // Find closest snapshot at or before joined_at
      const { data: snapshotRaw } = await supabase
        .from('readiness_score_snapshots')
        .select('score, computed_at')
        .eq('user_id', m.user_id)
        .lte('computed_at', m.joined_at)
        .order('computed_at', { ascending: false })
        .limit(1)

      const snapshots = snapshotRaw as Array<{ score: number; computed_at: string }> | null
      const joinScore: number = snapshots?.[0]?.score ?? currentScore
      const delta = Math.round((currentScore - joinScore) * 10) / 10

      return {
        user_id: m.user_id,
        display_name: profile?.display_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        score_delta: delta,
        joined_at: m.joined_at,
      }
    }),
  )

  // Goal: all members >= 70% readiness
  const allScores = memberIds.map((id) => currentScoreMap.get(id) ?? 0)
  const goal_reached =
    allScores.length > 0 && allScores.every((s) => s >= GOAL_THRESHOLD)

  return {
    ok: true,
    data: {
      pod_id: pod.pod_id,
      pod_name: pod.pod_name,
      invite_code: pod.invite_code,
      created_by: pod.created_by,
      created_at: pod.created_at,
      member_count: members.length,
      members: podMembers,
      goal_reached,
    },
  }
}

export const getUserPods = async (): Promise<ActionResult<UserPod[]>> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  // Get pods the user is a member of
  const { data: memberships, error } = await supabase
    .from('pod_members')
    .select('pod_id, study_pods(pod_id, pod_name, invite_code, created_by)')
    .eq('user_id', user.id)

  if (error) return { ok: false, error: 'Failed to load pods.' }

  const podIds = (memberships ?? []).map((m: { pod_id: string }) => m.pod_id)

  if (podIds.length === 0) return { ok: true, data: [] }

  // Get member counts for each pod
  const { data: counts } = await supabase
    .from('pod_members')
    .select('pod_id')
    .in('pod_id', podIds)

  const countMap = new Map<string, number>()
  for (const row of counts ?? []) {
    const c = (row as { pod_id: string }).pod_id
    countMap.set(c, (countMap.get(c) ?? 0) + 1)
  }

  const pods: UserPod[] = (memberships ?? []).map(
    (m: { pod_id: string; study_pods: { pod_id: string; pod_name: string; invite_code: string; created_by: string } | null }) => ({
      pod_id: m.pod_id,
      pod_name: m.study_pods?.pod_name ?? '',
      invite_code: m.study_pods?.invite_code ?? '',
      created_by: m.study_pods?.created_by ?? '',
      member_count: countMap.get(m.pod_id) ?? 1,
    }),
  )

  return { ok: true, data: pods }
}
