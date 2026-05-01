// Wiki UI Design System — Barrel Exports
// New spec-v1 components for exam-focused wiki articles

export { WikiChangedPill } from './blocks/WikiChangedPill'
export { WikiCalloutBox } from './blocks/WikiCalloutBox'
export { WikiExamTable } from './blocks/WikiExamTable'
export { WikiArticleHero } from './article/WikiArticleHero'
export { WikiLearningJourney, WikiLearningCompletion } from './article/WikiLearningJourney'
export { WikiPartHeader } from './blocks/WikiPartHeader'
export { WikiMistakeCard } from './blocks/WikiMistakeCard'
export { WikiMistakeList } from './blocks/WikiMistakeList'

// Spec-v2 components — article content enrichment
export { KeyValues } from './blocks/KeyValues'
export { SubjectSnapshot } from './blocks/SubjectSnapshot'
export { Tabs, Tab } from './blocks/WikiTabs'
export { Accordion, AccordionItem } from './blocks/WikiAccordion'
export { FormulaBlock } from './blocks/FormulaBlock'
export { InlineQuiz } from './blocks/InlineQuiz'
export { GenericBlock, SPP206RefServices, SPP207RefServices } from './blocks/GenericBlock'
export { TeachBackPrompt } from './blocks/TeachBackPrompt'
export { WrongAnswerBanner } from './blocks/WrongAnswerBanner'
export { ProcessFlow } from './blocks/ProcessFlow'
export { ElaborativeInterrogation } from './blocks/ElaborativeInterrogation'
export { ComparisonTable } from './blocks/ComparisonTable'

export { WikiHeader } from './navigation/WikiHeader'
export { WikiRightSidebar } from './navigation/WikiRightSidebar'
export { WikiRightSidebarSkeleton } from './navigation/WikiRightSidebarSkeleton'

export { WikiReadTracker } from './shared/WikiReadTracker'

// Typed wiki_items renderer (taxonomy_tree.wiki_items JSONB array)
export { WikiItemRenderer } from './article/WikiItemRenderer'
export type { WikiItem } from './article/WikiItemRenderer'

// Re-export existing components used by the current layout
export { Callout, Note, Warn, Tip, Example, CalloutBox, AlertBox, ExamTip, AuthorityContent } from './blocks/Callout'
export { LawCallout } from './blocks/LawCallout'
export { WikiArticleHeader } from './article/WikiArticleHeader'
export { WikiArticle, WikiArticleSkeleton, getArticleHeadings } from './article/WikiArticle'
