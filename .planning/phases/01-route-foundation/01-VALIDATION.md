---
phase: 1
slug: route-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (if configured) / manual verification |
| **Config file** | vitest.config.ts or none |
| **Quick run command** | `grep -r "testing" src/lib/constants/routes.ts` (should return 0 matches) |
| **Full suite command** | `bun run build` (ensures no broken imports after rename) |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `grep -r "/dashboard/testing" src/` (should return 0)
- **After every plan wave:** Run `bun run build`
- **Before `/gsd:verify-work`:** Full build must succeed
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | NAV-06 | grep | `grep "Review" src/lib/routes.ts` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | NAV-06 | grep | `grep -r "/dashboard/testing" src/` returns 0 | ✅ | ⬜ pending |
| 01-02-01 | 02 | 1 | NAV-07 | grep | `grep "camptrails" src/lib/routes.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | NAV-07 | file | `test -f src/app/dashboard/camptrails/page.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements. No new test framework needed — verification is via grep and build.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar shows "Review" label | NAV-06 | Visual verification | Navigate to /dashboard, inspect sidebar |
| CampTrails link renders and navigates | NAV-07 | Visual verification | Click CampTrails in sidebar, verify stub page renders |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
