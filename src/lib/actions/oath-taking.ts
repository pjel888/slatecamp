'use server'

import { createClient } from '@/lib/supabase/server'
import { generatePreOathEmail, generatePostOathEmail } from '@/lib/email-templates/oath-taking'

/**
 * Fetch upcoming oath-taking schedules where oath_date > today.
 * Returns schedules with date, region, and venue information.
 */
export const getUpcomingOathSchedules = async () => {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('oath_taking_schedules')
    .select('schedule_id, oath_date, region, venue, created_at')
    .gt('oath_date', today)
    .order('oath_date', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming oath schedules:', error)
    return { schedules: [], error: error.message }
  }

  return { schedules: data ?? [], error: null }
}

/**
 * Check if a user is eligible for oath-taking emails.
 * User must have:
 * 1. lea_result = 'passed'
 * 2. Matching region in their profile or matching a schedule region
 */
export const getUserOathEligibility = async (
  userId: string,
  scheduleRegion?: string,
) => {
  const supabase = await createClient()

  // Get user profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, lea_result, enrolled_review_center')
    .eq('id', userId)
    .single()

  if (profileError || !profileData) {
    return {
      eligible: false,
      reason: 'Profile not found',
      userName: null,
    }
  }

  // Check if user passed the LEA
  if (profileData.lea_result !== 'passed') {
    return {
      eligible: false,
      reason: `LEA result is "${profileData.lea_result}", not "passed"`,
      userName: profileData.full_name,
    }
  }

  // If scheduleRegion is provided, check if it matches user's region
  if (scheduleRegion && profileData.enrolled_review_center !== scheduleRegion) {
    return {
      eligible: false,
      reason: `User region "${profileData.enrolled_review_center}" does not match schedule region "${scheduleRegion}"`,
      userName: profileData.full_name,
    }
  }

  return {
    eligible: true,
    reason: null,
    userName: profileData.full_name,
  }
}

/**
 * Generate oath-taking email content.
 * Returns both plain text and HTML versions.
 */
export const generateOathEmail = async (
  userName: string,
  templateType: 'pre_oath' | 'post_oath',
) => {
  if (!userName) {
    return {
      subject: '',
      body: '',
      html: '',
      error: 'User name is required',
    }
  }

  try {
    const emailTemplate =
      templateType === 'pre_oath'
        ? generatePreOathEmail(userName)
        : generatePostOathEmail(userName)

    return {
      subject: emailTemplate.subject,
      body: emailTemplate.body,
      html: emailTemplate.html,
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      subject: '',
      body: '',
      html: '',
      error: `Failed to generate email: ${message}`,
    }
  }
}
