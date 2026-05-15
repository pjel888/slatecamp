/**
 * Shared registry of wiki MDX component names.
 *
 * This is the single source of truth for which MDX components are registered
 * in the wiki article renderer. It is consumed by:
 *   - WikiArticle.tsx (the component map)
 *   - wiki-markdown.ts (fallback source generation and pre-compile normalization)
 *
 * Keep this list in sync with the WIKI_COMPONENTS map in WikiArticle.tsx.
 * Do NOT create divergent component lists.
 */

/**
 * All custom MDX components registered in the wiki article renderer.
 * This includes callout-style blocks, learning widgets, embedded media,
 * and generic passthrough components.
 */
export const REGISTERED_WIKI_COMPONENTS: ReadonlySet<string> = new Set([
  // Learning callouts / content blocks
  'Note',
  'Warn',
  'Warning',
  'Tip',
  'Example',
  'Callout',
  'ExamTip',
  'AlertBox',
  'CalloutBox',
  'WikiCalloutBox',
  'AuthorityContent',
  'LawCallout',
  'RevealBlock',
  'ComparisonTable',
  'WikiExamTable',
  'WikiTableTabs',
  'SubjectSnapshot',

  // Article structure
  'WikiArticleHero',
  'WikiPartHeader',
  'WikiChangedPill',

  // Mistakes / errors
  'WikiMistakeCard',
  'WikiMistakeList',
  'MistakeCard',
  'MistakeList',
  'Mistakes',

  // Data / key-value
  'KeyValues',
  'FormulaBlock',

  // Interactive
  'InlineQuiz',
  'Tabs',
  'Tab',
  'Accordion',
  'AccordionItem',
  'ElaborativeInterrogation',
  'EIPrompt',
  'EIBlock',

  // References and media
  'WikiReference',
  'Mermaid',
  'ArticleMedia',
  'DoorHinge3D',
  'SourceRef',
  'SourceQuote',
  'SourceList',

  // Generic passthrough (AI-hallucinated or legacy component names)
  'ConflictMatrix',
  'EthicalFramework',
  'RegulationFramework',
  'WikiExactTable',
  'InfoBox',
  'Alert',
  'QuestionBank',
  'ComparisonChart',
  'TechnicalBox',
  'DataQualitySpec',
  'DataTable',
  'ComplianceChecklist',
  'SensorTable',
  'BEMSFunctionality',
  'EnergyDashboard',
  'PriceBreakdown',

  // No-op stubs
  'SPP206RefServices',
  'SPP207RefServices',
])

/**
 * Block-level components that require blank-line separation in MDX.
 * These are paired (opening + closing) components that contain prose.
 * If content starts on the same line as the opening tag, MDX may fail
 * to parse the block boundary.
 */
export const BLOCK_WIKI_COMPONENTS: ReadonlySet<string> = new Set([
  'Note',
  'Warn',
  'Warning',
  'Tip',
  'Example',
  'Callout',
  'ExamTip',
  'AlertBox',
  'CalloutBox',
  'WikiCalloutBox',
  'AuthorityContent',
  'LawCallout',
  'Accordion',
  'AccordionItem',
  'Tabs',
  'Tab',
  'RevealBlock',
  'WikiMistakeCard',
  'WikiMistakeList',
  'MistakeCard',
  'MistakeList',
  'Mistakes',
  'ElaborativeInterrogation',
  'EIPrompt',
  'EIBlock',
  'ComparisonTable',
  'WikiExamTable',
  'SubjectSnapshot',
  'FormulaBlock',
  'InlineQuiz',
  'SourceQuote',
  'SourceList',
])

/**
 * Self-closing components (void elements) that never contain children.
 * These should never be stripped or broken by fallback processing.
 */
export const SELF_CLOSING_WIKI_COMPONENTS: ReadonlySet<string> = new Set([
  'ArticleMedia',
  'DoorHinge3D',
  'SourceRef',
  'SourceQuote',
  'SourceList',
  'WikiTableTabs',
  'WikiReference',
  'Mermaid',
  'WikiChangedPill',
  'WikiArticleHero',
  'WikiPartHeader',
  'SPP206RefServices',
  'SPP207RefServices',
  'ConflictMatrix',
  'EthicalFramework',
  'RegulationFramework',
  'WikiExactTable',
  'InfoBox',
  'Alert',
  'QuestionBank',
  'ComparisonChart',
  'TechnicalBox',
  'DataQualitySpec',
  'DataTable',
  'ComplianceChecklist',
  'SensorTable',
  'BEMSFunctionality',
  'EnergyDashboard',
  'PriceBreakdown',
])

/**
 * Regex-safe list of all registered component names for use in string patterns.
 */
export const REGISTERED_WIKI_COMPONENTS_ALTERNATION: string =
  Array.from(REGISTERED_WIKI_COMPONENTS).join('|')

/**
 * Regex-safe list of block component names for use in string patterns.
 */
export const BLOCK_WIKI_COMPONENTS_ALTERNATION: string =
  Array.from(BLOCK_WIKI_COMPONENTS).join('|')
