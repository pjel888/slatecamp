# 09 — Pricing & Entitlement Competitive Positioning

## VizCode Pricing Summary

From the competitive audit (`14_pricing_legal_media_pass`, `15_group_partner_community_pass`):

| Plan | Price (PHP) | Duration | Notes |
|------|------------|----------|-------|
| Individual 3-Month | 799 | 3 months | Basic access |
| Individual 6-Month | 999 | 6 months | ~17% savings vs 3mo ×2 |
| Individual 12-Month | 1,499 | 12 months | ~37% savings vs 3mo ×4 |
| AI Chat Credits | 99 | One-time? | Separate product for QUBI |
| Group 2-4 users | 549–1,499/user | Varies | 0% discount at 12mo for 2-4 users |
| Group 10-24 users | 549/user (3mo) | Varies | 31.3% discount |
| Shared Account | 14,970–35,970 | 3/6/12 months | "One account. Full access." |
| TopLab Members | 49,950 | Institutional | Partnership pricing |

## VizCode Pricing Weaknesses

1. **2-4 user 12-month = same price as individual 12-month** (PHP 1,499 per user) — "Save more" headline is misleading
2. **Manual payment verification** — bank details sent after plan selection, access after manual verification
3. **AI credits sold separately** — adds confusion about what's included
4. **Shared account pricing** — ambiguous "shared account" language for teams
5. **No free trial visible** — all access requires paid plan

## SlateCamp LI Entitlement Strategy

### LI is NOT a Separate Product

LI modules are included in the existing 3D Lab entitlement. Current gate:

```typescript
// src/lib/entitlements/feature-keys.ts
threeDLabFull: 'three_d_lab_full'

// In ModuleViewer and page.tsx:
const hasAccess = entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.threeDLabFull]?.allowed ?? false
```

**Decision**: LI uses the same `threeDLabFull` entitlement as PI. No new entitlement key needed.

### Free vs Paid Tier

| Tier | PI Access | LI Access |
|------|-----------|-----------|
| **Free** | Locked (gate page with upgrade CTA) | Locked (same gate) |
| **Pro (threeDLabFull)** | Full access to all PI modules | Full access to all LI modules |
| **Admin/Dev** | Full access (override) | Full access (override) |

### Source View as Free Preview

**Future consideration**: Make the Source View sub-mode available to free users as a preview:

```
Free user visits LI module:
  → Cannot access Focus/Compare/Mistake/Drill sub-modes
  → CAN access Source View sub-mode (read-only source cards)
  → See upgrade CTA for interactive sub-modes
```

This creates a "try before you buy" path that VizCode doesn't offer. VizCode's free tier is limited to the code library text pages. SlateCamp could offer free source card access as a competitive differentiator.

### Implementation
```typescript
// Per sub-mode entitlement
const subModeAccess = {
  focus: hasFullAccess,
  compare: hasFullAccess,
  mistake: hasFullAccess,
  drill: hasFullAccess,
  source: true,  // Always available as preview
  repair: hasFullAccess,
}
```

## Competitive Pricing Recommendations (Not LI-Specific)

These are broader SlateCamp pricing recommendations informed by VizCode analysis:

1. **Keep simple 3-plan structure** — VizCode's 3-plan menu is conversion-friendly
2. **Be clearer than VizCode**: publish access timing, device rules, refund policy, renewal/cancellation
3. **No separate "AI Credits" product** — LI Repair Path is included; no unpredictable credit costs
4. **Group/institutional pricing** should have real per-seat discounts (not 0% at 12 months)
5. **Avoid "shared account" language** — use named seats with individual accounts
6. **Free Source View preview** differentiates from VizCode's fully-gated model

## LI Value Proposition in Pricing

LI provides value that VizCode can't match:

| VizCode Feature | Monthly Cost | LI Equivalent | Included In |
|----------------|-------------|---------------|-------------|
| Isolation Mode | In PHP 799+ plan | Focus View | Pro tier |
| Comparative Mode | In PHP 799+ plan | Compare View | Pro tier |
| Game Mode | In PHP 799+ plan | Mistake Hunt + Board Drill | Pro tier |
| Code Library | Free (public) | Source View (free preview) | Free |
| AI Chat Credits | PHP 99 extra | Repair Path | Pro tier (included) |

**Messaging**: "Everything VizCode charges for, plus true 3D spatial learning, source-verified citations, and board-exam workflow — all in one Pro subscription."

## Entitlement Gating UX

### Current Gate (PI)
```
┌─────────────────────────────────┐
│ 🔒 Lock icon                    │
│ 3D Lab requires Pro             │
│ Upgrade to access interactive   │
│ 3D modules and parametric tools. │
│ [Upgrade to Pro]                │
└─────────────────────────────────┘
```

### Proposed Gate (PI + LI)
```
┌─────────────────────────────────┐
│ 🔒 Lock icon                    │
│ 3D Lab requires Pro             │
│                                 │
│ Pro includes:                   │
│ • Parametric 3D tools (PI)      │
│ • Interactive learning modules  │
│   (LI) with 6 study modes       │
│ • Source-verified code citations│
│ • Board-style practice drills   │
│                                 │
│ Free preview: Source View       │
│ [Browse Source Cards]           │
│                                 │
│ [Upgrade to Pro]                │
└─────────────────────────────────┘
```

## Source View Free Tier Details

If implemented, free Source View access to LI modules would:

1. **Show source cards** — verified code provisions with section/table references
2. **Show static scene preview** — a 2D screenshot or simplified view of the 3D model
3. **Not allow interaction** — no orbit/zoom, no layer toggles, no sub-mode switching
4. **Show upgrade CTA** — clear path to unlock full 3D interaction
5. **Index in search** — source cards are SEO-visible content

This directly competes with VizCode's free Code Library by offering verified source citations instead of interpretive text.

## Revenue Impact Considerations

| Scenario | Impact |
|----------|--------|
| LI modules increase Pro conversion | Positive — more value in Pro tier |
| Source View is free | Slight risk of reducing conversion, but builds trust/SEO |
| LI differentiates from VizCode | Positive — unique value proposition |
| No separate LI pricing | Simplifies messaging, no confusion |
