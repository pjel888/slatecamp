# SlateCamp — Coding Conventions

## 🎨 Aesthetic & Persona
*   **Aesthetic**: Apple HIG × Dieter Rams. Functional, minimalist, unobtrusive.
*   **Voice**: "Respected Mentor" — authoritative, utilitarian, honest. Zero toxic positivity.

## ⚛️ React & Components
*   **Arrow Functions Only**: Use `const Component = () => { ... }` — no `function` declarations.
*   **Default Exports**: Always export the main component at the bottom of the file.
*   **One Component Per File**: File name matches component name (PascalCase).
*   **No `React.FC`**: Use explicit interface for props.
*   **Prop Destructuring**: Always destructure props in the function signature.

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};

export default Button;
```

## 💅 Styling (Tailwind-First)
*   **Tailwind CSS 4**: The only allowed styling method.
*   **Utility Classes**: Use utility classes for everything. No raw CSS modules.
*   **`cn()` Utility**: Use `lib/utils.ts` for merging and conditional classes.
*   **Dynamic Values**: Use CSS variables via Tailwind, not inline `style` objects.

## ⚡ Next.js & Server Components
*   **Server Components First**: All components are RSC by default.
*   **Leaf-Level Interactivity**: Push `'use client'` as far down the tree as possible.
*   **Data Fetching**: Fetch data in Server Components via `async/await`. No `useEffect` for initial fetch.
*   **Server Actions**: Use for all mutations (database writes, form submissions).

## 📘 TypeScript
*   **Strict Mode**: Required. No `any` or `as` type assertions without heavy justification.
*   **Interfaces**: Prefer `interface` over `type` for object shapes.
*   **Zod**: Mandatory for runtime validation of API inputs and environment variables.

## 📁 Naming Conventions
*   **Components**: `PascalCase` (`HeatmapNode.tsx`)
*   **Hooks**: `camelCase` with `use` prefix (`useReadinessScore.ts`)
*   **Utils/Actions**: `camelCase` (`formatDate.ts`, `submitQuiz.ts`)
*   **Constants**: `SCREAMING_SNAKE_CASE` (`MAX_SESSION_ITEMS`)
*   **Routes**: `kebab-case` (`/dashboard/testing`)

## 🌿 Git & Workflow
*   **Conventional Commits**: `feat(scope): ...`, `fix(scope): ...`, etc.
*   **GitHub Flow**: Small, focused PRs (< 400 lines).
*   **Bun**: Primary package manager. Use `bun install` and `bun dev`.
