// Flash card types — used by both server actions and UI components.
// Cards are now fetched from the question bank, not hardcoded.

export interface FlashCard {
  id: string
  front: string
  back: string
  code_ref: string
  category: string
}

export interface FlashCategory {
  id: string
  label: string
  description: string
  cardCount: number
}

export const getCategoryLabel = (subjectArea: string): string =>
  subjectArea.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
