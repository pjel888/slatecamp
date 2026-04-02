# Research: Technicalities of Implementing a Modular React Design System in Next.js

## Scope
This document focuses on the implementation details that matter when building a modular React design system for a Next.js codebase, especially when the goal is reuse across apps, strong typing, good performance, and long-term maintainability.[file:1]
It emphasizes architecture, packaging, styling, rendering boundaries, and operational concerns instead of only high-level design-system theory.[file:1]

## Why modularity matters
A shared component system reduces duplicated UI work, improves visual consistency, and makes maintenance easier because fixes and improvements can propagate from one source of truth instead of being repeated app by app.[file:1]
In practice, modularity works best when the system is split into clearly scoped layers such as tokens, primitives, composed components, documentation, and tooling.[file:1]

## Recommended architecture
A practical structure is to separate the system into:

- `tokens`: design decisions like color, spacing, typography, radius, shadows, and motion values.[file:1]
- `primitives`: low-level building blocks such as `Button`, `Input`, `Text`, `Icon`, and layout wrappers.[file:1]
- `patterns` or `composites`: higher-level combinations like `FormField`, `Modal`, `Tabs`, and `DataTable`.[file:1]
- `hooks`: reusable behavior extracted from visual components so logic can be shared cleanly.[file:1]
- `docs`: Storybook or equivalent living documentation for visual states and usage contracts.[file:1]
- `config`: shared TypeScript, ESLint, testing, and build configuration, especially in monorepos.[file:1]

This layered approach prevents complex components from becoming hard to reuse and supports parallel work across teams.[file:1]

## Atomic structure in a Next.js context
The attached research recommends Atomic Design as a useful organizational model: atoms, molecules, organisms, templates, and pages.[file:1]
For Next.js, that model is most effective when the design-system package stops at atoms, molecules, and selected organisms, while app-specific templates and pages stay inside each consuming application.[file:1]
This avoids turning the shared library into a product-specific UI dump.

Example monorepo shape:

```text
apps/
  web/
  admin/
  docs/
packages/
  tokens/
  ui/
  eslint-config/
  tsconfig/
  utils/
```

A structure like this aligns well with workspace-based development and internal package sharing.[file:1]

## Monorepo implementation
The source material identifies monorepos as the preferred model when multiple applications need the same component library, since they allow atomic changes, shared tooling, and fewer version drift problems.[file:1]
For Next.js teams, `pnpm` workspaces plus Turborepo is usually the simplest operational baseline because the web app, admin app, docs site, and UI packages can evolve together while still caching builds and tests efficiently.[file:1]

Key technical implications:

- Keep `react`, `react-dom`, and usually `next` as peer dependencies in shared packages to avoid duplicate runtime instances.[file:1]
- Publish internal packages through workspace resolution during development, then optionally build them for external distribution.[file:1]
- Centralize lint, TS config, and test presets so component packages and Next.js apps behave consistently.[file:1]

## TypeScript contracts
The attached file treats TypeScript as non-negotiable for reusable libraries because prop interfaces become self-documenting and breaking changes are surfaced early.[file:1]
In Next.js, this matters even more because shared components often cross route boundaries, teams, and runtime modes.

Important conventions:

- Extend native element props, for example `React.ButtonHTMLAttributes<HTMLButtonElement>`, so primitives preserve native HTML behavior.[file:1]
- Use discriminated unions or literal unions for variant systems such as `size`, `tone`, and `intent`.[file:1]
- Export component prop types from barrel files so app teams can compose wrappers safely.[file:1]
- Prefer named exports for better tree-shaking behavior.[file:1]

Example:

```tsx
import * as React from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button disabled={disabled || loading} data-variant={variant} data-size={size} {...props}>
      {loading ? 'Loading…' : children}
    </button>
  )
}
```

## Design tokens strategy
Design tokens are the visual source of truth for colors, spacing, typography, radii, shadows, and motion.[file:1]
The research strongly supports CSS custom properties for tokens because they support global theming and allow system-wide visual changes without touching every component.[file:1]

For Next.js, a strong implementation pattern is:

1. Define raw tokens in a dedicated `tokens` package.
2. Map them to semantic tokens such as `--color-bg`, `--color-text`, `--space-4`, and `--radius-md`.[file:1]
3. Inject base token CSS once near the application root.
4. Let components consume semantic tokens rather than hardcoded values.[file:1]

Example token setup:

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-background: #ffffff;
  --color-text-base: #111827;
  --space-1: 4px;
  --space-2: 8px;
  --radius-md: 8px;
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-background: #1f2937;
  --color-text-base: #f9fafb;
}
```

## Theming in Next.js
Because Next.js renders on the server and hydrates on the client, theme implementation needs to avoid flashes and markup mismatches.
A reliable pattern is to put the initial theme attribute on the root HTML element as early as possible, then let token CSS react to `data-theme` selectors, which matches the attached research's recommendation to use CSS variables for theme switching.[file:1]

Technical considerations:

- Set the initial theme before hydration to reduce flash-of-incorrect-theme.
- Keep token names stable and only swap values by theme.
- Avoid component-specific theme logic when token overrides can solve the problem globally.[file:1]
- If supporting system theme, ensure the server and client choose the same initial branch or accept a controlled client-side handoff.

## Styling model choices
The file compares CSS Modules, CSS-in-JS, utility-first styling, and headless-plus-custom-CSS approaches.[file:1]
For a modular Next.js design system, one of the safest long-term options is CSS Modules plus CSS variables, because it provides scoped styles, no runtime styling tax, and clean theming via tokens.[file:1]

A practical decision matrix:

| Approach | Fit for Next.js design system | Notes |
|---|---|---|
| CSS Modules + tokens | Strong default | Low runtime cost, predictable SSR, easy package reuse.[file:1] |
| Tailwind + tokens | Strong if team is already standardized | Great velocity, but shared component APIs need discipline to avoid utility sprawl.[file:1] |
| CSS-in-JS | Selective use only | Can be flexible, but adds runtime and SSR complexity.[file:1] |
| Headless + app-owned styling | Strong for highly branded systems | Best when behavior and accessibility should be shared but visuals vary by app.[file:1] |

## Headless and compound components
The source document recommends headless components and compound components for complex UI because they separate logic from presentation and make shared state easier to manage.[file:1]
In Next.js, this is useful because server-rendered pages may need consistent accessible behavior, while each app or brand layer still wants styling control.

Use headless primitives when:

- Accessibility logic is hard and should be standardized once.[file:1]
- Visual styles differ across products.
- You want to avoid locking the system into one visual treatment.

Use compound components when:

- Several subparts must coordinate through shared context, such as `Tabs`, `Accordion`, `Dropdown`, or `Modal`.[file:1]
- Consumers need flexible layout composition without a giant prop API.[file:1]

## React Server Components boundary
One of the biggest Next.js-specific technicalities is the split between Server Components and Client Components.
A design-system package should be deliberate about which components require `use client`, because every client boundary increases shipped JavaScript.

Practical rule of thumb:

- Purely presentational, static components should remain server-compatible whenever possible.
- Interactive components that rely on state, effects, refs, or browser APIs should be isolated into client components.
- Avoid marking an entire UI package as client-only, because that forces unnecessary client bundles across the app.

A good pattern is to export both kinds safely:

```tsx
// server-safe typography primitive
export function Text({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>
}
```

```tsx
'use client'

import { useState } from 'react'

export function Accordion() {
  const [open, setOpen] = useState(false)
  return <button onClick={() => setOpen(!open)}>{open ? 'Open' : 'Closed'}</button>
}
```

This boundary discipline is not stated explicitly in the attached file, but it is the key Next.js implementation extension of its modularity and performance guidance.

## SSR and hydration concerns
A modular design system in Next.js has to behave correctly across server rendering and hydration.
Common failure points include theme mismatch, non-deterministic IDs, browser-only APIs inside shared components, and style order issues.

Checklist:

- Do not call `window`, `document`, `localStorage`, or `matchMedia` during server render.
- Generate stable IDs with React-safe APIs instead of ad hoc random values.
- Keep initial markup deterministic; avoid rendering one branch on the server and another immediately on the client.
- Make sure package CSS is imported in a consistent order so tokens and component styles cascade correctly.

## Accessibility as a package-level concern
The attached research stresses that accessibility should be built into the design system from the start, using semantic HTML, keyboard support, correct ARIA usage, and sufficient contrast.[file:1]
In a Next.js design system, that means primitives should encode accessible defaults so every consuming route gets the benefit automatically.[file:1]

Examples:

- Prefer real `<button>` and `<a>` elements over clickable `div`s.[file:1]
- Expose ARIA props where needed, but start from semantic defaults.[file:1]
- Build focus states, keyboard interactions, and color contrast into primitives and tokens.[file:1]
- Consider headless accessibility foundations such as Radix-based patterns when behavior is complex.[file:1]

## Storybook and documentation
Storybook is described in the source as the standard way to document component libraries, preview states, and generate live documentation.[file:1]
For Next.js teams, it is especially valuable because it decouples component review from app routes and lets you test UI states in isolation.[file:1]

Recommended setup:

- One story file per component.[file:1]
- Include default, edge, interactive, and accessibility-relevant states.[file:1]
- Use stories as the living contract for variants and props.[file:1]
- Add visual regression and accessibility checks in CI when possible.[file:1]

## Testing strategy
The source recommends Jest plus React Testing Library for shared component testing, with an emphasis on testing from the user's perspective rather than implementation details.[file:1]
That approach fits Next.js well because it validates behavior independently of routing or page composition.[file:1]

Each shared component should ideally be tested for:

- Default rendering.[file:1]
- Variant rendering.[file:1]
- User interactions and callbacks.[file:1]
- Disabled, loading, and empty states.[file:1]
- Accessibility semantics and labels.[file:1]

For Next.js integration, add a thin layer of app-level tests around critical route compositions, but keep most library logic verified inside the UI package.

## Build and packaging details
The research recommends modern library tooling such as Vite library mode or tsup, externalizing React and emitting both ESM and CJS outputs for compatibility.[file:1]
For a Next.js-centered internal design system, ESM-first distribution is typically enough inside a monorepo, but external packages still benefit from explicit export maps and generated type declarations.[file:1]

Important packaging details:

- Externalize `react` and `react-dom` so they are not bundled into the library.[file:1]
- Generate `.d.ts` files for all public exports.[file:1]
- Use export maps to control public entry points.[file:1]
- Prefer named exports to improve tree-shaking.[file:1]

Example `package.json` shape:

```json
{
  "name": "@acme/ui",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js"
    }
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  }
}
```

## Tree-shaking and bundle discipline
The source notes that component libraries should be optimized so consumers only ship what they use.[file:1]
In Next.js, that means avoiding barrel patterns that accidentally import everything, keeping side effects explicit, and structuring exports so unused components can be dropped by the bundler.[file:1]

Recommendations:

- Use named exports.[file:1]
- Keep package modules side-effect free when possible.[file:1]
- Split large optional components into separate entry points.[file:1]
- Avoid one giant CSS file if only a small subset of components is used, unless the tradeoff is acceptable for operational simplicity.

## Third-party primitives and abstraction
The attached file advises wrapping third-party component libraries behind your own API surface to avoid vendor lock-in.[file:1]
That is especially important in Next.js systems, where swapping one primitive foundation for another later can otherwise cause app-wide refactors.[file:1]

A good abstraction layer should:

- Normalize variant naming.
- Preserve your token system.
- Hide third-party implementation details from consuming apps.[file:1]
- Keep migration paths open if you move from one primitive library to another.

## shadcn-style ownership model
The source highlights the shadcn/ui approach as an alternative model where teams copy component code into projects instead of consuming a traditional package.[file:1]
For Next.js this can work well for single-product teams that want total ownership, but it is less ideal when multiple apps need one governed shared source of truth.[file:1]

A practical interpretation:

- Use package-based distribution for core, multi-app design-system primitives.
- Consider shadcn-style code ownership for app-local components that intentionally diverge.

## Versioning and change management
The source recommends semantic versioning, changelogs, and Changesets for shared libraries.[file:1]
That matters in Next.js ecosystems because UI packages can affect many routes and apps at once, so release discipline is part of technical architecture, not just process.[file:1]

Guidelines:

- Patch: internal fixes with no public API break.[file:1]
- Minor: additive props or new components.[file:1]
- Major: removed props, renamed exports, changed semantics, or required migration work.[file:1]
- Automate release notes and package bumps when possible.[file:1]

## Practical implementation checklist
Use this as a build sequence for a modular Next.js design system:

1. Create a monorepo with `apps/*` and `packages/*` workspaces.[file:1]
2. Build a dedicated tokens package with semantic CSS variables.[file:1]
3. Build primitive components first, typed with TypeScript and native prop extension.[file:1]
4. Keep static components server-compatible and isolate interactive ones behind targeted client boundaries.
5. Use CSS Modules or another stable styling model with tokens at the center.[file:1]
6. Add Storybook as the visual contract for each exported component.[file:1]
7. Add Jest and React Testing Library coverage for behavior and accessibility.[file:1]
8. Package with clear export maps, generated types, and peer dependencies.[file:1]
9. Add semantic versioning and release automation.[file:1]
10. Wrap third-party primitives rather than exposing vendor APIs directly.[file:1]

## Recommended default stack
If you want a conservative, scalable default for a serious Next.js setup, this is a strong baseline derived from the attached research:

- Monorepo: `pnpm` workspaces + Turborepo.[file:1]
- UI authoring: React + TypeScript.[file:1]
- Styling: CSS Modules + CSS variables for tokens.[file:1]
- Accessibility primitives: headless patterns or Radix-style foundations where needed.[file:1]
- Documentation: Storybook with autodocs and accessibility checks.[file:1]
- Testing: Jest + React Testing Library.[file:1]
- Packaging: tsup or Vite library mode with type generation and peer deps.[file:1]

## Common pitfalls
The main failure modes are usually architectural rather than visual:

- Putting app-specific templates into the shared library, which makes reuse worse.
- Overusing `use client` and accidentally turning the design system into a client-only bundle.
- Hardcoding colors and spacing inside components instead of flowing through tokens.[file:1]
- Exposing third-party APIs directly and inheriting lock-in.[file:1]
- Shipping poorly documented components that exist in code but not in team workflow.[file:1]
- Treating accessibility as optional instead of package-level behavior.[file:1]

## Closing note
The attached research provides a strong foundation for reusable React component systems through Atomic Design, TypeScript, design tokens, Storybook, testing, monorepos, and modern packaging.[file:1]
The most important Next.js-specific extension is to combine those practices with deliberate Server Component and Client Component boundaries, SSR-safe theming, and bundle discipline so the design system stays modular both in source code and at runtime.


---

# Additional Research: Storybook Best Practices and Next.js/React Component Modularity

## Storybook role in a design system
Storybook is designed for building UI components and pages in isolation, and it is useful not just for visual development but also for testing, documentation, and sharing component states with teams.[page:1]
For a modular React design system, that matters because isolated stories expose edge cases and usage contracts without requiring the full Next.js application to be running.[page:1]

## Core Storybook best practices
Two consistent recommendations stand out across the sources: treat stories as explicit component states, and keep stories close to the component they describe.[page:2]
Storybook’s own documentation also frames stories as rendered states of components and positions docs and testing as natural extensions of those stories.[page:1]

### Strong Storybook conventions
- Keep **one story file per component** so the story file remains the canonical place for the component’s states and usage examples.[page:2]
- Include a **Default** story, a **Playground** story, and explicit state stories such as loading, error, empty, destructive, or disabled states.[page:2]
- Use **CSF** or modern Storybook story exports instead of older `storiesOf` patterns because the structure is cleaner and aligns with current Storybook recommendations.[page:2]
- **Co-locate** the `.stories.tsx` file with the component so the documentation changes when the component changes, and both move together when files are reorganized.[page:2]
- Require every new shared component to ship with stories so Storybook becomes part of the delivery contract instead of optional documentation debt.[page:2]

### Why explicit stories matter
Explicit state stories make it easier to share precise links with QA, designers, and other developers, and they also make failures easier to localize when visual testing is added.[page:2]
They are better than hiding many states only inside controls because they document the states your team actually cares about and supports over time.[page:2]

## Storybook structure for a Next.js monorepo
A good Storybook setup should mirror the way the codebase is organized, which helps teams navigate both the app and the component library more predictably.[page:2]
In a Next.js monorepo, that usually means Storybook should primarily document shared UI packages and possibly selected route-level compositions, while app-specific one-off pieces stay near their routes.[web:14]

Recommended split:

- `packages/ui`: stories for shared primitives and composites.
- `apps/web/app/.../_components`: stories only for route-specific components with enough complexity to justify isolated review.[web:14]
- `apps/docs` or a dedicated Storybook app: the published documentation surface for the organization.[file:1]

## Storybook environment parity
One of the strongest practical Storybook recommendations is to keep the Storybook environment consistent with the app environment, including shared CSS, assets, localization, and providers.[page:2]
For Next.js, that means your Storybook preview configuration should include the same global token CSS, theme providers, font setup, and major context wrappers that shared components expect.[page:2]

Typical global decorators in a Next.js design system:

- Theme provider and token CSS loader.
- Router mocks where components depend on navigation.
- Query client or data provider mocks for async components.
- Internationalization provider if components render localized text.[page:2]

## Mock data discipline
Reusable mock factories are recommended when many stories need similar data, because mutable shared objects can leak changes across stories and produce misleading results.[page:2]
For modular React work, this is especially useful for things like users, products, navigation items, and CMS records, where a base factory plus overrides keeps stories deterministic and easy to extend.[page:2]

## Storybook as testing infrastructure
Storybook documentation explicitly notes that stories are a pragmatic starting point for UI testing, because stories are already written during component development and can help prevent UI bugs over time.[page:1]
That makes Storybook more valuable when paired with accessibility checks, interaction tests, and visual regression workflows in CI rather than being treated as a static gallery.[page:1]

Recommended practice:

- Test the stories, not just the raw components, when possible.[page:1]
- Include accessibility-relevant states such as error messages, keyboard focus, and disabled controls in stories.[file:1]
- Keep broken stories out of the main branch; Storybook quality should be maintained like production code.[page:2]

## React best practices for componentizing
Across the research, the most repeated principle is **single responsibility**: each component should do one job well and avoid absorbing data fetching, layout, analytics, and UI behavior all in one place.[file:1][web:9][web:12]
Small, focused, composable components are easier to reuse, test, and evolve than large “god components.”[web:9][web:12]

### Componentization rules that hold up well
- Keep components **small and focused** so each one has a clear purpose.[web:11][web:9]
- Prefer **composition over inheritance** when assembling complex UIs from simpler pieces.[web:9][web:12]
- Separate **behavior from presentation** using hooks, headless primitives, or wrappers where appropriate.[file:1]
- Avoid tightly coupling UI components to remote data sources or global state unless the component is explicitly app-specific.[web:9]
- Make components **testable** by reducing hidden dependencies and keeping inputs explicit through props and controlled context.[web:9]

## Next.js-specific modularization patterns
A strong Next.js folder pattern is to keep shared UI in a top-level `components/ui` or package-level `ui` library, while route-specific components live close to the route that owns them, often in an `_components` folder under the route segment.[web:14]
This split prevents the shared library from filling up with components that only make sense on one page or one product surface.[web:14]

A practical pattern looks like this:

```text
app/
  dashboard/
    _components/
      DashboardStats.tsx
      DashboardFilters.tsx
    page.tsx
components/
  ui/
    Button.tsx
    Input.tsx
    Dialog.tsx
```

This keeps reusable primitives globally discoverable while preserving locality for route-bound composition.[web:14]

## State colocation
Modern React and Next.js guidance increasingly favors colocating state with the components that actually use it instead of lifting it prematurely into distant parents or global stores.[web:17]
That usually leads to simpler mental models, fewer unnecessary renders, and less prop plumbing through unrelated layers.[web:17]

Use state colocation when:

- Only one route section needs the state.[web:17]
- Two or three tightly related components share the interaction.
- The state is presentational or temporary rather than app-global.

Lift state only when multiple siblings genuinely need the same source of truth.

## Route-level vs shared components
A modular React system becomes easier to maintain when teams distinguish clearly between:

- **Shared design-system components**: buttons, inputs, popovers, typography, layout primitives.
- **Shared domain components**: product cards, user badges, billing summaries.
- **Route-level components**: page-specific compositions that should not be exported broadly.

This layered distinction is an extension of the attached research’s architecture guidance around atoms, molecules, organisms, and app ownership.[file:1]
It prevents accidental over-generalization, which is a common source of fragile component APIs.

## Container and presentational separation
While modern React often replaces older “container vs presentational” terminology with hooks and composition, the core idea still helps: keep visual components simple and let data wiring happen outside when possible.[web:12]
In Next.js, this usually means server-side or route-level code fetches data, while shared UI components receive already-shaped props and stay mostly presentation-oriented.

That produces cleaner reuse because:

- server concerns stay near routes,
- UI packages stay framework-light,
- and tests become easier because components do not need full app bootstrapping.

## Custom hooks as modular behavior units
The attached research recommends custom hooks as the main pattern for sharing stateful logic across components.[file:1]
In a Next.js codebase, hooks are a strong place to modularize behavior such as disclosure state, keyboard shortcuts, filtering, pagination, or client-side selection logic, while leaving visual rendering to components.[file:1]

Examples of good hook boundaries:

- `useDisclosure`
- `useTabs`
- `usePagination`
- `useDebouncedSearch`
- `useThemePreference`

The main rule is that hooks should encapsulate reusable behavior, not become hidden service locators for the whole app.

## Avoiding prop drilling without overusing context
Prop drilling becomes a problem when unrelated intermediate components need to forward state they do not use, and several sources recommend using Context or other state-sharing tools carefully when that happens.[web:9]
But context should be scoped narrowly, because large global contexts can make reuse and performance worse.

Practical guideline:

- Use props by default.
- Use local context for tightly related component families like `Tabs`, `Accordion`, `FormField`, or `Table` subcomponents.[file:1]
- Use app-wide state only for truly cross-cutting concerns.

## Performance-aware modularization
Performance recommendations in the sources emphasize memoization, code splitting, and reducing unnecessary rendering work.[web:8][file:1]
For component architecture, the more important point is to design boundaries well first, then apply tools like `React.memo`, `useMemo`, or lazy loading where profiling shows real benefit.[web:8][file:1]

In Next.js:

- avoid turning large subtrees into client components unless needed,
- split heavy interactive widgets from mostly static route content,
- and keep shared primitives lightweight so they do not impose extra client JavaScript everywhere.

## Documentation and maintenance culture
Several sources make the operational point that Storybook only remains useful if teams maintain it seriously, require stories for new shared components, and prevent stale or broken stories from accumulating.[page:2]
That same principle applies to modular React architecture overall: a component library is not just code structure, but a maintained contract between teams.[page:2][file:1]

## Practical best-practice checklist
Use this checklist when extending your research or implementing the system:

- Build **shared primitives** first; keep route-specific composites close to routes.[file:1][web:14]
- Keep components **single-purpose** and composable.[web:9][web:12]
- Colocate stories with components and include explicit state stories.[page:2]
- Use Storybook as documentation, testing surface, and team review artifact, not just a demo site.[page:1][page:2]
- Keep Storybook’s environment close to the real Next.js app environment through decorators and shared globals.[page:2]
- Colocate state unless there is a real reuse case for lifting it upward.[web:17]
- Use hooks for reusable behavior and context only where relationships are tight and meaningful.[file:1][web:9]
- Keep the shared design-system package clean of page-only components.[web:14][file:1]
- Preserve server compatibility for static UI pieces and isolate client-only interactivity intentionally.
- Treat accessibility, tests, and stories as part of the component contract, not optional extras.[file:1][page:1]
