# .ai/scripts

Utility Python scripts for SlateCamp content operations. These scripts support article media fixes, content verification, and content push operations.

**Status:** Active utility scripts. This folder remains at `.ai/` top level because these scripts may be referenced by `package.json` scripts or other tooling. Verify all references before considering relocation.

**Scripts:**
- `audit_questions.py` — question bank audit utility
- `deep_audit.py` — deep audit utility
- `diagnose_verify.py` — diagnosis and verification utility
- `fix_articlemedia_issues.py` — article media fix (v1)
- `fix_articlemedia_v2.py` — article media fix (v2)
- `insert_matl_media.py` — material media insertion (phase 1)
- `insert_matl_media_phase2.py` — material media insertion (phase 2)
- `push_12_missing_articles.py` — push missing articles
- `verify_articlemedia.py` — article media verification (v1)
- `verify_articlemedia_v2.py` — article media verification (v2)

**Note:** These are operational scripts, not the primary `scripts/` directory at the repo root. The repo root `scripts/` contains TypeScript build/audit/Playwright scripts managed through `package.json`.
