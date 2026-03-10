# Project Cerebro — Third-Party Integrations

## Payments: Stripe

### Setup
- `stripe` package v20.4 with type definitions
- Webhook listener in `src/lib/stripe/webhooks.ts`
- Customer sessions via Checkout API

### Events Tracked
- **Subscription created** — `customer.subscription.created`
- **Payment succeeded/failed** — For retry logic
- **Invoice paid** — Sync to profiles table

### Usage (Max Plan)
- Unlimited question banks access
- Bulk download credits
- Priority support tickets

---

## Analytics: PostHog

### Event Names
```typescript
quiz_session_started,
quiz_session_completed,
subject_mastered,
diagnostic_taken,
ai_tutor_used,
document_uploaded
```

### Properties Captured
- `exam_profile_id` — Context for filtering
- `question_difficulty` — Skill breakdown
- `response_time_ms` — Performance metrics
- `device_type` — Mobile/desktop stats

### Privacy
- **Review Mode excluded** — No analytics when user is in "doomscroll" stress-free practice
- **Opt-in only** — Cookie banner for EU users
- **No PII in events** — Email hashed or omitted

---

## AI Provider Abstraction

### Interface (`src/lib/ai/provider.ts`)

```typescript
interface AIProvider {
  sendMessage(messages: Message[]): Promise<AIResponse>;
  chunkDocument(file: File): Promise<DocumentChunk[]>;
  computeEmbeddings(text: string): Promise<number[]>;
}
```

### Implementation
- OpenRouter (or compatible) via API key env var
- Token counting for quota display
- Streaming responses for chat UI

---

## Supabase Storage (3D Models)

### File Types
- `.glb` / `.gltf` — Three.js compatible
- WebP thumbnails generated on upload
- Max size: 50MB per asset

### Paths
```
three_d_models/{subject_id}/{slug}-v{version}.glb
documents/{user_id}/{filename}-{uuid}
```

---

## External Resources

### Question References
- **NCARB Handbook** — Official exam reference
- **NBA/NSBA standards** — Board-specific guidelines
- **Code of ethics** — AIA model code

### Image Hosting
- User uploads → Cloudinary or Supabase Storage
- Optimized via sharp on upload
- CDN delivery for quiz images

---

## Dev Tools

### PostHog Project
- Self-hosted or cloud deployment
- Feature flags for A/B testing
- Session recording (opt-in only)

### Sentry (Error Tracking)
- Client + server error capture
- Stack trace aggregation
- Performance monitoring

---

## Integration Checklist

Before using external service:
1. [ ] Add error boundary wrapper
2. [ ] Set up webhook endpoint (Stripe)
3. [ ] Configure CORS headers
4. [ ] Document API rate limits
5. [ ] Plan fallback strategies
6. [ ] Update CLAUDE.md with integration details
