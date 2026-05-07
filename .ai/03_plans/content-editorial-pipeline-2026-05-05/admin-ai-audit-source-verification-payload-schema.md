# Admin AI Audit Source Verification Payload Schema Draft — Phase 0.5C

**Generated:** 2026-05-05T15:48:50Z
**Status:** Draft schema only. No DB writes. No source approval.

## 1. Root shape

```json
{
  "schema_version": "source_verification_admin_payload.v0.1",
  "generated_at": "2026-05-05T15:48:50Z",
  "source_phase": "phase_0_5b",
  "source_status": "DISCOVERY_ONLY_UNVERIFIED_EVIDENCE",
  "run": {},
  "items": [],
  "findings": [],
  "proposals": [],
  "decisions": [],
  "validation": {}
}
```

## 2. Run record

Maps to future `ai_audit_runs`.

Required fields:

- `run_type`: `source_verification`
- `scope_type`: `vitruvius_connection`
- `phase`: `tier2_source_verification`
- `provider`: `manual_script`
- `model`: `null`
- `status`: `completed` or `failed`
- `total_items`: evidence row count
- `completed_items`: processed row count
- `flagged_items`: count requiring human/SME review
- `metadata.no_source_approval`: `true`
- `metadata.no_content_mutation`: `true`

## 3. Item record

Maps to future `ai_audit_items`.

```json
{
  "target_type": "source",
  "target_id": "bundle-000017",
  "phase": "tier2_source_verification",
  "status": "needs_human_review",
  "source_hash": null,
  "metadata": {
    "bundle_id": "bundle-000017",
    "source_file_ids": [1, 2],
    "base_bundle_risk_tier": "HIGH",
    "evidence_status": "NEEDS_HUMAN_VERIFICATION",
    "candidate_source_type": "statute_archive_rank5",
    "official_source_candidate_rank": 5,
    "allowed_use": "DISCOVERY_ONLY",
    "human_review_required": true,
    "sme_review_required": true,
    "source_pack_creation_blocked": true
  }
}
```

Allowed item statuses:

- `needs_source_check`
- `needs_human_review`
- `flagged`
- `failed`

Forbidden item statuses in Phase 0.5C draft payload:

- `approved`
- `published`
- `validated`
- `passed` unless a future human-reviewed packet explicitly allows it

## 4. Finding record

Maps to future `ai_audit_findings`.

```json
{
  "target_type": "source",
  "target_id": "bundle-000017",
  "severity": "high",
  "status": "open",
  "risk_type": "weak_sources",
  "finding_summary": "Only Rank 5 statute-archive evidence found; preferred official issuing-body confirmation unresolved.",
  "recommended_next_step": "Human/SME review; attempt Official Gazette or issuing-body confirmation.",
  "confidence": "medium",
  "provider": "manual_script",
  "model": null,
  "metadata": {
    "evidence_row_path": "phase05b-live-verification-results.generated.csv",
    "packet_draft_path": "source-verification-packets-draft/bundle-000017-...md",
    "no_source_approval": true
  }
}
```

Allowed finding severities:

- `medium` for unresolved non-HIGH rows
- `high` for HIGH rows, Rank 5-only evidence, or missing official source for legal/code/policy bundles
- `critical` for confirmed conflicts or contradictory official sources

## 5. Proposal record

Maps to future `ai_change_proposals`, but Phase 0.5C should generate no source-promotion proposal unless a packet is approved later.

Future allowed proposal intent after explicit implementation approval only. Current Phase 0.5C generated payload must keep `proposals: []`:

```json
{
  "target_type": "source",
  "target_id": "bundle-000017",
  "proposal_type": "status_only",
  "old_content": { "review_status": "unreviewed" },
  "proposed_content": { "review_status": "needs_human_review" },
  "status": "pending",
  "provider": "manual_script",
  "metadata": {
    "staged_only": true,
    "no_allowed_use_promotion": true
  }
}
```

Forbidden proposal content for both Phase 0.5C drafts and any future dry-run unless an approved packet explicitly permits it:

- `allowed_use: GROUNDING_CANDIDATE`
- `verification_status: verified`
- `official_web_match_status: verified`
- `status: approved`
- `status: applied`
- article/question content changes

## 6. Decision record

Maps to future `ai_review_decisions` only after UI/API implementation is approved.

Allowed decision values from local migration:

- `approve`
- `reject`
- `needs_edit`
- `mark_reviewed`
- `note`

Phase 0.5C draft payload should keep `decisions: []` because no human/SME decision has been made.

## 7. Validation object

Required validation counters:

```json
{
  "evidence_row_count": 85,
  "item_count": 85,
  "finding_count": 85,
  "proposal_count": 0,
  "decision_count": 0,
  "all_rows_human_review_required": true,
  "all_high_rows_sme_review_required": true,
  "lawphil_rows_rank5_only": true,
  "source_approval_unblocked": false,
  "source_pack_creation_unblocked": false,
  "content_mutation_unblocked": false
}
```

## 8. Gate verdict

```txt
ADMIN_AI_AUDIT_SOURCE_PAYLOAD_SCHEMA = DRAFT_READY
DB_INSERT = BLOCKED
LIVE_ADMIN_UI_SYNC = BLOCKED
SOURCE_APPROVAL = BLOCKED
```
