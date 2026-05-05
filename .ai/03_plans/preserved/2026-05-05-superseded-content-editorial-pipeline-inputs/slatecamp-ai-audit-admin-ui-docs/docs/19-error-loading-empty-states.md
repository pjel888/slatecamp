# Loading, Error, and Empty States

## Loading

Use skeleton rows/cards or existing spinner conventions.

Recommended:

- Summary card skeletons.
- Table row skeletons.
- Detail drawer loading state.

## Error

Show clear operational errors:

```text
Could not load audit dashboard.
```

Include retry/refresh action.

Do not expose sensitive server errors to the browser.

## Empty states

### No status rows yet

This is expected on first launch.

```text
No audit statuses yet. All content will appear as Not checked until an audit status or finding is created.
```

### No findings

```text
No findings yet.
```

### No results after filters

```text
No results match these filters.
```

Button:

```text
Clear filters
```

## Failed mutation

After failed manual finding/status action:

```text
Could not save audit update. Please try again.
```

Keep form data if possible.
