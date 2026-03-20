# SlateCamp — Fix All Numbers to Inter tabular-nums
## Quick, surgical font fix for every number in the app

---

## THE PROBLEM

Syne is a display/headline font. Its numerals are stylized and hard to read as DATA. Across the app, stat numbers (readiness scores, question counts, percentages, mastery values) are rendering in Syne — which looks "branded" when what the student needs is LEGIBLE.

Numbers on SlateCamp are not decoration. They are the product. A student glancing at "61" needs to read it instantly, not admire the typography.

## THE RULE

**Inter for ALL numbers. Everywhere. No exceptions.**

Inter already ships with the app, has excellent numeral design, and supports `font-variant-numeric: tabular-nums` which keeps digits the same width so columns of numbers align perfectly (critical for mastery bars, score displays, and analytics).

## THE FIX

### Step 1: Add a global utility class

In `globals.css` (or your base stylesheet), add:

```css
/* Numeric data — always Inter, always tabular */
.num {
  font-family: 'Inter', var(--font-body, sans-serif) !important;
  font-variant-numeric: tabular-nums;
}
```

### Step 2: Find and fix every stat number

Search the entire codebase for any element that displays a number AND uses Syne (via `font-[family-name:var(--font-syne)]` or `font-syne` or direct Syne class).

```bash
# Find all Syne-styled number elements
grep -rn "font-syne\|font-\[family-name:var(--font-syne)\]" src/ --include="*.tsx" --include="*.jsx"
```

For every match that displays a NUMBER (score, count, percentage, stat), replace the Syne font class with Inter:

```
BEFORE: font-[family-name:var(--font-syne)] text-4xl font-extrabold
AFTER:  font-[family-name:var(--font-body)] text-4xl font-extrabold tabular-nums
```

Or simply remove the Syne font override entirely (Inter is the default body font, so it will inherit):

```
BEFORE: className="font-[family-name:var(--font-syne)] text-4xl font-extrabold"
AFTER:  className="text-4xl font-extrabold tabular-nums"
```

### Step 3: Specific locations to fix

These are the known number displays (found live on the dashboard). Apply the same pattern across ALL pages:

| Page | Element | Current | Fix |
|---|---|---|---|
| Dashboard | Stat "6" (topics mastered) | Syne 36px 800 | Inter 36px 800 tabular-nums |
| Dashboard | Stat "61" (questions answered) | Syne 36px 800 | Inter 36px 800 tabular-nums |
| Dashboard | Readiness Score "—" / number | Syne 36px 800 | Inter 36px 800 tabular-nums |
| Dashboard | Heatmap percentages | Inter 11px (already correct) | Add tabular-nums if missing |
| Analytics | Readiness Score (large) | Likely Syne | Inter 48px 800 tabular-nums |
| Analytics | Subject mastery percentages | Check | Inter + tabular-nums |
| Testing | Question count, timer | Check | Inter + tabular-nums |
| Quiz active | Score, timer, progress | Check | Inter + tabular-nums |
| Any page | Any number the student reads as DATA | Any | Inter + tabular-nums |

### Step 4: Global safety net

Add this to `globals.css` as a fallback so any future number that accidentally gets Syne is caught:

```css
/* Force tabular nums on common data patterns */
[data-num],
.tabular-nums,
time,
.stat-value,
.score,
.percentage {
  font-variant-numeric: tabular-nums;
}
```

## WHAT STAYS IN SYNE

Syne is ONLY for text that is read as a WORD or PHRASE:
- Page titles ("Dashboard", "Testing", "Analytics")
- Section headings ("Zone 01: Foundations")
- Brand statements

Syne is NEVER for anything read as a NUMBER:
- Scores, percentages, counts, timers, dates, question numbers

## VERIFY

After applying, check every page and confirm:
- [ ] Dashboard stat numbers → Inter tabular-nums
- [ ] Readiness Score (wherever it appears) → Inter tabular-nums
- [ ] Analytics page numbers → Inter tabular-nums
- [ ] Quiz timer and scores → Inter tabular-nums
- [ ] Heatmap percentages → Inter tabular-nums
- [ ] No number anywhere in the app uses Syne

---

*This is a 10-minute fix. Grep, replace, verify.*
