# MASTER ARCHITECTURE BLUEPRINT: SHARED COMPONENTS
**Status:** UNIFIED (Panopticon V8)

## 1. Executive Vulnerability Summary
1. **CRITICAL: Screen Reader Lock-Out (ARIA Debt):** Priority components (`Sheet`, `Toast`, `Skeleton`, `MasteryChart`) lack proper ARIA roles (`aria-modal`, `role="status"`, `aria-busy`). This prevents screen readers from announcing critical status changes or modal content, failing WCAG compliance.
2. **HIGH: Keyboard Trap (Navigation Gaps):** `Sheet` and `Tooltip` components do not support full keyboard navigation (e.g., Arrow keys, Escape to close tooltip). This creates an "interaction dead-end" for keyboard-only users.
3. **MEDIUM: Component Bloat & Performance (Unused UI):** 10+ UI components (`InputOTP`, `Resizable`, `Menubar`, `Calendar`, etc.) are included in the build but are not imported anywhere in the application, unnecessarily inflating bundle size.

## 2. Exhaustive System Inventory

### 2.1 UI Component Library (`src/components/ui/`)
- **Total:** 38 shadcn/ui base + custom files.
- **Key Interactive:** `button.tsx`, `input.tsx`, `select.tsx`, `dialog.tsx`, `tabs.tsx`, `command.tsx`.
- **Large Components:** `form.tsx` (487 lines), `dialog.tsx` (312 lines).

### 2.2 Shared Business Components (`src/components/shared/`)
- **Total:** 34 business logic components.
- **Categories:**
    - `Auth/`: `AuthGuard`, `LoginForm`, `SignupForm`.
    - `Quiz/`: `QuestionCard`, `QuizProgress`, `Timer`, `MasteryIndicator`.
    - `Wiki/`: `WikiRenderer`, `WikiSearch`, `WikiToc`.
    - `Analytics/`: `MasteryChart`, `ProgressChart`, `HeatmapCalendar`.
    - `Loading/`: `PageSkeleton`, `QuestionSkeleton`.

### 2.3 Design Tokens (`globals.css`)
- **Colors:** Primary `#1B3FC4`, Secondary `#E8853A`, Success `#2D9F6F`, Destructive `#D64545`.
- **Fonts:** Sans (`Inter`), Display (`Syne`), Mono (`DM Mono`).
- **Spacing:** `radius-sm` (4px), `radius-md` (6px), `radius-lg` (8px).

## 3. Data Flow & Exact Payloads

### 3.1 Component Prop Signatures
- **`ButtonProps`:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean; leftIcon?: ReactNode; rightIcon?: ReactNode;
}
```
- **`Card` Sub-components:** `CardHeader`, `CardContent`, `CardFooter`, `CardTitle` (fixed `h3`).

### 3.2 Toast (Sonner-based Interface)
```typescript
interface Toast {
  type: 'default' | 'success' | 'error' | 'warning' | 'info'
  title: string; description?: string;
  action?: { label: string; onClick: () => void };
}
```

## 4. Extreme Edge-Case & Concurrency Vulnerabilities
- **Concurrency: Toast Queue Overflow:** Sonner can handle multiple toasts, but if 50+ toasts are triggered (e.g., bulk import error), the UI becomes unreadable. No "Dismiss All" logic is exposed in the current shared wrapper.
- **Idempotency: Button Double-Submission:** Many `Button` instances lack `disabled={loading}` logic. A user on a slow connection can click a quiz answer multiple times, triggering multiple `submitAnswer` server action calls before the UI enters the "feedback" state.
- **Hydration: Skeleton-Layout Mismatch:** `PageSkeleton` dimensions are not pixel-perfect to the final rendered dashboard sections. This causes a Cumulative Layout Shift (CLS) when the client hydrates the parallel-fetched dashboard data.
- **ARIA: Missing `aria-busy` during fetch:** When a `Card` is in its skeleton state, it lacks `aria-busy="true"`. Screen readers may attempt to read the loading placeholder as meaningful content.

## 5. The Unified Resolution Blueprint

### 5.1 Accessibility & Standard Fixes
1. **ARIA Sprint:** Add `aria-modal`, `role="status"`, and `aria-busy` to all priority components identified in the audit.
2. **Keyboard Nav:** Implement `Escape` and `Arrow` key listeners for all floating UI (`Sheet`, `Tooltip`).
3. **Contrast Correction:** Increase `muted-foreground` contrast to 4.5:1 (minimum) in `globals.css`.

### 5.2 Token & Animation System
1. **Z-Index Registry:** Add `--z-dropdown`, `--z-modal`, `--z-tooltip`, etc., to `globals.css` to prevent overlap conflicts.
2. **Animation Library:** Centralize `animate-fade-in` and `animate-slide-up` as CSS utilities instead of inline Tailwind classes.

### 5.3 Maintenance & Pruning
1. **Component Archive:** Move unused UI components (`InputOTP`, `Resizable`) to a separate archive directory to reduce build bloat.
2. **Storybook Standardization:** Migrate all stories from v6 anti-patterns (no args) to the modern Storybook `StoryObj` with explicit `args`.
3. **Loading Button Integration:** Add a permanent `loading` prop to the base `Button` component to ensure all CTAs have built-in idempotency support.
