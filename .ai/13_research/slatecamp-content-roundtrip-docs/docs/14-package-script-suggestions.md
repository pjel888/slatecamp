# Package Script Suggestions

Add scripts only if they match repo conventions.

Example:

```json
{
  "scripts": {
    "content-audit:pull": "tsx scripts/content-audit/export-article-bundles.ts",
    "content-audit:export": "tsx scripts/content-audit/export-article-bundles.ts",
    "content-audit:normalize": "tsx scripts/content-audit/normalize-markdown.ts",
    "content-audit:components": "tsx scripts/content-audit/scan-component-inventory.ts",
    "content-audit:compose": "tsx scripts/content-audit/compose-candidate.ts",
    "content-audit:diff": "tsx scripts/content-audit/diff-candidate.ts",
    "content-audit:push": "tsx scripts/content-audit/push-to-supabase.ts",
    "content-audit:validate": "tsx scripts/content-audit/validate-bundles.ts"
  }
}
```

If the repo uses a different runner, adapt this.
