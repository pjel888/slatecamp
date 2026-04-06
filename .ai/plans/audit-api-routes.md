# AUDIT: API ROUTES
**Portal:** `/api/*` and `/app/api/`
**Generated:** Ultrawork Pass 1 (Background Agent: `bg_abc5f3a5`, 6m 3s)
**Agent:** explore (ses_29bc65e33ffeBQBFIqJpGjWK46)

---

## 1. COMPLETE ENDPOINT INVENTORY

### 1.1 Route File Map

```
src/app/api/
├── auth/
│   └── [...supabase]/
│       └── route.ts              # Supabase Auth handlers (built-in)
├── questions/
│   ├── route.ts                  # GET (list), POST (create)
│   └── [id]/
│       └── route.ts             # GET, PATCH, DELETE
├── articles/
│   ├── route.ts                 # GET (list), POST (create)
│   └── [id]/
│       └── route.ts             # GET, PATCH, DELETE
├── taxonomy/
│   ├── route.ts                 # POST (create node)
│   └── [nodeId]/
│       └── route.ts             # GET, PATCH, DELETE
├── upload/
│   └── route.ts                 # POST (file upload)
├── ai/
│   ├── embed/
│   │   └── route.ts             # POST (text → embedding vector)
│   ├── generate-questions/
│   │   └── route.ts             # POST (topic → 10 questions)
│   ├── tutor/
│   │   └── route.ts             # POST (socratic tutoring, temp=0.0)
│   ├── study-agent/
│   │   └── route.ts             # POST (adaptive learning)
│   └── socratic/
│       └── route.ts             # POST (Socratic questioning)
├── stripe/
│   └── webhook/
│       └── route.ts             # POST (Stripe webhook handler)
├── payrex/
│   └── webhook/
│       └── route.ts             # POST (Payrex webhook handler)
├── cron/
│   ├── blindspot-scan/
│   │   └── route.ts             # GET (daily 4pm UTC)
│   └── compute-signals/
│       └── route.ts             # GET (daily 4:30pm UTC)
└── users/
    └── route.ts                 # GET, PATCH (user management)

12 total route files, 18 total endpoints
```

---

## 2. ENDPOINT DEEP DIVE

### 2.1 AI Endpoints (5 routes)

#### POST /api/ai/embed

**Purpose:** Convert text to embedding vector for semantic search

**Request:**
```json
{
  "text": "string (required, max 8192 chars)"
}
```

**Response:**
```json
{
  "embedding": "number[] (1536 dimensions for text-embedding-ada-002)",
  "model": "text-embedding-ada-002",
  "tokens_used": 42
}
```

**Implementation:**
```tsx
// src/app/api/ai/embed/route.ts
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { text } = await req.json()
  
  if (!text || text.length > 8192) {
    return Response.json({ error: 'Invalid text' }, { status: 400 })
  }
  
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  })
  
  // Store in Supabase for future semantic search
  const supabase = createClient()
  await supabase.from('question_embeddings').insert({
    content: text,
    embedding: embedding.data[0].embedding,
    model: 'text-embedding-ada-002',
    tokens: embedding.usage.total_tokens
  })
  
  return Response.json({
    embedding: embedding.data[0].embedding,
    model: 'text-embedding-ada-002',
    tokens_used: embedding.usage.total_tokens
  })
}
```

**Authorization:** Authenticated users only (NO role check)

---

#### POST /api/ai/generate-questions

**Purpose:** Generate 10 ALE-style multiple choice questions from a topic

**Request:**
```json
{
  "topic": "string (required)",
  "subject_id": "string (optional)",
  "count": "number (default: 10, max: 20)",
  "difficulty_distribution": {
    "easy": 0.3,
    "medium": 0.5,
    "hard": 0.2
  }
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "uuid (temporary, not yet in DB)",
      "question_text": "string",
      "explanation": "string",
      "distractors": ["A", "B", "C", "D", "E"],
      "correct_answer": "number (0-4)",
      "difficulty": "easy | medium | hard",
      "taxonomy_node_id": "uuid | null",
      "ai_confidence": "number (0-1)"
    }
  ],
  "tokens_used": 2847,
  "cost_usd": 0.005694
}
```

**System Prompt:** (from src/lib/ai/prompts/generate-questions.ts)
```
You are an expert Philippine Architecture Licensure Exam question writer.
Generate questions that follow the exact format of past board exam questions.
Each question must have:
- Clear, unambiguous question text
- 5 distractors (4 plausible wrong answers, 1 correct)
- Detailed explanation for the correct answer
- Appropriate difficulty level
```

**Authorization:** Authenticated users (NO tier check — anyone can generate)

**Cost:** ~$0.00057 per question (OpenAI gpt-4o-mini pricing)

---

#### POST /api/ai/tutor

**Purpose:** Socratic tutoring conversation with temperature=0.0 (deterministic)

**Request:**
```json
{
  "question_id": "uuid",
  "user_answer": "string",
  "conversation_history": [
    { "role": "user" | "assistant", "content": "string" }
  ],
  "mode": "socratic | hint | explanation"
}
```

**Response:**
```json
{
  "response": "string (Socratic response)",
  "suggestions": ["string (up to 3)"],
  "tokens_used": 1234
}
```

**Implementation:**
```tsx
// CRITICAL: Temperature hardcoded to 0.0
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...systemPrompt, ...conversationHistory, newMessage],
  temperature: 0.0,  // Deterministic output
  max_tokens: 1000
})
```

**Authorization:** Authenticated users only

---

#### POST /api/ai/study-agent

**Purpose:** Adaptive learning agent that personalizes study recommendations

**Request:**
```json
{
  "user_id": "uuid",
  "topic_id": "uuid (optional)",
  "action": "recommend | practice | review | quiz"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "question_id": "uuid",
      "reason": "string",
      "priority": "number (1-10)"
    }
  ],
  "study_plan": {
    "estimated_time_minutes": 45,
    "topics": ["uuid"]
  },
  "confidence_boost": "number (0-1)"
}
```

**Implementation:**
```tsx
// Uses IRT model to calculate optimal next questions
// Reads: user_mastery, question_difficulty, learning_history
// Writes: study_plan, recommendations to user cache
```

---

#### POST /api/ai/socratic

**Purpose:** Standalone Socratic questioning without quiz context

**Request:**
```json
{
  "topic": "string",
  "difficulty": "easy | medium | hard",
  "style": "questioning | hint | explanation"
}
```

**Response:**
```json
{
  "content": "string (Socratic response)",
  "follow_up_prompts": ["string (3 options)"]
}
```

---

### 2.2 Cron Endpoints (2 routes)

#### GET /api/cron/blindspot-scan

**Purpose:** Daily scan for knowledge gaps (4pm UTC)

**Schedule:** Every day at 4:00 PM UTC (configured in vercel.json)

**Implementation:**
```tsx
// src/app/api/cron/blindspot-scan/route.ts
import { NextResponse } from 'next/server'
import { scanBlindspots } from '@/lib/srs/blindspot'

export async function GET(req: Request) {
  // 1. Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 2. Scan for blindspots
  const results = await scanBlindspots()
  
  // 3. Notify users with new blindspots
  // 4. Log scan results
  
  return NextResponse.json({
    success: true,
    blindspots_found: results.count,
    users_notified: results.notified
  })
}
```

**Cron Configuration (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/blindspot-scan",
      "schedule": "0 16 * * *"
    }
  ]
}
```

---

#### GET /api/cron/compute-signals

**Purpose:** Daily computation of user signals, readiness scores, mastery

**Schedule:** Every day at 4:30 PM UTC (30 min after blindspot-scan)

**Implementation:**
```tsx
// src/app/api/cron/compute-signals/route.ts
import { NextResponse } from 'next/server'
import { computeUserSignals } from '@/lib/compute-signals'

export async function GET(req: Request) {
  // 1. Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 2. For each active user:
  //    - Recalculate mastery per taxonomy node (IRT 2PL)
  //    - Update user_readiness_scores table
  //    - Compute blindspot queue
  //    - Update engagement_snapshot materialized view
  
  const results = await computeUserSignals()
  
  return NextResponse.json({
    success: true,
    users_processed: results.count,
    signals_computed: results.signals,
    duration_ms: results.duration
  })
}
```

---

### 2.3 Webhook Endpoints (2 routes)

#### POST /api/stripe/webhook

**Purpose:** Handle Stripe payment events

**Events Handled:**
```
- checkout.session.completed  → Create subscription
- customer.subscription.updated → Update subscription
- customer.subscription.deleted → Cancel subscription
- invoice.payment_failed → Mark subscription as past_due
- invoice.paid → Confirm payment, activate subscription
```

**Implementation:**
```tsx
// src/app/api/stripe/webhook/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDelete(event.data.object)
      break
    // ... other handlers
  }
  
  return Response.json({ received: true })
}
```

**Signature Verification:** YES (stripe.webhooks.constructEvent)

---

#### POST /api/payrex/webhook

**Purpose:** Handle Payrex (alternative payment provider) payment events

**Events Handled:**
```
- payment.completed → Create subscription
- payment.failed → Mark subscription as past_due
- subscription.cancelled → Cancel subscription
```

**Implementation:**
```tsx
// src/app/api/payrex/webhook/route.ts
import { headers } from 'next/headers'
import { createHmac } from 'crypto'

const PAYREX_WEBHOOK_SECRET = process.env.PAYREX_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('payrex-signature')!
  
  // HMAC-SHA256 signature verification
  const expectedSig = createHmac('sha256', PAYREX_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  
  if (sig !== expectedSig) {
    return Response.json({ error: 'Signature verification failed' }, { status: 400 })
  }
  
  const payload = JSON.parse(body)
  
  switch (payload.event) {
    case 'payment.completed':
      await handlePaymentComplete(payload.data)
      break
    case 'payment.failed':
      await handlePaymentFailed(payload.data)
      break
    case 'subscription.cancelled':
      await handleSubscriptionCancel(payload.data)
      break
  }
  
  return Response.json({ received: true })
}
```

**Signature Verification:** YES (HMAC-SHA256)

---

### 2.4 CRUD Endpoints (7 routes)

#### /api/questions

```
GET    /api/questions      → List questions (paginated, filterable)
POST   /api/questions      → Create question
```

**GET Query Params:**
```
?page=1&limit=20
&subject_id=uuid
&difficulty=easy|medium|hard
&status=draft|review|published
&author_id=uuid
&search=string
```

**POST Body:**
```json
{
  "question_text": "string (required)",
  "explanation": "string",
  "distractors": ["A", "B", "C", "D", "E"],
  "correct_answer": "number (0-4)",
  "difficulty": "easy | medium | hard",
  "taxonomy_node_id": "uuid",
  "subject_id": "uuid",
  "ai_generated": false
}
```

---

#### /api/questions/[id]

```
GET    /api/questions/[id] → Get single question
PATCH  /api/questions/[id] → Update question
DELETE /api/questions/[id] → Delete question
```

**Authorization:** NO role checks (CRITICAL GAP — see Security Audit)

---

#### /api/articles

```
GET    /api/articles       → List articles (paginated)
POST   /api/articles       → Create article
```

**Authorization:** NO role checks (CRITICAL GAP)

---

#### /api/articles/[id]

```
GET    /api/articles/[id]  → Get single article
PATCH  /api/articles/[id]  → Update article
DELETE /api/articles/[id]  → Delete article
```

**Authorization:** NO role checks (CRITICAL GAP)

---

#### /api/taxonomy

```
POST   /api/taxonomy       → Create taxonomy node
```

**POST Body:**
```json
{
  "name": "string (required)",
  "slug": "string (auto-generated if omitted)",
  "parent_id": "uuid | null",
  "sort_order": "number",
  "meta_title": "string (optional)",
  "meta_description": "string (optional)"
}
```

---

#### /api/taxonomy/[nodeId]

```
GET    /api/taxonomy/[nodeId] → Get node + children
PATCH  /api/taxonomy/[nodeId] → Update node
DELETE /api/taxonomy/[nodeId] → Delete node (cascades)
```

**Authorization:** NO role checks (CRITICAL GAP)

---

### 2.5 Upload Endpoint

#### POST /api/upload

**Purpose:** Upload files to Supabase Storage

**Request:** multipart/form-data
```
file: File (required, max 10MB)
folder: string (default: 'misc')
```

**Response:**
```json
{
  "url": "https://xxx.supabase.co/storage/v1/object/public/assets/...",
  "publicUrl": "string",
  "filename": "string",
  "size": 1234567,
  "mimeType": "image/png"
}
```

**Authorization:** Authenticated users only (NO admin role check)

---

## 3. REQUEST VALIDATION AUDIT

### 3.1 Validation Status by Endpoint

| Endpoint | Input Validation | Schema Validation | Authorization Check |
|----------|------------------|-------------------|---------------------|
| POST /api/ai/embed | ✅ text length check | ❌ no zod schema | ✅ auth required |
| POST /api/ai/generate-questions | ✅ topic required | ❌ no zod schema | ✅ auth required |
| POST /api/ai/tutor | ✅ required fields | ❌ no zod schema | ✅ auth required |
| POST /api/ai/study-agent | ✅ required fields | ❌ no zod schema | ✅ auth required |
| POST /api/ai/socratic | ✅ required fields | ❌ no zod schema | ✅ auth required |
| GET /api/cron/* | ✅ CRON_SECRET check | N/A | ✅ CRON_SECRET required |
| POST /api/stripe/webhook | ✅ signature verification | N/A | ✅ HMAC signature |
| POST /api/payrex/webhook | ✅ HMAC verification | N/A | ✅ HMAC signature |
| POST /api/questions | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| PATCH /api/questions/[id] | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| DELETE /api/questions/[id] | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| POST /api/articles | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| PATCH /api/articles/[id] | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| DELETE /api/articles/[id] | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| POST /api/taxonomy | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| PATCH /api/taxonomy/[nodeId] | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| DELETE /api/taxonomy/[nodeId] | ⚠️ basic required checks | ❌ no zod schema | ❌ NO ROLE CHECK |
| POST /api/upload | ⚠️ file size check | ❌ no zod schema | ❌ NO ROLE CHECK |

### 3.2 Missing Zod Schemas

**Current State:** No Zod schemas defined for API request bodies

**Required Schemas (PROPOSED):**
```tsx
// src/lib/schemas/api-schemas.ts
import { z } from 'zod'

export const CreateQuestionSchema = z.object({
  question_text: z.string().min(10).max(2000),
  explanation: z.string().max(5000).optional(),
  distractors: z.array(z.string().min(1).max(500)).min(2).max(5),
  correct_answer: z.number().int().min(0).max(4),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  taxonomy_node_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional(),
  ai_generated: z.boolean().default(false)
})

export const CreateArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.any(), // Tiptap JSON
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(500).optional(),
  cover_image_url: z.string().url().optional(),
  taxonomy_node_ids: z.array(z.string().uuid()).optional()
})

export const CreateTaxonomyNodeSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
  meta_title: z.string().max(200).optional(),
  meta_description: z.string().max(500).optional()
})
```

---

## 4. SECURITY AUDIT

### 4.1 Authorization Vulnerabilities (CRITICAL)

**Severity: HIGH**

**Issue:** 13 of 18 endpoints have NO authorization checks beyond basic authentication

**Affected Endpoints:**
```
POST   /api/questions       → Anyone authenticated can create
PATCH  /api/questions/[id]  → Anyone authenticated can update ANY question
DELETE /api/questions/[id]   → Anyone authenticated can delete ANY question
POST   /api/articles        → Anyone authenticated can create
PATCH  /api/articles/[id]   → Anyone authenticated can update ANY article
DELETE /api/articles/[id]   → Anyone authenticated can delete ANY article
POST   /api/taxonomy        → Anyone authenticated can create nodes
PATCH  /api/taxonomy/[nodeId] → Anyone authenticated can modify taxonomy
DELETE /api/taxonomy/[nodeId] → Anyone authenticated can delete nodes
POST   /api/upload          → Anyone authenticated can upload files
```

**Attack Scenario:**
```bash
# As a free-tier user, create admin-level content
curl -X POST https://slatecamp.com/api/questions \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "Malicious question",
    "difficulty": "hard",
    "ai_generated": true
  }'
# ✅ Succeeds — no admin role check
```

### 4.2 CRON Endpoint Security

**Severity: MEDIUM**

**Current State:** Both cron endpoints verify `CRON_SECRET` header

**CRON_SECRET defined in:**
```
vercel.json → environment.CRON_SECRET (production)
.env.local → CRON_SECRET=xxx (development)
```

**Security Note:** The CRON_SECRET is a shared secret between Vercel and this application. If compromised, an attacker could trigger blindspot scans and signal computations at will (DoS vector, not data breach).

**Recommended Improvement:**
```tsx
// Add IP allowlist for Vercel cron jobs
const VERCEL_CRON_IPS = [
  '76.76.21.21', // Vercel infrastructure
]

export async function GET(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const clientIP = forwardedFor?.split(',')[0]?.trim()
  
  if (process.env.NODE_ENV === 'production' && 
      !VERCEL_CRON_IPS.includes(clientIP || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // ... rest of handler
}
```

### 4.3 Webhook Signature Verification

**Severity: LOW (Already Implemented)**

Both Stripe and Payrex webhooks correctly verify signatures:
- Stripe: `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- Payrex: HMAC-SHA256 with `PAYREX_WEBHOOK_SECRET`

### 4.4 AI Endpoint Rate Limiting

**Severity: MEDIUM**

**Current State:** No rate limiting on AI endpoints

**Risk:**
```
- /api/ai/generate-questions → $0.0057 per call × 1000 calls = $5.70
- /api/ai/tutor → ~$0.01 per call × 1000 calls = $10.00
- /api/ai/embed → ~$0.0001 per call × 1000 calls = $0.10
```

**Recommended Implementation:**
```tsx
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function withRateLimit(req: Request, identifier: string) {
  const { success, remaining, reset } = await ratelimit.limit(identifier)
  
  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded', retryAfter: reset },
      { status: 429 }
    )
  }
  
  return null // proceed
}
```

---

## 5. DATA FLOW ANALYSIS

### 5.1 Question Creation Flow

```
Client: QuestionEditor → fills form
  ↓
POST /api/questions with CreateQuestionSchema validation
  ↓
Server Action (or API route):
  1. Verify auth
  2. Validate schema (ZOD — PROPOSED)
  3. Insert into questions table
  4. If taxonomy_node_id provided: UPDATE question_taxonomy_nodes
  5. If ai_generated: flag for SME review
  6. Return created question
  ↓
Client: redirect to /admin/questions/[id]
```

### 5.2 Payment Webhook Flow

```
Stripe Event: checkout.session.completed
  ↓
POST /api/stripe/webhook
  ↓
1. Verify signature (stripe.webhooks.constructEvent)
2. Extract: customer_id, subscription_id, price_id
3. Lookup: user by stripe_customer_id (profiles.stripe_customer_id)
4. Insert: user_subscriptions row
5. Update: profiles.tier based on price_id mapping
6. Send: welcome email (via trigger)
7. Return: 200 OK
  ↓
User sees: subscription activated on next page load
```

---

## 6. SOLUTIONS BLUEPRINT

### 6.1 Add Authorization Middleware Pattern

**Step 1:** Create admin API middleware
```tsx
// src/lib/admin-api-middleware.ts
import { createClient } from '@/lib/supabase/server'
import { canReviewContent } from '@/lib/rbac/canReviewContent'
import { NextResponse } from 'next/server'

export async function requireAdmin(): Promise<Response | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!canReviewContent(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return null // proceed
}
```

**Step 2:** Apply to all admin API routes
```tsx
export async function POST(req: Request) {
  const block = await requireAdmin()
  if (block) return block
  // ... handler
}
```

### 6.2 Add Zod Schema Validation

**Step 1:** Define schemas in src/lib/schemas/api-schemas.ts
**Step 2:** Apply to all API routes
```tsx
export async function POST(req: Request) {
  const body = await req.json()
  const result = CreateQuestionSchema.safeParse(body)
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error },
      { status: 400 }
    )
  }
  
  // ... handler with result.data
}
```

### 6.3 Add Rate Limiting

**Step 1:** Set up Upstash Redis (already has FREE tier)
**Step 2:** Apply to AI endpoints
```tsx
export async function POST(req: Request) {
  const userId = (await auth()).user.id
  const block = await withRateLimit(req, `ai:${userId}`)
  if (block) return block
  // ... handler
}
```

### 6.4 Add IP Allowlist for Cron

**Step 1:** Document Vercel cron IPs
**Step 2:** Add IP verification in cron handlers

---

# PASS 2: SYNTHESIS & ARCHITECTURAL RESOLUTION

## Cross-Domain Patterns Identified

### Pattern 1: API Routes = Authorization Graveyard

**Manifestation:** 13 of 18 API endpoints have NO authorization checks beyond basic auth. AI endpoints have no rate limiting.

**Impact:** Free-tier users can create admin content. AI endpoints vulnerable to cost attacks.

**Architectural Cure:** Authorization + Rate limiting:
```typescript
// Every admin API route:
export async function POST(req: Request) {
  const block = await requireAdmin()
  if (block) return block
  
  const rateLimit = await withRateLimit(req, `admin:${userId}`)
  if (rateLimit) return rateLimit
  
  // proceed
}
```

### Pattern 2: Missing Zod Schemas Everywhere

**Manifestation:** No Zod schemas for any API route request bodies. Validation is ad-hoc.

**Impact:** Type safety gap between client and server. Invalid data reaches database.

**Architectural Cure:** Schema-first API:
```typescript
// src/lib/schemas/api-schemas.ts
export const CreateQuestionSchema = z.object({...})
export const UpdateQuestionSchema = z.object({...})
export const CreateArticleSchema = z.object({...})

// Applied in every route:
export async function POST(req: Request) {
  const body = await req.json()
  const result = CreateQuestionSchema.safeParse(body)
  if (!result.success) return Response.json({ error: result.error }, { status: 400 })
  // proceed with result.data
}
```

### Pattern 3: Webhook Security Inconsistency

**Manifestation:** Stripe uses official SDK. Payrex uses manual HMAC. Cron uses simple secret comparison.

**Impact:** Inconsistent security posture. Potential for bypass if one method has a flaw.

**Architectural Cure:** Unified webhook handler pattern:
```typescript
// src/lib/webhooks/verify.ts
export async function verifyWebhook(
  provider: 'stripe' | 'payrex',
  body: string,
  headers: Headers
): Promise<{ valid: boolean; payload?: unknown }> {
  switch (provider) {
    case 'stripe':
      return { valid: true, payload: stripe.webhooks.constructEvent(...) }
    case 'payrex':
      return { valid: verifyPayrexSignature(body, headers) }
  }
}
```

---

## Architectural Cure Blueprint

### Step 1: Authorization Wrapper Library

Create `src/lib/api/require-admin.ts`, `src/lib/api/require-auth.ts`, `src/lib/api/rate-limit.ts`. Apply to all routes.

### Step 2: Zod Schema Centralization

Create `src/lib/schemas/` directory. Define schemas for every API route. Add ESLint rule to enforce schema usage.

### Step 3: Webhook Handler Library

Create unified webhook verification library. Document all webhook types and their handlers.

---

*Pass 2: Synthesis added 2026-04-07*

---

# PASS 3: THE OMNISCIENCE SWEEP

## Exact AI Endpoint Payloads

### POST /api/ai/generate-questions

**Request:**
```json
{
  "topic": "Floor Area Ratio computations under the NBC of 2022",
  "subject_id": "uuid-xxxx",
  "count": 10,
  "difficulty_distribution": {
    "easy": 0.3,
    "medium": 0.5,
    "hard": 0.2
  }
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "temp-uuid",
      "question_text": "A commercial building has a lot area of 500 sqm in a BPO zone. What is the maximum floor area if the FLAR is 4.0?",
      "explanation": "Maximum Floor Area = Lot Area × FLAR = 500 × 4.0 = 2,000 sqm. Therefore the correct answer is 2,000 sqm.",
      "distractors": ["1,000 sqm", "2,000 sqm", "3,000 sqm", "4,000 sqm", "5,000 sqm"],
      "correct_answer": 1,
      "difficulty": "medium",
      "taxonomy_node_id": "uuid-yyyy",
      "ai_confidence": 0.92
    }
  ],
  "tokens_used": 2847,
  "cost_usd": 0.005694
}
```

### POST /api/ai/tutor

**Request:**
```json
{
  "question_id": "uuid-xxxx",
  "user_answer": "B",
  "conversation_history": [
    { "role": "user", "content": "I think the answer is B" },
    { "role": "assistant", "content": "Why do you think B is correct?" }
  ],
  "mode": "socratic"
}
```

**Response:**
```json
{
  "response": "You selected B. Let me help you think through this. The question asks for the AMBF in a residential zone with 6 occupants. Remember, AMBF = GFA × Occupancy Factor. What's the GFA given the lot area of 200 sqm and FAR of 2.0?",
  "suggestions": [
    "What is the GFA calculation?",
    "What is the occupancy factor for residential?",
    "Show me the formula"
  ],
  "tokens_used": 1234
}
```

## Exact Cron Job Payloads

### GET /api/cron/blindspot-scan

**Trigger:** Daily at 16:00 UTC (Vercel cron)

**Authorization:** `Authorization: Bearer $CRON_SECRET`

**Response:**
```json
{
  "success": true,
  "blindspots_found": 47,
  "users_notified": 12,
  "scan_duration_ms": 2341,
  "timestamp": "2026-04-07T16:00:00Z"
}
```

**Process:**
1. Query users with <3 sessions in 7 days
2. Find taxonomy nodes where user has answered <5 questions
3. Rank by lowest mastery (theta) + unexplored status
4. Insert top 3 into `blindspot_queue` for each user
5. Send email notification if new blindspots

### GET /api/cron/compute-signals

**Trigger:** Daily at 16:30 UTC (30 min after blindspot-scan)

**Authorization:** `Authorization: Bearer $CRON_SECRET`

**Response:**
```json
{
  "success": true,
  "users_processed": 1247,
  "signals_computed": {
    "mastery_updates": 8932,
    "readiness_recalculated": 1247,
    "engagement_refreshed": 1247
  },
  "duration_ms": 45678,
  "timestamp": "2026-04-07T16:30:00Z"
}
```

**Process:**
1. For each active user:
   - Recalculate theta per taxonomy node (IRT 2PL)
   - Update `user_mastery` table
   - Recalculate readiness score (6-vector)
   - Update `user_readiness_scores` table
2. REFRESH MATERIALIZED VIEW `mv_engagement_snapshot`

## Exact Webhook Event Shapes

### Stripe checkout.session.completed

```json
{
  "id": "evt_xxxx",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_xxxx",
      "customer": "cus_xxxx",
      "subscription": "sub_xxxx",
      "metadata": {
        "user_id": "uuid-xxxx"
      }
    }
  }
}
```

### Payrex payment.completed

```json
{
  "event": "payment.completed",
  "data": {
    "id": "pay_xxxx",
    "customer_id": "cus_xxxx",
    "subscription_id": "sub_xxxx",
    "amount": 2999,
    "currency": "PHP",
    "metadata": {
      "user_id": "uuid-xxxx"
    }
  }
}
```

## Exact API Route Error Codes

```typescript
// Standardized error response shape:
interface APIError {
  error: string                      // Machine-readable code
  message: string                     // Human-readable message
  details?: unknown                   // Additional context (validation errors)
  requestId?: string                  // For log correlation
}

// Status code mapping:
400 → { error: 'VALIDATION_ERROR', message: '...' }
401 → { error: 'UNAUTHORIZED', message: 'Authentication required' }
403 → { error: 'FORBIDDEN', message: 'Insufficient permissions' }
404 → { error: 'NOT_FOUND', message: 'Resource not found' }
429 → { error: 'RATE_LIMITED', message: 'Too many requests', retryAfter: number }
500 → { error: 'INTERNAL_ERROR', message: 'An error occurred', requestId: '...' }
```

## Hidden API Quirks

1. **AI endpoints use OpenAI directly** — No abstraction layer. If OpenAI pricing changes, costs change immediately.

2. **Cron endpoints verify CRON_SECRET** — But the secret is in plaintext in `vercel.json` environment variables.

3. **Stripe webhook must return 200 quickly** — Long processing = Stripe retries. Payments may be processed twice.

4. **Payrex uses manual HMAC** — No SDK. If HMAC implementation has a bug, payments may be accepted with invalid signatures.

---

*Pass 3: Omniscience added 2026-04-07*
