# Normalization QA Checklist

- [ ] Plain markdown article remains readable.
- [ ] Article with self-closing component preserves raw component.
- [ ] Article with paired component preserves children.
- [ ] Inline component is replaced without breaking surrounding prose.
- [ ] Unknown component is preserved and reported.
- [ ] Compose restores original content when normalized.md is unchanged.
- [ ] Round-trip hash equals original hash when no edits were made.
