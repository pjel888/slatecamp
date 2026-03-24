<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# trails

## Purpose

Camp Trails — guided learning paths through taxonomy topics with daily assignments and progress tracking. Provides structure for multi-day study plans with intensity levels (intensive, accelerated, standard, comprehensive, undergraduate).

## Key Files

| File | Description |
|------|-------------|
| `TrailDetail.tsx` | Trail overview with stats (duration, intensity, step count), enrollment CTA, week-by-week breakdown with expand/collapse |
| `TrailDailyView.tsx` | Daily view showing current day's steps and progress through trail |
| `DayComplete.tsx` | Celebration/completion screen shown when user finishes a day |

## For AI Agents

### Working In This Directory

- **Intensity Colors**: Red (intensive), Amber (accelerated), Cobalt (standard), Emerald (comprehensive/undergraduate)
- **Duration**: Measured in days; weeks calculated as `Math.ceil(dayNumber / 7)`
- **Steps**: Trail days contain step arrays; total steps rolled up from all days
- **Enrollment**: Server action `enrollInTrail()` creates enrollment record and routes to `/dashboard/trails/{slug}/today`
- **Progress**: Tracked via `TrailEnrollment` with `current_day` and `days_completed` fields
- **State Management**: Uses `useTransition()` for async enrollment operations
- **Navigation**: Uses Next.js `useRouter()` for programmatic routing post-enrollment

### Dependencies
### Internal

- `@/lib/actions/trails` - Server actions: `enrollInTrail()`
- `@/types/app` - Types: `CampTrail`, `TrailDay`, `TrailEnrollment`
- `@phosphor-icons/react` - Icons (CaretDown, CaretRight, Clock, Fire, ListChecks)
- Next.js (`next/navigation`) - Router for client-side navigation
- React hooks - `useState`, `useTransition`

<!-- MANUAL: Ensure trail durations align with learning science research on spaced repetition intervals. Test enrollment flow end-to-end. Verify intensity color mappings match Campfire palette. -->
