import type { EIPrompt } from '@/lib/actions/ei-prompts'
import type { BreadcrumbItem, WikiArticleSource } from '@/lib/actions/wiki-actions'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import type { TeachBackEvaluation } from '@/lib/actions/teach-back'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { QuestionForClient } from '@/types/quiz-config'
import type { WikiArticleHeroProps, WikiTableProps } from '@/types/wiki'

export const wikiArticleHeroFixture: WikiArticleHeroProps = {
  subject: 'Building Laws',
  difficulty: 'Intermediate',
  readTime: '11 min',
  title: 'Fire Separation, Occupancy, and Exit Strategy',
  updatedNote: 'Updated March 21, 2026',
  aleTestsYou:
    'identify how occupancy, fire separation, and exit requirements interact when one code variable changes at a time.',
}

export const wikiBreadcrumbsFixture: BreadcrumbItem[] = [
  {
    name: 'Building Laws and Ethics',
    slug: 'building-laws-and-ethics',
    node_id: 'storybook-discipline',
    level: 1,
  },
  {
    name: 'National Building Code',
    slug: 'national-building-code',
    node_id: 'storybook-area',
    level: 2,
  },
  {
    name: 'Fire Safety Planning',
    slug: 'fire-safety-planning',
    node_id: 'storybook-topic',
    level: 3,
  },
]

export const wikiHeaderFixture = {
  breadcrumbs: wikiBreadcrumbsFixture,
  articleId: 'storybook-article',
  articleTitle: wikiArticleHeroFixture.title,
  articleSlug: 'fire-separation-occupancy-exit-strategy',
  scrollContainerId: 'wiki-center-pane',
}

export const wikiHeadingsFixture: TocHeading[] = [
  { id: 'occupancy-load', text: 'Occupancy load drives exit count', level: 2 },
  { id: 'travel-distance', text: 'Travel distance shifts by use group', level: 2 },
  { id: 'sprinkler-exception', text: 'Sprinkler exceptions matter', level: 3 },
  { id: 'separation-rating', text: 'Fire separation rating changes assembly choices', level: 2 },
  { id: 'exam-trap', text: 'Typical ALE trap', level: 3 },
]

export const wikiSourcesFixture: WikiArticleSource[] = [
  {
    source_id: 'source-nbcp',
    label: 'NBCP IRR Rule 7 and Rule 10',
    description: 'Primary occupancy and exit provisions used in the article examples.',
    url: 'https://example.com/nbcp-irr',
    source_type: 'code',
    sort_order: 1,
  },
  {
    source_id: 'source-fire-code',
    label: 'Fire Code IRR Table 10.2.6',
    description: 'Cross-check for fire separation and egress assumptions.',
    url: 'https://example.com/fire-code-irr',
    source_type: 'code',
    sort_order: 2,
  },
  {
    source_id: 'source-review',
    label: 'SlateCamp Review Notes: Exit Strategy',
    description: 'Internal synthesis of the most-tested occupancy scenarios.',
    url: null,
    source_type: 'internal',
    sort_order: 3,
  },
]

export const wikiRelatedTopicsFixture = [
  {
    slug: 'means-of-egress-basics',
    title: 'Means of Egress Basics',
  },
  {
    slug: 'travel-distance-and-dead-ends',
    title: 'Travel Distance and Dead Ends',
  },
  {
    slug: 'fire-rated-corridor-enclosures',
    title: 'Fire-Rated Corridor Enclosures',
  },
]

export const wikiExamTableFixture: WikiTableProps = {
  caption: 'Exit and separation checks',
  columns: ['Parameter', 'Dimension', 'Required Value', 'Source'],
  rows: [
    {
      parameter: 'Unsprinklered travel distance',
      dimension: 'Assembly use',
      value: '45 m',
      source: 'NBCP Rule 10',
      isMostTested: true,
    },
    {
      parameter: 'Sprinklered travel distance',
      dimension: 'Assembly use',
      value: '60 m',
      source: 'NBCP Rule 10',
      isChanged: true,
    },
    {
      parameter: 'Door clear width',
      dimension: 'Per leaf',
      value: '900 mm',
      source: 'BP 344 2024 IRR',
    },
    {
      parameter: 'Fire separation review',
      value: '',
      isSectionHeader: true,
    },
    {
      parameter: 'Two-hour separation',
      dimension: 'Mixed occupancy',
      value: 'Required',
      source: 'Fire Code IRR',
    },
  ],
  hasSourceColumn: true,
}

export const wikiFormulaStepsFixture = [
  {
    variable: 'Required exits',
    operator: '=',
    operands: ['Occupant load', 'Exit capacity'],
    divides: true,
    comment: 'round up to the next whole exit path',
  },
  {
    variable: 'Exit width',
    operator: '=',
    operands: ['Occupant load', '7.6 mm'],
    comment: 'example lecture multiplier',
  },
]

export const wikiKeyValuesFixture = [
  { value: '45 m', label: 'Unsprinklered travel distance' },
  { value: '60 m', label: 'Sprinklered travel distance' },
  { value: '900 mm', label: 'Accessible door clear width' },
  { value: '2 exits', label: 'Minimum for most assembly cases' },
]

export const wikiSubjectSnapshotFixture = [
  { label: 'Exam weight', value: '14%', hero: true },
  { label: 'Primary code', value: 'NBCP IRR' },
  { label: 'Common trap', value: 'Mixing occupancy with use group' },
  { label: 'Memory anchor', value: 'Occupancy load drives exits' },
  { label: 'Related law', value: 'Fire Code IRR' },
]

export const wikiInlineQuizOptionsFixture = [
  { text: 'Occupancy load alone', is_correct: false },
  { text: 'Occupancy load and exit capacity', is_correct: true },
  { text: 'Door material only', is_correct: false },
  { text: 'Window percentage', is_correct: false },
]

export const wikiElaborativeOptionsFixture = [
  {
    text: 'Because higher occupant density increases required egress capacity and may change the exit count.',
    is_correct: true,
  },
  {
    text: 'Because fire separation removes the need for exit width calculations.',
    is_correct: false,
  },
  {
    text: 'Because exit count is fixed once the floor area is known.',
    is_correct: false,
  },
]

export const wikiTeachBackEvaluationFixture: TeachBackEvaluation = {
  score: 78,
  gaps: [
    'You did not explain how occupancy classification changes exit assumptions.',
    'You omitted the sprinkler exception that changes the travel-distance threshold.',
  ],
  correct_points: [
    'You correctly connected occupant load to the number of exits.',
    'You identified fire separation as a code-driven design decision.',
  ],
  factual_errors: [],
  revision_prompt:
    'How would your explanation change if the same floor were sprinklered and partially separated by a rated wall?',
}

export const wikiQuizQuestionsFixture: QuestionForClient[] = [
  {
    question_id: 'wiki-question-1',
    topic_id: 'wiki-topic-1',
    difficulty: 0.3,
    position: 1,
    stem: 'Which input most directly drives the minimum number of exits for a floor?',
    image_url: null,
    image_alt_text: null,
    taxonomy_breadcrumb: 'Building Laws > Fire Safety Planning',
    difficulty_label: 'Easy',
    question_type: 'mcq',
    options: [
      { id: 'wiki-q1-a', letter: 'A', text: 'Window-to-wall ratio' },
      { id: 'wiki-q1-b', letter: 'B', text: 'Occupant load' },
      { id: 'wiki-q1-c', letter: 'C', text: 'Roof slope' },
      { id: 'wiki-q1-d', letter: 'D', text: 'Facade material' },
    ],
  },
  {
    question_id: 'wiki-question-2',
    topic_id: 'wiki-topic-2',
    difficulty: 0.5,
    position: 2,
    stem: 'Which condition commonly extends the allowable travel distance?',
    image_url: null,
    image_alt_text: null,
    taxonomy_breadcrumb: 'Building Laws > Fire Safety Planning',
    difficulty_label: 'Medium',
    question_type: 'mcq',
    options: [
      { id: 'wiki-q2-a', letter: 'A', text: 'Adding skylights' },
      { id: 'wiki-q2-b', letter: 'B', text: 'Increasing ceiling height' },
      { id: 'wiki-q2-c', letter: 'C', text: 'Providing sprinklers' },
      { id: 'wiki-q2-d', letter: 'D', text: 'Changing door swing' },
    ],
  },
  {
    question_id: 'wiki-question-3',
    topic_id: 'wiki-topic-3',
    difficulty: 0.8,
    position: 3,
    stem: 'Why do mixed occupancies often require special fire separation review?',
    image_url: null,
    image_alt_text: null,
    taxonomy_breadcrumb: 'Building Laws > Fire Safety Planning',
    difficulty_label: 'Hard',
    question_type: 'mcq',
    options: [
      { id: 'wiki-q3-a', letter: 'A', text: 'Because lighting rules differ by occupancy' },
      { id: 'wiki-q3-b', letter: 'B', text: 'Because exit signs become optional' },
      { id: 'wiki-q3-c', letter: 'C', text: 'Because occupancy risk can change separation ratings and egress assumptions' },
      { id: 'wiki-q3-d', letter: 'D', text: 'Because stair handrails are exempt in mixed use buildings' },
    ],
  },
]

export const wikiQuizAnswerKeyFixture: Record<string, string> = {
  'wiki-question-1': 'wiki-q1-b',
  'wiki-question-2': 'wiki-q2-c',
  'wiki-question-3': 'wiki-q3-c',
}

export const wikiSidebarNodesFixture: TaxonomyNode[] = [
  {
    node_id: 'storybook-discipline',
    discipline_id: 'laws-discipline',
    parent_id: null,
    level: 1,
    name: 'Building Laws and Ethics',
    subject_area: 'Laws',
    is_leaf: false,
    slug: 'building-laws-and-ethics',
    sort_order: 1,
  },
  {
    node_id: 'storybook-area',
    discipline_id: 'laws-discipline',
    parent_id: 'storybook-discipline',
    level: 2,
    name: 'National Building Code',
    subject_area: 'Laws',
    is_leaf: false,
    slug: 'national-building-code',
    sort_order: 1,
  },
  {
    node_id: 'storybook-topic',
    discipline_id: 'laws-discipline',
    parent_id: 'storybook-area',
    level: 3,
    name: 'Fire Safety Planning',
    subject_area: 'Laws',
    is_leaf: true,
    slug: 'fire-separation-occupancy-exit-strategy',
    sort_order: 1,
    articles: [
      {
        article_id: 'storybook-article',
        slug: 'fire-separation-occupancy-exit-strategy',
        title: wikiArticleHeroFixture.title,
      },
    ],
  },
  {
    node_id: 'storybook-topic-two',
    discipline_id: 'laws-discipline',
    parent_id: 'storybook-area',
    level: 3,
    name: 'Travel Distance and Dead Ends',
    subject_area: 'Laws',
    is_leaf: true,
    slug: 'travel-distance-and-dead-ends',
    sort_order: 2,
    articles: [
      {
        article_id: 'storybook-article-two',
        slug: 'travel-distance-and-dead-ends',
        title: 'Travel Distance and Dead Ends',
      },
    ],
  },
]

export const wikiBookmarksFixture = [
  {
    article_id: 'storybook-bookmark-1',
    slug: 'means-of-egress-basics',
    title: 'Means of Egress Basics',
    created_at: '2026-04-05T08:00:00.000Z',
  },
  {
    article_id: 'storybook-bookmark-2',
    slug: 'fire-rated-corridor-enclosures',
    title: 'Fire-Rated Corridor Enclosures',
    created_at: '2026-04-04T08:00:00.000Z',
  },
]

export const wikiReferenceArticleFixture = {
  article_id: 'storybook-reference-article',
  slug: 'means-of-egress-basics',
  title: 'Means of Egress Basics',
  ale_tests_you:
    'separate exit count, exit width, and travel distance questions before combining them into one code-compliance answer.',
}

export const wikiSearchResultsFixture = [
  {
    id: 'storybook-search-1',
    title: wikiArticleHeroFixture.title,
    slug: wikiHeaderFixture.articleSlug,
    content_snippet:
      'Occupancy, fire separation, and exit strategy overview for ALE review.',
  },
  {
    id: 'storybook-search-2',
    title: 'Travel Distance and Dead Ends',
    slug: 'travel-distance-and-dead-ends',
    content_snippet:
      'How dead-end corridors and travel limits interact in code questions.',
  },
  {
    id: 'storybook-search-3',
    title: 'Means of Egress Basics',
    slug: 'means-of-egress-basics',
    content_snippet:
      'Baseline exit count, width, and discharge concepts.',
  },
]

export const wikiEIPromptFixture: EIPrompt = {
  prompt_id: 'storybook-ei-prompt',
  node_id: 'storybook-topic',
  insert_after_heading: 'Occupancy load drives exit count',
  prompt_text:
    'Why does a change in occupancy classification force you to revisit egress assumptions?',
  reveal_text:
    '<p>Occupancy changes matter because they can alter the risk profile, occupant density, and the exit provisions that the examiner expects you to apply.</p>',
  options: wikiElaborativeOptionsFixture,
  sort_order: 1,
}

export const wikiCompositionParagraphs = [
  'Start with occupant load, because that is the variable that most often changes the exit count the fastest.',
  'Once the load is clear, check whether the floor condition changes travel distance, accessible clearances, or fire separation requirements.',
  'If the problem mixes occupancies, do not assume a single rule governs the whole floor plate. Split the conditions and test the exceptions.',
]
