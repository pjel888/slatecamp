# MASTER ARCHITECTURE BLUEPRINT: API ROUTES
**Status:** UNIFIED (Panopticon V8)

## 1. Executive Vulnerability Summary
1. **CRITICAL: Authorization Graveyard:** 13 of 18 API endpoints (including CRUD for questions, articles, and taxonomy) lack role-based checks. Any authenticated user can create, modify, or delete core platform content.
2. **HIGH: AI Endpoint Cost Exposure:** AI endpoints (`generate-questions`, `tutor`, `study-agent`) have no rate limiting or tier-based quotas. A single malicious user can drain the OpenAI budget via automated `POST` requests.
3. **MEDIUM: Idempotency & Webhook Race Conditions:** Payment webhooks (LemonSqueezy/Payrex) lack robust idempotency checks beyond basic signature verification. Rapidly retried webhooks could lead to duplicate subscription creation or state desync.

## 2. Exhaustive System Inventory

### 2.1 Route Map & Endpoint Registry
```
src/app/api/
├── auth/                       # Supabase Auth handlers (built-in)
├── questions/                  # GET (list), POST (create), PATCH/DELETE [id]
├── articles/                   # GET (list), POST (create), PATCH/DELETE [id]
├── taxonomy/                   # POST (create), PATCH/DELETE [nodeId]
├── upload/                     # POST (file upload to Supabase Storage)
├── ai/
│   ├── embed/                  # POST (text → embedding vector)
│   ├── generate-questions/     # POST (topic → 10 ALE questions)
│   ├── tutor/                  # POST (Socratic tutoring, temp=0.0)
│   ├── study-agent/            # POST (Adaptive learning)
│   └── socratic/               # POST (Standalone Socratic)
├── lemonsqueezy/webhook/             # POST (LemonSqueezy events)
├── payrex/webhook/             # POST (Payrex events)
├── cron/
│   ├── blindspot-scan/         # GET (Daily 4pm UTC)
│   └── compute-signals/        # GET (Daily 4:30pm UTC)
└── users/                      # GET, PATCH (User management)

12 total route files, 18 total endpoints
```

### 2.2 Cron Job Configuration (`vercel.json`)
```json
{
  "crons": [
    { "path": "/api/cron/blindspot-scan", "schedule": "0 16 * * *" },
    { "path": "/api/cron/compute-signals", "schedule": "30 16 * * *" }
  ]
}
```
*Note:* Both cron endpoints verify `CRON_SECRET` but are vulnerable to IP spoofing if not explicitly limited to Vercel IP ranges.

## 3. Data Flow & Exact Payloads

### 3.1 AI Question Generation (POST `/api/ai/generate-questions`)
- **Request:**
```json
{
  "topic": "Floor Area Ratio under NBC 2022",
  "count": 10,
  "difficulty_distribution": { "easy": 0.3, "medium": 0.5, "hard": 0.2 }
}
```
- **Response:** Returns `questions[]` with `question_text`, `explanation`, `distractors` (array of 5), `correct_answer` (0-4), and `ai_confidence`.

### 3.2 AI Tutor (POST `/api/ai/tutor`)
- **Constraint:** `temperature` hardcoded to `0.0` for deterministic socratic logic.
- **Request:** `{ question_id, user_answer, conversation_history[], mode }`.

### 3.3 CRUD Schemas (Proposed Zod Implementation)
```typescript
export const CreateQuestionSchema = z.object({
  question_text: z.string().min(10).max(2000),
  distractors: z.array(z.string()).min(2).max(5),
  correct_answer: z.number().int().min(0).max(4),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  taxonomy_node_id: z.string().uuid()
})
```

## 4. Extreme Edge-Case & Concurrency Vulnerabilities
- **Concurrency: Provider Rate Limits:** Rapid-fire requests to `/api/ai/*` can trigger OpenAI rate limits (429), causing the tutor or generator to hang. No retry logic with exponential backoff is implemented.
- **Idempotency: Webhook Retries:** LemonSqueezy/Payrex webhooks might retry if the server takes >10s to respond. If `handleCheckoutComplete` isn't idempotent, multiple `user_subscriptions` rows could be created for one payment.
- **Hydration: API-State Desync:** Client-side stores (Zustand) may hold stale versions of data updated via `PATCH` routes. Multi-tab use exacerbates this; updating a question in Tab A isn't reflected in Tab B's local state until a full re-fetch.
- **Security: Unauthorized CRUD:** Any authenticated user can `DELETE /api/questions/[id]` because role checks are missing in the route handler.

## 5. The Unified Resolution Blueprint

### 5.1 Authorization & Validation
1. **Admin Middleware:** Create `requireAdmin()` helper and apply to all `/api/questions`, `/api/articles`, and `/api/taxonomy` routes.
2. **Schema Enforcement:** Use Zod `safeParse` for all `POST`/`PATCH` request bodies.
3. **Idempotency Headers:** Require `X-Idempotency-Key` for all content creation and payment webhook routes.

### 5.2 Performance & Rate Limiting
1. **Upstash Ratelimit:** Implement sliding window rate limiting (10 req/min) for all AI endpoints.
2. **Cron IP Allowlist:** Verify `x-forwarded-for` against Vercel infrastructure IPs in `/api/cron/*`.
3. **Optimistic Locking:** Add `updated_at` checks to `PATCH` routes to prevent "Lost Update" concurrency issues.

### 5.3 Webhook Hardening
1. **Transaction Wrapping:** Wrap all webhook logic in `supabase.rpc` or database transactions to ensure all-or-nothing completion.
2. **Event Deduplication:** Create `processed_webhook_events` table to track `event_id` and prevent double-processing.
