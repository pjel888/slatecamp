import { getDemoUser } from './config'
import { getDemoDataForTable } from './data'

type Row = Record<string, unknown>
type Filter = { col: string; op: string; val: unknown }
type OrderRule = { col: string; ascending: boolean }

const _g = globalThis as unknown as { __slatecamp_demo_store?: Map<string, Row[]> }
const _store: Map<string, Row[]> = (_g.__slatecamp_demo_store ??= new Map())

const PRIMARY_KEY_BY_TABLE: Record<string, string> = {
  disciplines: 'discipline_id',
  models_3d: 'model_id',
  profiles: 'id',
  questions: 'question_id',
  quiz_sessions: 'session_id',
  taxonomy_tree: 'node_id',
  user_interactions: 'interaction_id',
  wiki_articles: 'article_id',
  audit_logs: 'id',
}

const JOIN_KEY_OVERRIDES: Record<string, string[]> = {
  disciplines: ['discipline_id', 'current_discipline_id'],
  taxonomy_tree: ['topic_id', 'node_id'],
  wiki_articles: ['article_id'],
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function parseInValue(value: unknown) {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []

  const trimmed = value.trim()
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  }

  return [trimmed]
}

function createDemoUuid() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `demo-${suffix}`
}

function ensurePrimaryKey(table: string, row: Row): Row {
  const primaryKey = PRIMARY_KEY_BY_TABLE[table]
  if (!primaryKey || row[primaryKey]) {
    return row
  }

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    ...row,
    [primaryKey]: createDemoUuid() ?? `${table}-${suffix}`,
  }
}

function getSeedRows(table: string): Row[] {
  return deepClone(getDemoDataForTable(table) as Row[])
}

function getRows(table: string): Row[] {
  const existing = _store.get(table)
  if (existing) {
    return existing
  }

  const seeded = getSeedRows(table)
  _store.set(table, seeded)
  return seeded
}

function setRows(table: string, rows: Row[]) {
  _store.set(table, rows)
}

function addRow(table: string, row: Row): Row {
  const rows = getRows(table)
  const baseRow = ensurePrimaryKey(table, {
    ...row,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  })
  rows.push(baseRow)
  return baseRow
}

function updateRows(table: string, filters: Filter[], patch: Row) {
  const rows = getRows(table)
  const cleaned: Row = {}

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      cleaned[key] = value
    }
  }

  for (const row of rows) {
    if (matchesFilters(row, filters)) {
      Object.assign(row, cleaned, { updated_at: new Date().toISOString() })
    }
  }
}

function resolveJoinKey(row: Row, joinTable: string) {
  const candidates = [
    ...(JOIN_KEY_OVERRIDES[joinTable] ?? []),
    `${joinTable.replace(/s$/, '')}_id`,
    `${joinTable}_id`,
  ]

  return candidates.find((candidate) => row[candidate] != null) ?? null
}

function matchesFilters(row: Row, filters: Filter[]) {
  return filters.every(({ col, op, val }) => {
    const fieldVal = row[col]

    switch (op) {
      case 'eq':
        return fieldVal === val
      case 'neq':
        return fieldVal !== val
      case 'in':
        return parseInValue(val).includes(fieldVal)
      case 'not.in':
        return !parseInValue(val).includes(fieldVal)
      case 'lt':
        return typeof fieldVal === 'string' && typeof val === 'string'
          ? fieldVal < val
          : Number(fieldVal) < Number(val)
      case 'lte':
        return typeof fieldVal === 'string' && typeof val === 'string'
          ? fieldVal <= val
          : Number(fieldVal) <= Number(val)
      case 'gt':
        return typeof fieldVal === 'string' && typeof val === 'string'
          ? fieldVal > val
          : Number(fieldVal) > Number(val)
      case 'gte':
        return typeof fieldVal === 'string' && typeof val === 'string'
          ? fieldVal >= val
          : Number(fieldVal) >= Number(val)
      case 'is':
        return val === null ? fieldVal == null : fieldVal === val
      case 'not.is':
        return val === null ? fieldVal != null : fieldVal !== val
      default:
        return true
    }
  })
}

class MockQueryBuilder {
  private readonly table: string
  private filters: Filter[] = []
  private orFilter: string | null = null
  private selectFields = '*'
  private isHead = false
  private countMode: string | null = null
  private orders: OrderRule[] = []
  private limitCount: number | null = null
  private isSingle = false
  private isMaybeSingle = false
  private mutationType: 'insert' | 'update' | 'upsert' | 'delete' | null = null
  private mutationData: unknown = null

  constructor(table: string) {
    this.table = table
  }

  select(fields = '*', options?: { count?: string; head?: boolean }) {
    this.selectFields = fields
    if (options?.head) this.isHead = true
    if (options?.count) this.countMode = options.count
    return this
  }

  eq(col: string, val: unknown) {
    this.filters.push({ col, op: 'eq', val })
    return this
  }

  neq(col: string, val: unknown) {
    this.filters.push({ col, op: 'neq', val })
    return this
  }

  in(col: string, val: unknown) {
    this.filters.push({ col, op: 'in', val })
    return this
  }

  lt(col: string, val: unknown) {
    this.filters.push({ col, op: 'lt', val })
    return this
  }

  lte(col: string, val: unknown) {
    this.filters.push({ col, op: 'lte', val })
    return this
  }

  gt(col: string, val: unknown) {
    this.filters.push({ col, op: 'gt', val })
    return this
  }

  gte(col: string, val: unknown) {
    this.filters.push({ col, op: 'gte', val })
    return this
  }

  is(col: string, val: unknown) {
    this.filters.push({ col, op: 'is', val })
    return this
  }

  not(col: string, op: string, val: unknown) {
    this.filters.push({ col, op: `not.${op}`, val })
    return this
  }

  or(filter: string) {
    this.orFilter = filter
    return this
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orders.push({ col, ascending: options?.ascending ?? true })
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  maybeSingle() {
    this.isMaybeSingle = true
    return this
  }

  insert(data: unknown) {
    this.mutationType = 'insert'
    this.mutationData = data
    return this
  }

  update(data: unknown) {
    this.mutationType = 'update'
    this.mutationData = data
    return this
  }

  upsert(data: unknown) {
    this.mutationType = 'upsert'
    this.mutationData = data
    return this
  }

  delete() {
    this.mutationType = 'delete'
    return this
  }

  private hydrateSelectJoins(rows: Row[]) {
    const joinMatches = this.selectFields.matchAll(/(\w+)(?:!\w+)?\([^)]*\)/g)
    const joinTables = [...joinMatches].map((match) => match[1])

    if (joinTables.length === 0) {
      return rows
    }

    return rows.map((row) => {
      const enriched = { ...row }

      for (const joinTable of joinTables) {
        if (enriched[joinTable] !== undefined) continue

        const joinKey = resolveJoinKey(row, joinTable)
        if (!joinKey) continue

        const joinValue = row[joinKey]
        const joinRows = getRows(joinTable)
        const primaryKey = PRIMARY_KEY_BY_TABLE[joinTable]
        if (!primaryKey) continue

        const match = joinRows.find((joinRow) => joinRow[primaryKey] === joinValue)
        if (match) {
          enriched[joinTable] = match
        }
      }

      return enriched
    })
  }

  private applyOrFilter(rows: Row[]) {
    if (!this.orFilter) return rows

    const parts = this.orFilter.split(',')
    return rows.filter((row) =>
      parts.some((part) => {
        const match = part.trim().match(/^(\w+)\.eq\.(.+)$/)
        if (!match) return true
        const [, col, value] = match
        const normalizedValue =
          value === 'true' ? true : value === 'false' ? false : value
        return String(row[col]) === value || row[col] === normalizedValue
      }),
    )
  }

  private resolve() {
    if (this.mutationType === 'insert') {
      if (Array.isArray(this.mutationData)) {
        const rows = (this.mutationData as Row[]).map((row) => addRow(this.table, row))
        return { data: this.isSingle ? (rows[0] ?? null) : rows, error: null }
      }

      const row = addRow(this.table, this.mutationData as Row)
      return { data: this.isSingle ? row : row, error: null }
    }

    if (this.mutationType === 'update') {
      updateRows(this.table, this.filters, this.mutationData as Row)
      return { data: this.mutationData, error: null }
    }

    if (this.mutationType === 'upsert') {
      const rows = getRows(this.table)
      const existing = rows.find((row) => matchesFilters(row, this.filters))
      if (existing) {
        Object.assign(existing, this.mutationData as Row, {
          updated_at: new Date().toISOString(),
        })
        return { data: existing, error: null }
      }

      return { data: addRow(this.table, this.mutationData as Row), error: null }
    }

    if (this.mutationType === 'delete') {
      const rows = getRows(this.table)
      const nextRows = rows.filter((row) => !matchesFilters(row, this.filters))
      setRows(this.table, nextRows)
      return { data: null, error: null }
    }

    let rows = getRows(this.table).slice()
    rows = this.hydrateSelectJoins(rows)
    rows = this.applyOrFilter(rows)
    rows = rows.filter((row) => matchesFilters(row, this.filters))

    for (const orderRule of this.orders) {
      const { col, ascending } = orderRule
      rows.sort((a, b) => {
        const av = a[col]
        const bv = b[col]
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = String(av) < String(bv) ? -1 : String(av) > String(bv) ? 1 : 0
        return ascending ? cmp : -cmp
      })
    }

    if (this.isHead && this.countMode) {
      return { data: null, error: null, count: rows.length }
    }

    if (this.limitCount !== null) {
      rows = rows.slice(0, this.limitCount)
    }

    if (this.isSingle || this.isMaybeSingle) {
      return { data: rows[0] ?? null, error: null }
    }

    return { data: rows, error: null, count: rows.length }
  }

  then<TResult1 = { data: unknown; error: null; count?: number }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: unknown; error: null; count?: number }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(this.resolve()).then(onfulfilled, onrejected)
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ) {
    return Promise.resolve(this.resolve()).catch(onrejected)
  }

  finally(onfinally?: (() => void) | null) {
    return Promise.resolve(this.resolve()).finally(onfinally ?? undefined)
  }
}

class MockStorageBucket {
  upload(path: string) {
    return Promise.resolve({ data: { path }, error: null })
  }

  border() {
    return Promise.resolve({
      data: null,
      error: { message: 'Demo mode: no real files' },
    })
  }

  getPublicUrl(path: string) {
    return { data: { publicUrl: `/demo-storage/${path}` } }
  }
}

class MockRealtimeChannel {
  constructor(readonly topic: string) {}

  on() {
    return this
  }

  subscribe(callback?: (status: string) => void) {
    callback?.('SUBSCRIBED')
    return this
  }

  unsubscribe() {
    return Promise.resolve('ok')
  }
}

function resolveArticleWithNode(slug: string) {
  const articles = getRows('wiki_articles')
  const nodes = getRows('taxonomy_tree')
  const mappings = getRows('wiki_article_taxonomy')

  const article = articles.find(
    (row) => row.slug === slug && row.status === 'published',
  )

  if (article) {
    const mapping =
      mappings.find(
        (row) => row.article_id === article.article_id && row.is_primary === true,
      ) ?? mappings.find((row) => row.article_id === article.article_id)

    const node = mapping
      ? nodes.find((row) => row.node_id === mapping.node_id) ?? null
      : null

    return { article, node }
  }

  const node = nodes.find((row) => row.slug === slug) ?? null
  if (!node) {
    return { article: null, node: null }
  }

  const mapping =
    mappings.find((row) => row.node_id === node.node_id && row.is_primary === true) ??
    mappings.find((row) => row.node_id === node.node_id)

  const mappedArticle = mapping
    ? articles.find(
        (row) => row.article_id === mapping.article_id && row.status === 'published',
      ) ?? null
    : null

  return { article: mappedArticle, node }
}

function resolvePrimaryWikiSlugForNode(nodeId: string | null) {
  if (!nodeId) return null

  const mappings = getRows('wiki_article_taxonomy')
  const articles = getRows('wiki_articles')
  const primaryMapping =
    mappings.find(
      (row) => row.node_id === nodeId && row.is_primary === true,
    ) ?? mappings.find((row) => row.node_id === nodeId)

  if (!primaryMapping?.article_id) {
    return null
  }

  const article = articles.find(
    (row) =>
      row.article_id === primaryMapping.article_id &&
      (row.status == null || row.status === 'published'),
  )

  return typeof article?.slug === 'string' ? article.slug : null
}

function resolveSubmitQuizAnswerV2(params?: Record<string, unknown>) {
  const sessionId = String(params?.p_session_id ?? '')
  const questionId = String(params?.p_question_id ?? '')
  const userId = String(params?.p_user_id ?? '')

  const sessions = getRows('quiz_sessions')
  const questions = getRows('questions')
  const interactions = getRows('user_interactions')

  const session = sessions.find(
    (row) => row.session_id === sessionId && row.user_id === userId,
  )
  const question = questions.find((row) => row.question_id === questionId)

  if (!session) {
    return {
      single: () =>
        Promise.resolve({
          data: null,
          error: { message: 'Session not found', code: 'P0001' },
        }),
    }
  }

  if (!question) {
    return {
      single: () =>
        Promise.resolve({
          data: null,
          error: { message: 'Question not found', code: 'P0001' },
        }),
    }
  }

  const existingInteraction = interactions.find(
    (row) =>
      row.session_id === sessionId &&
      row.question_id === questionId &&
      row.user_id === userId,
  )

  const patch = {
    session_id: sessionId,
    question_id: questionId,
    topic_id:
      params?.p_topic_id ??
      question.topic_id ??
      null,
    user_id: userId,
    selected_option_id: params?.p_selected_option_id ?? null,
    is_correct: params?.p_is_correct === true,
    time_spent_ms: Number(params?.p_time_spent_ms ?? 0),
    confidence: params?.p_confidence ?? null,
    confidence_score:
      typeof params?.p_confidence_score === 'number'
        ? params.p_confidence_score
        : params?.p_confidence_score == null
          ? null
          : Number(params.p_confidence_score),
    is_suspected_lucky_guess: params?.p_is_suspected_lucky_guess === true,
    question_order:
      typeof params?.p_question_order === 'number'
        ? params.p_question_order
        : Number(params?.p_question_order ?? 0),
    interaction_timestamp: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const interaction = existingInteraction
    ? Object.assign(existingInteraction, patch)
    : addRow('user_interactions', patch)

  const sessionInteractions = interactions.filter(
    (row) => row.session_id === sessionId && row.user_id === userId,
  )
  const answeredCount = sessionInteractions.length
  const correctCount = sessionInteractions.filter(
    (row) => row.is_correct === true,
  ).length

  Object.assign(session, {
    answered_count: answeredCount,
    correct_count: correctCount,
    updated_at: new Date().toISOString(),
  })

  return {
    single: () =>
      Promise.resolve({
        data: {
          interaction_id: interaction.interaction_id ?? null,
          answered_count: answeredCount,
          correct_count: correctCount,
          wiki_slug: resolvePrimaryWikiSlugForNode(
            typeof question.topic_id === 'string' ? question.topic_id : null,
          ),
          rationale: question.rationale ?? null,
        },
        error: null,
      }),
  }
}

function resolveRpc(fn: string, params?: Record<string, unknown>) {
  if (fn === 'submit_quiz_answer_v2') {
    return resolveSubmitQuizAnswerV2(params)
  }

  if (fn === 'get_quiz_session_interaction_stats') {
    const interactions = getRows('user_interactions')
    const sessionId = params?.p_session_id
    const userId = params?.p_user_id
    const filtered = interactions.filter(
      (row) => row.session_id === sessionId && row.user_id === userId,
    )

    return Promise.resolve({
      data: [
        {
          answered_count: filtered.length,
          correct_count: filtered.filter((row) => row.is_correct === true).length,
        },
      ],
      error: null,
    })
  }

  if (fn === 'get_article_with_node') {
    return Promise.resolve({
      data: resolveArticleWithNode(String(params?.p_slug ?? '')),
      error: null,
    })
  }

  if (fn === 'search_wiki_articles_pure') {
    const query = String(params?.query_text ?? '').trim().toLowerCase()
    const limit = Number(params?.match_count ?? 10)
    const rows = getRows('wiki_articles')
      .filter((row) => row.status === 'published')
      .filter((row) => {
        const title = String(row.title ?? '').toLowerCase()
        const content = String(row.content ?? '').toLowerCase()
        return title.includes(query) || content.includes(query)
      })
      .slice(0, limit)
      .map((row) => ({
        article_id: row.article_id,
        title: row.title,
        slug: row.slug,
        snippet: String(row.content ?? '').slice(0, 160),
        rank: 1,
      }))

    return Promise.resolve({ data: rows, error: null })
  }

  return Promise.resolve({ data: null, error: null })
}

export function createMockSupabaseClient() {
  const demoUser = getDemoUser()

  return {
    isMockClient: true,
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: { ...demoUser } as unknown },
          error: null,
        }),
      getSession: () =>
        Promise.resolve({
          data: { session: { user: { ...demoUser } } as unknown },
          error: null,
        }),
      signInWithPassword: () =>
        Promise.resolve({ data: { user: demoUser, session: {} }, error: null }),
      signUp: () =>
        Promise.resolve({ data: { user: demoUser, session: {} }, error: null }),
      signInWithOAuth: () =>
        Promise.resolve({ data: { url: '/dashboard' }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
      exchangeCodeForSession: () =>
        Promise.resolve({ data: { session: {} }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
    },
    from: (table: string) => new MockQueryBuilder(table),
    rpc: (fn: string, params?: Record<string, unknown>) => resolveRpc(fn, params),
    channel: (topic: string) => new MockRealtimeChannel(topic),
    removeChannel: () => Promise.resolve('ok'),
    removeAllChannels: () => Promise.resolve('ok'),
    getChannels: () => [] as MockRealtimeChannel[],
    storage: {
      from: () => new MockStorageBucket(),
    },
  }
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>
