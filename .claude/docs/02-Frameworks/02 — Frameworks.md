# 02 — Frameworks

Business model, pricing logic, and go-to-market strategy frameworks for SlateCamp.

---

## 💡 Business Model Canvas

| **Block** | **SlateCamp** |
| --- | --- |
| **Value Proposition** | The single, unified study ecosystem that eliminates exam anxiety by proving readiness with data. "Know you'll win." |
| **Customer Segments** | B2C: ALE reviewees, architecture undergrads. B2B: University departments, review centers. |
| **Channels** | TikTok/Reels (3D Lab videos), Campus Ambassadors, SEO syllabus content, Topnotcher SME endorsements |
| **Revenue Streams** | Freemium → Camp tier (monthly) → Insurance tier (6-month lump). B2B institutional licensing. |
| **Key Resources** | Master Syllabus Taxonomy, SME-authored content, 3D parametric models, adaptive algorithm |
| **Key Activities** | Content authoring & verification, 3D model creation, algorithm tuning, community building |
| **Key Partners** | Licensure Exam topnotchers (SMEs), universities, PRC-adjacent organizations, review centers |
| **Cost Structure** | Engineering team, SME compensation, Supabase/infra, 3D asset production, marketing spend |
| **Competitive Moat** | Integrated loop (Wiki + Quiz + 3D + AI + Notes + Analytics). Taxonomy-first architecture. Network effects from community. |

---

## 💰 Pricing Framework

### Pricing Psychology

Filipino students are price-sensitive but will spend irrationally (often using parents' money) if it **guarantees success.** The frame: SlateCamp is a fraction of physical review center fees.

### Tier Structure

| **Tier** | **Price** | **Access** | **Conversion Trigger** |
| --- | --- | --- | --- |
| **Free** | ₱0 | Syllabus outline, 5 basic 3D models, 20 questions/day | The "Aha!" moment from 3D Lab + first (low) Readiness Score |
| **Camp** | ₱499–799/mo | Full Quiz Engine, Readiness Score, Personal Notes, Wiki | Paywall after 20 daily questions; desire to track progress |
| **Insurance** | ₱3,999 / 6 months | Everything — AI Tutor, unlimited 3D Lab, Storm Mode mocks | Post-graduation "review season" purchase; parents as buyers |
| **Institutional** | Bulk license | Cohort dashboard, admin controls, custom taxonomy mapping | Dean sees 70% of batch bleeding red — intervenes early |

### Payment Infrastructure

- **International:** Stripe (`stripe ^20.4.1`, `@stripe/stripe-js ^8.9.0`)
- **Philippine Local:** PayRex (`payrex-node ^1.7.3`) — supports GCash, Maya, bank transfers

---

## 🚀 Go-To-Market Framework

### Phase 1 — Beachhead (Architecture / ALE)

- Launch strictly to architecture demographic
- Stress-test 3D Lab and taxonomy logic on the hardest spatial discipline
- **Goal:** Monopolize the ALE reviewee market; prove Readiness Score drives daily active use
- **Success metric:** 5,000 registered users, 15% free-to-paid conversion

### Phase 2 — B2B Institutional Expansion

- Pitch universities the Institutional Dashboard
- *"Look at your graduating batch: 70% are bleeding red in Structural Design. Intervene before they fail."*
- Universities pay bulk licensing fee; SlateCamp becomes mandatory diagnostic tool
- **Success metric:** 3 university partnerships, bulk license revenue

### Phase 3 — Horizontal Domination

- Replicate codebase, swap database content
- **Civil Engineering** (closest sibling), **Interior Design**, **Nursing** (swap buildings for 3D anatomy), **Accountancy** (pure quiz engine test)
- **The Franchise Model:** Partner with star reviewers in new niches, offering revenue shares

---

## 📊 Acquisition Framework — The Funnel

### Top of Funnel (Awareness)

- **TikTok/Reels "Trojan Horse"** — 15-sec split-screen: blurry PDF vs. interactive 3D Lab
- **Topnotcher SME Halo** — recent Top 1–10 passers as content authors and ad faces
- **Campus Ambassadors** — 4th/5th-year students from UST, UP, Mapua demo during studio
- **SEO Syllabus Pages** — long-tail keywords ("PD 1096 Floor Area Ratio formula")

### Middle of Funnel (Activation & Retention)

- **Diagnostic Onboarding** — forced 10-item diagnostic quiz on signup → first Readiness Score in 60 seconds
- **Discord Community** — milestone broadcasts, shared accountability, topnotcher AMAs
- **Push Notifications** — data-driven urgency based on pacing metrics and mastery decay

### Bottom of Funnel (Conversion)

- **Paywall friction** after 20 daily questions
- **"Insurance" framing** — position as exam insurance, not a subscription
- **Parent-targeted messaging** — "A fraction of review center fees"

