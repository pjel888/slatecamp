# Articles Dry-Run Diff

Generated: 20260506T090253Z

Target rows: 3

Safety evidence:
- Exact filter: wiki_articles.article_id = each UUID below
- Quarantined IDs included: 0
- Broad table update: no
- Rollback backup exists: yes
- Component validation passed before resume: yes
- Questions in this batch: 0

| article_id | slug | old_hash | new_hash | old_len | new_len |
|---|---|---:|---:|---:|---:|
| `ee1f8beb-e236-4831-a0a8-1ddce447a3b8` | bp-344-vs-pd-1096-conflicts | `sha256:21867c15fb059d1a3e8cd964618cf4c0ed450a7ea1508f2fbe71892b9d943a1f` | `sha256:dd072ab212548e96f82eac17ee9935ae5472322d8994a52b3de2ceac3974722f` | 15058 | 15742 |
| `9085e0d8-3498-4d3b-b991-46e54d94bde0` | pd-1096-rule-vii-occupancy | `sha256:fd8297f9263c6a531ee550eca43097767479e54d120ef3ff79a6dfe16214f1e6` | `sha256:e171c9e45ab6d19046cf0ce3b2ce075294282f0fe037bab8272aac97b28db04a` | 30095 | 30779 |
| `859b1a7f-8aba-473d-8c28-f9aaa39af11d` | pd-1096-rule-viii-setbacks-and-easements | `sha256:1c04c76a01abcca637b87b6d988ca1e8bf66964be481796d17d3c094848db72f` | `sha256:3e87ea35ca27d6c907a97371b9bda9e0d2712d6551baa377d23d9480bbbf33ee` | 35472 | 36196 |
