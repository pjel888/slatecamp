# Admin Navigation Integration

Add the AI Audit module to the existing admin navigation.

## Nav item

```text
AI Audit
```

Route:

```text
/admin/ai-audit
```

## Placement

Place near content/admin tools, not user-facing study features.

Suggested section:

```text
Content
  Articles
  Questions
  Sources
  AI Audit
```

or:

```text
Operations
  AI Audit
```

## Active states

The nav item should be active for:

```text
/admin/ai-audit
/admin/ai-audit/*
```

## Permission

Only admins should see the nav item.

Use existing admin sidebar visibility rules.
