# Sidebar centerline fix checkpoint

Issue: section/division labels (Learn, Explore, Practice, Data) were changing vertical layout between expanded and collapsed sidebar states, so primary nav icon centers could move even though the x rail was locked.

Fix:
- Keep each group header slot mounted at fixed `h-5` in both states.
- In expanded state, show label via opacity/transform only.
- In collapsed state, keep the same slot height and optionally show a centered divider without changing row geometry.
- Preserve fixed 40px icon slot and 6px sidebar padding.

Verification:
- Playwright transition measure: xDelta=0 and yDelta=0 for all primary icons plus toggle during expand and collapse.
- Targeted e2e: `e2e/sidebar-navigation.spec.ts` passed.
- `bun run type-check` passed.
- `bun run lint` passed.
- `git diff --check` passed.
