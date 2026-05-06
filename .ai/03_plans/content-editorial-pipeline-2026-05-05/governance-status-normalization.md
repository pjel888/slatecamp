# Governance Status Normalization

Production approval and draft/pilot continuation are separate tracks.

Production track remains blocked:
- source approval: BLOCKED
- production source-pack creation: BLOCKED
- production chunks: BLOCKED
- production embeddings: BLOCKED
- production article rewriting: BLOCKED
- live question editing: BLOCKED
- Supabase mutation: BLOCKED
- admin live sync: BLOCKED

Draft/pilot track is allowed only for local validation artifacts. Draft outputs may use:
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

Draft/pilot labels do not imply production source truth, human approval, SME approval, canonical status, publication readiness, embedding readiness, or Supabase write permission.
