# Project Cerebro — Conventions

## Code Style

### TypeScript
- **Strict mode** — `strict: true` in tsconfig.json
- **No `any`** — Use `unknown` or proper types
- **Interface over type** for shapes with methods/indices
- **Namespace** only for module-level utilities (avoid global pollution)

```typescript
// ❌ Bad
let count = 0; // any implied

// ✅ Good
let count: number = 0;

interface UserStats {
  accuracy: number;
  attempts: number;
}
```

### Naming

- **Components** — PascalCase (`QuestionCard`, `SessionTimer`)
- **Files/directories** — kebab-case or descriptive folder names
- **Variables/functions** — camelCase (`getQuestionsForSubject`)
- **Constants** — UPPER_SNAKE_CASE (`MAX_QUESTIONS_PER_SESSION`)
- **Database enums** — PascalCase in code, snake_case in SQL

### Components

```typescript
// shadcn pattern: single export, prop interface at top
interface QuestionProps {
  question: Question;
  options: Option[];
  onAnswer: (id: string) => void;
}

export function Question({ question, options, onAnswer }: QuestionProps) {
  return (
    <Card>
      {/* ... */}
    </Card>
  );
}
```

- **No default exports** — Named exports only
- **Prop validation** — Zod schemas in `lib/validations/*`
- **Children prop** — Use `<Card>` with direct children (shadcn pattern)

### File Organization

```
src/components/{feature}/
  ├── index.ts           # Barrel export for auto-imports
  └── {component}.tsx    # Individual components
```

## Testing Conventions

### Unit Tests (`src/lib/**/*.test.ts`)
- **Vitest** via Jest config
- **Describe groups** by feature/module
- **Async functions** — `vi.mock()` for Supabase calls

```typescript
describe('SM2 Algorithm', () => {
  it('should calculate next review date correctly', async () => {
    // ...
  });
});
```

### E2E Tests (`e2e/tests/*.test.ts`)
- **Playwright** selectors use data-testid attributes
- **Page object pattern** for common flows
- **Review/Session mode** specific test suites

## Error Handling

- **Try/catch in server actions** — Wrap mutations, log to Sentry (or PostHog errors)
- **Toast notifications** — For user-facing errors
- **Database constraints** — RLS catches auth errors at DB level

```typescript
// Server action pattern
async function updateNote(id: string, content: NoteContent) {
  try {
    const { data } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', id);
    return { success: true };
  } catch (err) {
    console.error('Update failed:', err);
    throw new Error('Failed to save note');
  }
}
```

## Styling

- **Tailwind CSS 4** — Utility classes only, no CSS modules
- **CSS variables** — From `globals.css` for theming
- **Utility-first** — No custom .css files unless component-scoped needed
- **Animation** — `tw-animate-css` for transitions (150ms standard)

```tsx
// Theming via class, not style prop
<button className="btn-primary">Click</button>

// CSS variables
:root {
  --color-primary: var(--color-accent);
}
```

## Database Patterns

### Queries
- **Use select columns** — Avoid `*` (RLS policies)
- **Filter by exam_profile_id** — Always scope to user's active exam
- **Paginate results** — Cursor-based or offset for lists

```typescript
// Bad
const rows = await supabase.from('questions').select('*');

// Good
const rows = await supabase
  .from('questions')
  .select('id,prompt,choices,explanation')
  .eq('exam_profile_id', examProfileId)
  .limit(50)
  .gte('position', start);
```

### Relations
- **No eager loading** — Fetch relationships in client components when needed
- **Denormalized context** — Session questions include subject/topic FKs

## Git Commit Messages

```
type(scope): description

Co-authored-By: Claude Opus 4.x <noreply@anthropic.com>
```

Examples:
- `feat(quiz): add AI-adaptive mode toggle`
- `fix(analytics): correct subject score aggregation`
- `chore(ui): update button colors to Rams Standard`

---

## Contribute Checklist

1. Read `.cloude/md` for project context
2. Run `npm run typecheck` before committing
3. Add tests for new features (unit + E2E)
4. Update CLAUDE.md if adding patterns/decisions
5. Link related issues in PR description
