'use client'

import { trackEvent } from '@/lib/analytics'

// ─── Activation funnel ────────────────────────────────────────────────────────

export const trackDiagnosticStarted = (props: {
  persona_type?: string
  referral_source?: string
  device_type?: string
}) => trackEvent({ event_name: 'diagnostic_started', event_properties: props })

export const trackDiagnosticCompleted = (props: {
  questions_answered: number
  time_elapsed_s: number
  completion_rate: number
}) => trackEvent({ event_name: 'diagnostic_completed', event_properties: props })

export const trackDiagnosticAbandoned = (props: {
  questions_answered: number
  last_question_index: number
  time_elapsed_s: number
}) => trackEvent({ event_name: 'diagnostic_abandoned', event_properties: props })

export const trackScoreRevealViewed = (props: {
  score: number
  zone: string
  is_first_view: boolean
  time_to_render_ms: number
}) => trackEvent({ event_name: 'score_reveal_viewed', event_properties: props })

export const trackScoreRevealCtaClicked = (props: {
  cta_type: string
  score: number
  zone: string
}) => trackEvent({ event_name: 'score_reveal_cta_clicked', event_properties: props })

// ─── Retention ────────────────────────────────────────────────────────────────

export const trackSessionStarted = (props: {
  mode: string
  topic_id?: string
  day_number?: number
  source_screen: string
}) => trackEvent({ event_name: 'session_started', event_properties: props })

export const trackSessionCompleted = (props: {
  mode: string
  score: number
  questions_total: number
  time_elapsed_s: number
  topic_id?: string
}) => trackEvent({ event_name: 'session_completed', event_properties: props })

export const trackSessionAbandoned = (props: {
  mode: string
  last_question_index: number
  time_elapsed_s: number
  questions_total: number
}) => trackEvent({ event_name: 'session_abandoned', event_properties: props })

export const trackHeatmapViewed = (props: {
  total_nodes: number
  mastered_count: number
  learning_count: number
  unexplored_count: number
}) => trackEvent({ event_name: 'heatmap_viewed', event_properties: props })

export const trackHeatmapNodeTapped = (props: {
  topic_id: string
  mastery_state: string
  resulted_in_session: boolean
}) => trackEvent({ event_name: 'heatmap_node_tapped', event_properties: props })

// ─── Revenue ──────────────────────────────────────────────────────────────────

export const trackPaywallShown = (props: {
  trigger_context: string
  score_at_time?: number
  sessions_completed: number
  days_since_signup: number
}) => trackEvent({ event_name: 'paywall_shown', event_properties: props })

export const trackPaywallDecision = (props: {
  action: 'upgrade_monthly' | 'upgrade_annual' | 'dismiss'
  time_on_paywall_ms: number
  score_at_time?: number
}) => trackEvent({ event_name: 'paywall_decision', event_properties: props })

// ─── Trail ────────────────────────────────────────────────────────────────────

export const trackTrailDayStarted = (props: {
  day_number: number
  topic_name: string
  is_on_schedule: boolean
}) => trackEvent({ event_name: 'trail_day_started', event_properties: props })

export const trackTrailDayCompleted = (props: {
  day_number: number
  score: number
  time_elapsed_s: number
}) => trackEvent({ event_name: 'trail_day_completed', event_properties: props })

// ─── App engagement ───────────────────────────────────────────────────────────

export const trackAppOpened = (props: {
  days_since_last_visit: number
  current_score?: number
  days_to_exam?: number
}) => trackEvent({ event_name: 'app_opened', event_properties: props })
