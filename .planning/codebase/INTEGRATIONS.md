# External Integrations

## Authentication
- **Provider**: [Supabase Auth](https://supabase.com/auth)
- **Methods**: Email/Password, Google OAuth (detected)

## Backend & Storage
- **Provider**: [Supabase](https://supabase.com/)
- **Services**: Database (PostgreSQL), Storage, Edge Functions (implied)

## Payments & Subscriptions
- **Stripe**:
  - [Stripe Node SDK](https://github.com/stripe/stripe-node)
  - [Stripe Checkout](https://stripe.com/payments/checkout)
  - Webhooks for subscription management
- **PayRex**:
  - [PayRex Node SDK](https://github.com/PayRex-Payments/payrex-node)
  - Alternative payment gateway with webhook support

## AI & Machine Learning
- **OpenAI**:
  - Models: `gpt-4o`
  - Embeddings: `text-embedding-3-small`
- **Anthropic**:
  - Models: `claude-3-5-sonnet-20240620` (Note: `claude-sonnet-4-20250514` detected in code)
- **Provider Logic**: Abstracted in `src/lib/ai/provider.ts` with support for streaming and embeddings.

## Webhooks
- **Stripe**: `/api/webhooks/stripe`
- **PayRex**: `/api/webhooks/payrex`

## Other Services
- **Client-side PDF Generation**: [html2canvas](https://html2canvas.hertzen.com/)
- **Deployment/Hosting**: Likely [Vercel](https://vercel.com/) (given Next.js and `vercel.svg` in public)
