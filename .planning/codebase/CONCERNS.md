# Project Cerebro — Key Concerns

## Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled with:

- **Users own data** — Can CRUD their profiles, notes, documents
- **Exam profiles scoped** — Users see only their active exam context
- **Published content public** — Question banks, 3D models readable by all

```sql
-- Example: Questions accessible if published or self-created
CREATE POLICY "published questions" ON questions
  FOR SELECT USING (status = 'published' OR creator_id = auth.uid());
```

### Session Management

- **Cookie-based Supabase sessions** — HttpOnly, Secure flags
- **No localStorage** — Prevents XSS token theft
- **SSR cookies** — `@supabase/ssr` handles middleware

### Input Sanitization

- **Markdown rendering** — DOMPurify cleans before inserting
- **MathJax/KaTeX** — Rendered in controlled container
- **3D model URLs** — Served from trusted storage paths only

### API Boundaries

- **Stripe webhooks** — Signed verification, idempotency keys
- **PostHog ingest** — Client-side SDK with event batching
- **AI provider** — Rate limiting headers, payload size checks

---

## Data Consistency

### SRS Queue Management

- **Unique constraint** — `(user_id, exam_profile_id, question_id)` per table
- **Lazy refresh** — Queue updated via cron + on-demand after sessions
- **Overlap detection** — Prevent duplicate question entries

```typescript
// Insert with upsert pattern
await supabase
  .from('srs_queue')
  .upsert({ ...newCard, user_id, exam_profile_id }, { onConflict: '...' })
```

### Session Analytics

- **Materialized view** — `question_user_performance` refreshes post-session
- **Aggregated session_stats** — Subject scores computed at commit time
- **Immutable audit trail** — Review interactions never updated (append-only)

### Diacritic Handling

- **Normalization on write** — User inputs normalized for comparison
- **Slug generation** — `slugify()` with Unicode support
- **Search indexing** — Full-text search with weighted terms

---

## Performance Patterns

### Database Indexes

Strategic indexes for common queries:

- **Composite keys** — `(user_id, exam_profile_id)` on analytics tables
- **Partial indexes** — Only active sessions (`WHERE status = 'in_progress'`)
- **Vector index** — IVFFlat for embeddings (100 lists)

### Caching Strategy

- **Materialized views** — Pre-computed question performance stats
- **React Query** — Client-side caching for server state
- **Browser cache** — Static assets via Next.js headers

### Response Times

- **Quiz UI target** — < 200ms render (720px max-width optimization)
- **Analytics tables** — Aggregated daily stats, not raw event logs
- **Lazy loading** — 3D models fetch on-demand, not upfront

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast

- **Primary CTA** — `#1f3055` (amber) meets 4.5:1 on dark bg
- **Correct/Incorrect** — Green `#34C759`, Red `#BF1B1B`
- **No red/green pairs** — Use patterns/icons alongside color

### Focus Management

- **Keyboard nav** — Tab order via DOM structure
- **Focus visible** — Ring required for interactive elements
- **Skip links** — Main nav accessible via keyboard shortcut

### Screen Readers

- **Semantic HTML** — Buttons not divs with cursor:pointer
- **ARIA labels** — For icon-only buttons, expandable sections
- **Live regions** — Session results announce on completion

---

## Known Limitations

1. **No serverless functions** — Complex logic would need AWS Lambda / Supabase Edge Functions
2. **File uploads** — Currently external (Supabase Storage not yet wired)
3. **Real-time** — No subscriptions; refresh polling for session state
4. **Mobile PWA** — Not installed as app, responsive web only

---

## Future Technical Debt

1. **Embedding model costs** — pgvector calls have rate limits
2. **Analytics bloat** — Consider partitioning study_time_logs by year
3. **3D asset optimization** — GLB files need quantization for mobile
4. **AI tokens** — Current tracking is simple counter; could use quota logic

---

## Compliance Notes

- **GDPR** — User data export via profile deletion cascade
- **CCPA** — No selling; analytics opt-in only (cookie banner)
- **Accessibility** — WCAG 2.1 AA compliance documented for public audits
