#!/usr/bin/env bun
import path from 'node:path'
import { PLAN_DIR, REPO_ROOT, readJson, writeJson, writeText } from './source-reconciliation-utils'
const packs=readJson<any>(path.join(REPO_ROOT,'.ai/16_source_packs_draft/manifests/draft-source-pack-index.generated.json'),{manifests:[]})
const claims=readJson<any>(path.join(PLAN_DIR,'draft-claim-linkage-smoke.generated.json'),{links:[]})
const articles=readJson<any>(path.join(PLAN_DIR,'draft-article-improvement-prototype/index.generated.json'),{prototypes:[]})
const questions=readJson<any>(path.join(PLAN_DIR,'question-bank-dry-run-audit.generated.json'),{findings:[]})
const payload={generated_at:new Date().toISOString(),dry_run:true,db_write_attempted:false,admin_live_sync:false,allowed_use:'LOCAL_VALIDATION_ONLY',production_status:'NOT_PRODUCTION_READY',source_pack_review_items:packs.manifests||[],claim_review_items:claims.links||[],article_review_items:articles.prototypes||[],question_review_items:questions.findings||[],decision_capture_status:'HUMAN_APPROVAL_REQUIRED',supabase_status:'DO_NOT_MUTATE_SUPABASE'}
await writeJson(path.join(PLAN_DIR,'admin-local-review-payload.generated.json'),payload); await writeText(path.join(PLAN_DIR,'admin-local-review-payload-report.md'),`# Admin Local Review Payload Report\n\nDry-run: true\nDB write attempted: false\nAdmin live sync: false\n`); await writeText(path.join(PLAN_DIR,'phase018-admin-local-review-payload-report.md'),`# Phase 0.18 Admin Local Review Payload Report\n\nStatus: COMPLETE\n\nLocal mock payload generated. No Supabase mutation, migrations, or live admin sync.\n`); console.log(JSON.stringify({ok:true,source_pack_items:payload.source_pack_review_items.length,claim_items:payload.claim_review_items.length},null,2))
