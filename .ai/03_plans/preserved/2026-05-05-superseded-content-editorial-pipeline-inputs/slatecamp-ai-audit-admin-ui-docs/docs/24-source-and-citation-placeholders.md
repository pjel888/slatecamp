# Source and Citation Placeholders

The MVP does not perform source verification, but the UI should show existing article sources and leave room for future evidence.

## Existing sources

Use `wiki_article_sources` to show article source counts and, where possible, source titles/URLs.

## Future evidence fields

`ai_change_proposals.source_evidence` should eventually show:

- source title,
- authority type,
- section/page,
- short quote,
- URL,
- date checked.

## Current UI behavior

For now:

- show source count in article table,
- show source list in article detail if existing rows are available,
- show "No linked sources" when none exist,
- allow manual finding with risk type `missing_sources`.

## Do not do yet

- Do not crawl source URLs.
- Do not validate source URLs.
- Do not generate citations.
- Do not compare article content to source text.
