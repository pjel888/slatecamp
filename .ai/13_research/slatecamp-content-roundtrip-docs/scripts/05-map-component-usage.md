# Script Spec: Map Component Usage in Articles

Suggested file:

```text
scripts/content-audit/map-component-usage.ts
```

## Responsibilities

```text
- scan all original.md files
- scan all ui-blocks.json files
- count component usage per article
- detect unknown components
- detect repo components unused in articles
```

## Output

```text
component-usage-in-articles.json
unknown-components.json
```

## Useful metrics

```text
articles_with_components
articles_plain_markdown
components_used_count
unknown_component_count
unused_likely_article_components
```
