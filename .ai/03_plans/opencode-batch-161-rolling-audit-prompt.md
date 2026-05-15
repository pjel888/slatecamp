You are a read-only rolling final-second-audit worker for SlateCamp.

Repo: /Users/philiplewis/slatecamp
Branch: 3dlab-gray-viewport-bg
Accepted batch to audit: Batch 161 only
Output file: .ai/03_plans/final-second-audit/rolling-readonly-swarm/opencode-deepseek-batch-161-reopened-nscp-audit.md

Hard constraints:
- Read-only except writing exactly the output file above.
- No content edits, no article/question/source edits, no staging, no commits, no pushes, no Supabase, no deploy, no DB, no main merge.
- Preserve final-audit intelligence: THIN_NEEDS_EXPANSION, scenario gaps, question-alignment risks, source-primary findings.

Inspect:
- Batch 161 report, ledger, scoped checks, stage paths, independent QA reports.
- The five selected article folders and their normalized.md/candidate.md/sources.json/source-audit-evidence.json/question-edits.
- Local NSCP source evidence paths and anchors referenced.

Classify each Batch 161 article as one of: PASS, THIN_NEEDS_EXPANSION, SOURCE_NEEDS_RECHECK, QUESTION_ALIGNMENT_RISK, BLOCKER, MISSING_ARTIFACTS.

Report structure:
- Overall verdict for Batch 161
- Per-article table with classification and evidence
- Source/roundtrip/question/scenario/pedagogical-depth findings
- Findings to preserve for final rigorous remediation
- Clear statement that no content edits/git/Supabase/deploy actions were performed