# Error Cases

The system must handle messy content safely.

## Parser fails

If normalization cannot parse article content:

```text
- write original.md
- write normalized.md equal to original.md only if safe
- mark parser_status = failed
- write parser-errors.json
- do not push
```

## Unknown component

If a component tag is found in article content but not in codebase inventory:

```text
- preserve it in ui-blocks.json
- include in unknown-components.json
- flag article as contains_unknown_component
```

## Malformed component props

If props cannot be parsed:

```text
- keep props_text
- set props_json = null
- mark parse_status = props_unparsed
```

## Missing linked questions

Some articles may have no linked questions. This is not an error, but record:

```text
linked_question_count = 0
```

## Duplicate slugs

Folder names should avoid collisions by including article id:

```text
<slug>--<article_id>
```

## Stale Supabase row

Abort push and write conflict report.

## Missing source rows

Export empty `sources.json` and mark `source_count = 0`.
