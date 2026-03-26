// Wiki UI Design System — Barrel Exports
// New spec-v1 components for exam-focused wiki articles

export { WikiChangedPill } from './WikiChangedPill'
export { WikiCalloutBox } from './WikiCalloutBox'
export { WikiExamTable } from './WikiExamTable'
export { WikiArticleHero } from './WikiArticleHero'
export { WikiPartHeader } from './WikiPartHeader'
export { WikiMistakeCard } from './WikiMistakeCard'
export { WikiMistakeList } from './WikiMistakeList'

// Spec-v2 components — article content enrichment
export { KeyValues } from './KeyValues'
export { SubjectSnapshot } from './SubjectSnapshot'
export { Tabs, Tab } from './Tabs'
export { Accordion, AccordionItem } from './Accordion'
export { FormulaBlock } from './FormulaBlock'
export { InlineQuiz } from './InlineQuiz'

// Typed wiki_items renderer (taxonomy_tree.wiki_items JSONB array)
export { WikiItemRenderer } from './WikiItemRenderer'
export type { WikiItem } from './WikiItemRenderer'

// Re-export existing components used by the current layout
export { Callout, Note, Warn, Tip, Example, CalloutBox, AlertBox, ExamTip, AuthorityContent } from './Callout'
export { WikiArticleHeader } from './WikiArticleHeader'
