'use server'

import { createClient } from '@/lib/supabase/server'
import type { FlashCard, FlashCategory } from '@/lib/flash-cards'
import { getCategoryLabel } from '@/lib/flash-cards'

/**
 * Fetch flash card categories (subjects) with card counts from the question bank.
 * Groups questions by their taxonomy subject_area.
 */
export const getFlashCategories = async (): Promise<FlashCategory[]> => {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('questions')
    .select('topic_id, taxonomy_tree!inner(subject_area)')
    .not('taxonomy_tree.subject_area', 'is', null)

  if (!rows || rows.length === 0) return []

  // Count questions per subject_area
  const countMap = new Map<string, number>()
  for (const row of rows) {
    const subjectArea = (row as any).taxonomy_tree?.subject_area as string | undefined
    if (!subjectArea) continue
    countMap.set(subjectArea, (countMap.get(subjectArea) ?? 0) + 1)
  }

  return Array.from(countMap.entries())
    .map(([subjectArea, count]) => ({
      id: subjectArea,
      label: getCategoryLabel(subjectArea),
      description: `${count} questions from the question bank`,
      cardCount: count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Fetch flash cards for a specific subject area from the question bank.
 * Each question becomes a card: front = question text, back = correct answer + rationale.
 * Shuffled using Fisher-Yates for variety.
 */
export const getFlashCardsForCategory = async (
  categoryId: string,
  limit = 20
): Promise<{ cards: FlashCard[]; label: string }> => {
  const supabase = await createClient()

  const { data: questions } = await supabase
    .from('questions')
    .select(`
      question_id,
      text,
      options,
      correct_option_id,
      rationale,
      code_citation,
      taxonomy_tree!inner(subject_area, name)
    `)
    .eq('taxonomy_tree.subject_area', categoryId)
    .limit(limit * 2) // fetch extra, then shuffle + trim

  if (!questions || questions.length === 0) {
    return { cards: [], label: getCategoryLabel(categoryId) }
  }

  // Fisher-Yates shuffle
  const shuffled = [...questions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const cards: FlashCard[] = shuffled.slice(0, limit).map((q) => {
    const options = (q.options ?? []) as Array<{ id: string; text: string }>
    const correctOption = options.find((o) => o.id === q.correct_option_id)
    const topicName = (q as any).taxonomy_tree?.name ?? ''

    return {
      id: q.question_id,
      front: q.text,
      back: correctOption?.text ?? 'See rationale',
      code_ref: q.code_citation ?? topicName,
      category: categoryId,
    }
  })

  return { cards, label: getCategoryLabel(categoryId) }
}
