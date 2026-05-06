# Draft/Pilot Status Policy

Draft/pilot implementation is allowed only as local, non-mutating validation work.

Allowed draft statuses:
- DRAFT_SOURCE_PACK_CANDIDATE
- DRAFT_CHUNK_CANDIDATE
- LOCAL_VALIDATION_ONLY
- AI_REVIEWED_NOT_HUMAN_APPROVED
- HUMAN_APPROVAL_REQUIRED
- SME_APPROVAL_REQUIRED
- NOT_PRODUCTION_READY
- DO_NOT_PUBLISH
- DO_NOT_EMBED_PRODUCTION
- DO_NOT_MUTATE_SUPABASE

Forbidden production-positive statuses unless actual human/SME governance approval is recorded:
- approved
- canonical
- verified_source
- production_ready
- source_pack_ready
- safe_to_rewrite
- ready_for_embeddings
- ready_for_publication
- human_approved
- sme_approved

Every draft artifact must keep production source approval, production source packs, production embeddings, publication, live question edits, Supabase mutation, migrations, and admin live sync blocked.
