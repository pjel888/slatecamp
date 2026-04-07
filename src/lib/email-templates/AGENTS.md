<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# email-templates

## Purpose

The `email-templates` directory contains email template generators for lifecycle milestones: pre-oath and post-oath emails for Filipino architects taking the Panunumpa ng Propesyonal (Professional Oath). Generates both plain-text and HTML versions with Slatecamp design system styling.

## Key Files

| File | Description |
|------|-------------|
| `oath-taking.ts` | Email template generators: `generatePreOathEmail()` (day before), `generatePostOathEmail()` (day after) |

## For AI Agents

### Working In This Directory

**Email Strategy:**
- Pre-oath (day before): Motivational message encouraging the student to share their story after taking the oath.
- Post-oath (day after): Celebratory message welcoming the new architect into the professional community.
- Growth-framed, warm tone (Slatecamp voice): no pressuring language, genuine celebration of achievement.
- Design: Slatecamp brand colors (Camp Cobalt primary, Surface Light background), Inter font, responsive mobile layout.

**Template Outputs:**
- Plain text body: concise, readable, platform-agnostic.
- HTML body: styled with inline CSS, responsive breakpoints, accessible button links.
- Subject lines: short, memorable, action-oriented.

**Personalization:**
- Input: userName (full name, e.g., "Maria Santos").
- Extract: firstName from first token (e.g., "Maria").
- Output: "Architect Maria, RLA" or "Architect Maria" in greeting.

### Common Patterns

**Generating Pre-Oath Email:**
```typescript
import { generatePreOathEmail } from '@/lib/email-templates'

const email = generatePreOathEmail('Maria Santos')
// {
//   subject: 'Tomorrow: your oath.',
//   body: 'Tomorrow you take the Panunumpa ng Propesyonal...',
//   html: '<html>...'
// }

// Send via email service (Resend, SendGrid, etc.)
await emailClient.send({
  to: user.email,
  subject: email.subject,
  html: email.html,
  text: email.body,
})
```

**Generating Post-Oath Email:**
```typescript
import { generatePostOathEmail } from '@/lib/email-templates'

const email = generatePostOathEmail('Maria Santos')
// {
//   subject: 'You are now Architect Maria, RLA.',
//   body: 'The Campfire is waiting for your story.',
//   html: '<html>...'
// }
```

## Dependencies

### Internal

- **Slatecamp Design System:** Colors, typography (defined inline in HTML).
  - Camp Cobalt: `#1B3FC4` (primary action).
  - Camp Cobalt 700: `#1535A8` (hover state).
  - Surface Light: `#f8f7f5` (background).
  - Ink Primary: `#1a2332` (text).
  - Ink Secondary: `#4a5568` (secondary text).

### External

- **Email client library:** Resend, SendGrid, AWS SES (caller's responsibility).
- **No npm dependencies** in this directory.

---

**Last Updated:** 2026-04-02

**For email strategy, consult `.claude/docs/slatecamp-voice.md` in the repository root.**
