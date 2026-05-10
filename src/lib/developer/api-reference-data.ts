// Developer portal API reference data extracted from the route file to keep the page component focused on rendering.

// ─── Route Handler data ───────────────────────────────────────────────────────

export const paymentEndpoints = [
  {
    method: 'POST',
    path: '/api/payments/checkout',
    description: 'Create a PayRex checkout session for a paid tier.',
    auth: 'User session (Supabase)',
    badges: ['Zod'],
    requestSchema: `// Body
{
  tier: "pro" | "prime" | "institutional"   // "free" returns 400
}`,
    responseExample: `// 200 OK — PayRex
{
  "url": "https://checkout.payrex.com/...",
  "id": "pi_...",
  "provider": "payrex"
}

// 200 OK — Demo mode
{
  "url": "/dashboard/settings?success=true",
  "id": "demo-checkout",
  "provider": "demo"
}`,
    curlExample: `curl -X POST https://slatecamp.com/api/payments/checkout \\
  -H "Content-Type: application/json" \\
  -H "Cookie: <session>" \\
  -d '{"tier":"pro"}'`,
  },
]

export const webhookEndpoints = [
  {
    method: 'POST',
    path: '/api/webhooks/payrex',
    description: 'Handle PayRex payment events. Verifies payrex-signature header.',
    auth: 'PayRex webhook signature (PAYREX_WEBHOOK_SECRET)',
    badges: ['PayRex'],
    requestSchema: `// PayRex Event — raw body required for signature verification
// Handled events:
//   payment_intent.succeeded → upsert user_subscriptions
//                              (tier from metadata.tier or tierFromAmount(amount_cents), status='active')`,
    responseExample: `{ "received": true }`,
  },
]

export const cronEndpoints = [
  {
    method: 'GET',
    path: '/api/cron/focus-review-scan',
    description:
      'Generate Focus Review queues for paid users. Scans taxonomy heatmap for red/grey nodes and compiles 12-question queues. Expires pending queues older than 7 days.',
    auth: 'CRON_SECRET (Authorization: Bearer)',
    badges: ['Daily', '16:00 UTC'],
    requestSchema: `// No body. Schedule: "0 16 * * *" (16:00 UTC = midnight PHT)
// Authorization: Bearer \${CRON_SECRET}

// Tables read:
//   quiz_sessions       — active users (completed, last 30 days)
//   focus_review_queues    — skip users with pending/in_progress queues
//   user_subscriptions  — paid users only (active/trialing, tier != free)
//   user_node_mastery   — weak nodes (mastery < 0.4)
//   taxonomy_tree       — grey leaf nodes (is_leaf, not deprecated, has lea_id)

// Tables written:
//   focus_review_queues    — INSERT { user_id, node_ids[3], question_count:12,
//                                  pre_queue_mastery, status:'pending' }
//                       — UPDATE expired status for stale pending queues`,
    responseExample: `{
  "processed": 142,
  "queuesCreated": 87,
  "skipped": 55,
  "expired": 12
}`,
  },
  {
    method: 'GET',
    path: '/api/cron/compute-signals',
    description:
      'Calculate score velocity, churn risk, and session stats for all active users. Runs after focus-review-scan.',
    auth: 'CRON_SECRET (Authorization: Bearer)',
    badges: ['Daily', '16:30 UTC'],
    requestSchema: `// No body. Schedule: "30 16 * * *" (16:30 UTC = 00:30 PHT)
// Authorization: Bearer \${CRON_SECRET}

// Tables read:
//   quiz_sessions              — completed sessions (last 30/7 days)
//   user_global_stats          — global_readiness_score
//   readiness_score_snapshots  — baseline score ≥7 days ago

// Tables written:
//   user_computed_signals — UPSERT {
//     score_velocity_7d,        // Δscore per day over last 7d
//     churn_risk_score,         // 0.0–1.0 composite risk
//     days_since_last_session,
//     sessions_last_7d,
//     computed_at
//   }`,
    responseExample: `{
  "processed": 142,
  "updated": 139
}`,
  },
]

export const aiEndpoints = [
  {
    method: 'POST',
    path: '/api/ai/tutor',
    description:
      'Provider-backed AI contextual explanation for a quiz answer. Returns structured Misconception / Principle / Wiki Reference. Temperature=0.',
    auth: 'User session + rate limit (ai_{userId})',
    badges: ['OpenRouter-ready', 'temp=0'],
    requestSchema: `{
  message: string,       // user message / prompt
  context: {
    question: string,
    correctAnswer: string,
    userAnswer: string,
    rationale?: string
    // any question context object
  }
}`,
    responseExample: `{
  "reply": {
    "type": "text",
    "text": "**Misconception:** ...\\n**Principle:** ...\\n**Wiki Reference:** ..."
  }
}

// 429 — Rate limit exceeded
{ "error": "Rate limit exceeded. Please wait before sending another message." }`,
    curlExample: `curl -X POST https://slatecamp.com/api/ai/tutor \\
  -H "Content-Type: application/json" \\
  -H "Cookie: <session>" \\
  -d '{"message":"Explain why A is correct","context":{"question":"...","correctAnswer":"A","userAnswer":"B"}}'`,
  },
  {
    method: 'POST',
    path: '/api/ai/generate-questions',
    description:
      'Generate AI practice questions from source content. Returns structured MCQ array.',
    auth: 'User session + rate limit (ai_{userId})',
    badges: ['OpenRouter-ready', 'temp=0.7'],
    requestSchema: `{
  chunkContent: string,      // source text to generate from
  profession: string,        // e.g. "Architecture"
  examTarget: string,        // e.g. "ARE 5.0"
  difficulty?: "easy" | "medium" | "hard",   // default: "medium"
  count?: number             // default: 5
}`,
    responseExample: `{
  "questions": [
    {
      "prompt": "What is the primary structural function of a shear wall?",
      "choices": [
        { "id": "a", "text": "Resist lateral forces", "is_correct": true },
        { "id": "b", "text": "Support vertical loads only", "is_correct": false }
      ],
      "correct_answer": "a",
      "explanation": "Shear walls resist lateral forces...",
      "difficulty": "medium",
      "tags": ["structural"]
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/ai/study-agent',
    description:
      'AI study assistance: summarize notes into atomic bullets, generate flashcard recall questions, or flag code/rule references against NBCP.',
    auth: 'User session + rate limit (ai_{userId})',
    badges: ['OpenRouter-ready', 'temp=0.4'],
    requestSchema: `{
  action: "summarize" | "flashcards" | "code_check",
  content: string    // note text to process
}`,
    responseExample: `// action: "summarize"
{ "text": "**Key points (atomic):**\\n- First main idea...\\n- Second idea..." }

// action: "flashcards"
{ "text": "**Suggested recall questions:**\\n1. What is...\\n2. How does..." }

// action: "code_check"
{ "text": "**Code check:** Your note mentions..." }`,
  },
]

export const adminEndpoints = [
  {
    method: 'POST',
    path: '/api/admin/flags',
    description:
      'Set feature flag overrides via a secure httpOnly cookie (cerebro_dev_flags). 7-day TTL.',
    auth: 'Admin role (isAdmin check)',
    badges: ['Zod'],
    requestSchema: `// Body validated by featureFlagsSchema (Zod)
// Shape depends on defined feature flags — any boolean flag overrides.
// Cookie set: cerebro_dev_flags (httpOnly, secure, sameSite=strict, maxAge=7d)`,
    responseExample: `{ "success": true }

// 401 — Not authenticated
// 403 — Not admin
// 400 — Zod validation error`,
  },
  {
    method: 'DELETE',
    path: '/api/admin/flags',
    description: 'Clear all feature flag cookie overrides.',
    auth: 'Admin role (isAdmin check)',
    responseExample: `{ "success": true }`,
  },
]


export const routeHandlerSections = [
  { label: 'Payments', endpoints: paymentEndpoints },
  { label: 'Webhooks', endpoints: webhookEndpoints },
  { label: 'Cron Jobs', endpoints: cronEndpoints },
  { label: 'AI', endpoints: aiEndpoints },
  { label: 'Admin', endpoints: adminEndpoints },
]

// ─── Server Actions data ──────────────────────────────────────────────────────

type ActionRow = {
  fn: string
  description: string
  reads: string
  writes: string
  auth: string
  badge?: string
}

type ActionGroup = {
  domain: string
  actions: ActionRow[]
}

export const actionGroups: ActionGroup[] = [
  {
    domain: 'Quiz Engine',
    actions: [
      {
        fn: 'createQuizSession(params)',
        description: 'Create a new quiz session with mode, question IDs, and topic scope.',
        reads: 'questions, user_subscriptions',
        writes: 'quiz_sessions',
        auth: 'User',
      },
      {
        fn: 'saveInteraction(interaction)',
        description:
          'Record a single question interaction; triggers SRS update, mastery recalc, and signal compute.',
        reads: 'questions, quiz_sessions',
        writes: 'user_interactions, user_node_mastery, srs_schedules',
        auth: 'User',
      },
      {
        fn: 'updateQuizSession(sessionId, updates)',
        description: 'Update session status or current_question_index.',
        reads: 'quiz_sessions',
        writes: 'quiz_sessions',
        auth: 'User',
      },
      {
        fn: 'deleteQuizSession(sessionId)',
        description: 'Soft-delete an incomplete quiz session.',
        reads: 'quiz_sessions',
        writes: 'quiz_sessions',
        auth: 'User',
      },
      {
        fn: 'getSessionQuestions(questionIds)',
        description: 'Fetch ordered question records by ID array.',
        reads: 'questions',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'getQuestionsByTopic(nodeId, limit)',
        description: 'Fetch up to limit questions for a taxonomy node.',
        reads: 'questions',
        writes: '—',
        auth: 'User',
      },
    ],
  },
  {
    domain: 'Admin Content',
    actions: [
      {
        fn: 'createQuestion(data)',
        description: 'Insert a new question with choices, rationale, and taxonomy mapping.',
        reads: 'taxonomy_tree',
        writes: 'questions',
        auth: 'Admin',
      },
      {
        fn: 'updateQuestion(id, data)',
        description: 'Update question fields, choices, and taxonomy tags.',
        reads: 'questions',
        writes: 'questions',
        auth: 'Admin',
      },
      {
        fn: 'deleteQuestions(ids)',
        description: 'Bulk-delete questions by ID array.',
        reads: '—',
        writes: 'questions',
        auth: 'Admin',
      },
      {
        fn: 'createWikiArticle(data)',
        description: 'Create a wiki article with MDX content, taxonomy node, and metadata.',
        reads: 'taxonomy_tree',
        writes: 'wiki_articles',
        auth: 'Admin',
      },
      {
        fn: 'updateWikiArticle(id, data)',
        description: 'Update wiki article content, slug, status, or metadata.',
        reads: 'wiki_articles',
        writes: 'wiki_articles',
        auth: 'Admin',
      },
    ],
  },
  {
    domain: 'Wiki',
    actions: [
      {
        fn: 'getTaxonomyTree(disciplineId)',
        description: 'Fetch full taxonomy tree with articles for the wiki sidebar.',
        reads: 'taxonomy_tree, wiki_articles',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'getWikiArticleBySlug(slug)',
        description: 'Fetch a single published wiki article by slug.',
        reads: 'wiki_articles',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'searchWikiArticles(query)',
        description: 'Full-text search across published wiki articles using Postgres RPC.',
        reads: 'wiki_articles',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'searchWikiPaginated(query, page)',
        description: 'Paginated keyword wiki search fallback.',
        reads: 'wiki_articles',
        writes: '—',
        auth: 'User',
      },
    ],
  },
  {
    domain: 'Wiki Engagement',
    actions: [
      {
        fn: 'recordArticleRead(params)',
        description: 'Record that a user has opened a wiki article.',
        reads: 'wiki_articles',
        writes: 'wiki_article_reads',
        auth: 'User',
      },
      {
        fn: 'updateReadProgress(params)',
        description: 'Update scroll progress percentage for an article read.',
        reads: 'wiki_article_reads',
        writes: 'wiki_article_reads',
        auth: 'User',
      },
      {
        fn: 'getWikiBookmarks()',
        description: 'List all bookmarked wiki articles for the current user.',
        reads: 'wiki_bookmarks, wiki_articles',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'addWikiBookmark(articleId)',
        description: 'Bookmark a wiki article.',
        reads: '—',
        writes: 'wiki_bookmarks',
        auth: 'User',
      },
      {
        fn: 'removeWikiBookmark(articleId)',
        description: 'Remove a wiki article bookmark.',
        reads: '—',
        writes: 'wiki_bookmarks',
        auth: 'User',
      },
    ],
  },
  {
    domain: 'Mastery & Analytics',
    actions: [
      {
        fn: 'getDashboardPageData()',
        description: 'Aggregate all dashboard metrics: readiness, mastery, heatmap, recent sessions.',
        reads:
          'user_global_stats, user_node_mastery, taxonomy_tree, quiz_sessions, user_subscriptions',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'recomputeAndSaveReadinessScore(userId)',
        description:
          'Run IRT 2PL readiness computation and persist snapshot. Called after each session.',
        reads: 'user_node_mastery, user_interactions',
        writes: 'user_global_stats, readiness_score_snapshots',
        auth: 'User / System',
      },
    ],
  },
  {
    domain: 'Trails',
    actions: [
      {
        fn: 'getPublishedTrails()',
        description: 'List all published camp trails ordered by featured → duration.',
        reads: 'camp_trails',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'enrollInTrail(trailId)',
        description: 'Enroll current user in a trail and create enrollment record.',
        reads: 'camp_trails',
        writes: 'trail_enrollments',
        auth: 'User',
      },
      {
        fn: 'completeStep(params)',
        description: 'Mark a trail step complete; triggers day completion check.',
        reads: 'trail_steps, trail_days',
        writes: 'trail_progress, trail_day_completions',
        auth: 'User',
      },
      {
        fn: 'getDayCompletions(enrollmentId)',
        description: 'Return list of completed day IDs for an enrollment.',
        reads: 'trail_day_completions',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'recommendTrail()',
        description: 'Return a personalized trail recommendation based on mastery gaps.',
        reads: 'camp_trails, user_node_mastery',
        writes: '—',
        auth: 'User',
      },
    ],
  },
  {
    domain: 'Notes',
    actions: [
      {
        fn: 'getNotesList(folderId?)',
        description: 'List notes for current user, optionally filtered by folder.',
        reads: 'notes',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'getNoteFolders()',
        description: 'List all note folders for current user.',
        reads: 'note_folders',
        writes: '—',
        auth: 'User',
      },
      {
        fn: 'createNote(data)',
        description: 'Create a new note with TipTap JSON content.',
        reads: '—',
        writes: 'notes',
        auth: 'User',
      },
      {
        fn: 'updateNote(id, data)',
        description: 'Update note content, title, pin state, or folder.',
        reads: 'notes',
        writes: 'notes',
        auth: 'User',
      },
      {
        fn: 'deleteNote(id)',
        description: 'Delete a note permanently.',
        reads: '—',
        writes: 'notes',
        auth: 'User',
      },
    ],
  },
]

export const payrexWebhookEvents = [
  {
    event: 'payment_intent.succeeded',
    mutations: [
      "UPSERT user_subscriptions ON CONFLICT user_id with tier (from metadata.tier or derived from amount_cents), status='active', provider='payrex'",
    ],
  },
]

export const webhookSignatureNotes = {
  payrex:
    'Reads raw body text and verifies against payrex-signature using payrex.webhooks.parseEvent(body, signature, PAYREX_WEBHOOK_SECRET). Returns 400 if signature is missing or invalid. Requires PAYREX_WEBHOOK_SECRET.',
} as const

export const sharedWebhookConventions = [
  'The PayRex handler uses createAdminClient() (service role) to bypass RLS for subscription mutations.',
  'Successful webhook responses return { \"received\": true } with HTTP 200. PayRex retries on non-2xx responses.',
  'Register the PayRex webhook endpoint in the provider dashboard against the production URL.',
]
