# Drill / Quiz Entitlements Audit

## 1. Enforcement Map

| Mode | Gating Logic | Location |
|------|--------------|----------|
| `subject` | `isPro: true` | `start-session.ts` |
| `focus-review` | `isPro: true` | `start-session.ts` |
| `custom` | `isPro: true` | `start-session.ts` |
| `storm` | `isPro: true` | `start-session.ts` |
| `fullexam` | `isPro: true` | `start-session.ts` |
| `extended` | `isPro: true` | `start-session.ts` |

## 2. Inconsistencies
- **Hub vs Action**: `ReviewHub.tsx` correctly hides/locks UI for free users. `start-session.ts` correctly rejects requests for these modes if entitlements are missing.
- **Verdict**: Gating is consistent and robust across client and server.

## 3. Findings
- **Feature Keys**: The system uses `ENTITLEMENT_FEATURE_KEYS.questionsUnlimited` as the proxy for Pro access in Drills. This is correctly mapped.
