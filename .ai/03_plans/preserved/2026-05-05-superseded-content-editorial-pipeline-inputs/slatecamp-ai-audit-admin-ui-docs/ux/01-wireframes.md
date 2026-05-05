# UI Wireframes

These are conceptual wireframes. Codex should adapt to the existing SlateCamp admin design system.

## Main dashboard

```text
┌─────────────────────────────────────────────────────────────────────┐
│ AI Audit Control Center                                              │
│ Monitor article/question audit readiness and review workflow.        │
├─────────────────────────────────────────────────────────────────────┤
│ [Total Articles] [Not Checked] [Needs Source] [Likely Wrong]         │
│ [Open Findings] [Needs Review] [Approved] [Questions Flagged]        │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: Overview | Articles | Questions | Findings | Runs              │
├─────────────────────────────────────────────────────────────────────┤
│ High Priority Queue                                                  │
│ ┌ Target ────────────── Severity ─ Status ─ Risk ─ Next Action ┐      │
│ │ BP 344 Ramp Article    High      Open     outdated  Review    │      │
│ └───────────────────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│ Recent Findings                Recent Runs                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Article table

```text
┌ Filters: Search | Status | Phase | Severity | Has sources | Needs review ┐
├───────────────────────────────────────────────────────────────────────┤
│ Article        Sources Questions Phase Chips        Status   Findings │
│ RA 9266 ...    3       12        ✓ - - - - -        Yellow   2 open   │
│ BP 344 ...     5       18        ✓ ✓ - - - !        Orange   1 open   │
│ History ...    1       7         - - - - - -        Gray     0        │
└───────────────────────────────────────────────────────────────────────┘
```

## Detail drawer

```text
┌ Article Detail ──────────────────────────────────────────────┐
│ Title                                                        │
│ Status: Needs Source Check  Severity: High                   │
│ Phase: Tier 0 Static Check                                   │
├ Sources ─────────────────────────────────────────────────────┤
│ Existing source rows here                                    │
├ Findings ────────────────────────────────────────────────────┤
│ Finding summary, suspect text, status, actions               │
├ Timeline ────────────────────────────────────────────────────┤
│ Manual finding created → confirmed → reviewed                │
├ Actions ─────────────────────────────────────────────────────┤
│ [Create Finding] [Mark Reviewed] [Approve] [Close]            │
└───────────────────────────────────────────────────────────────┘
```
