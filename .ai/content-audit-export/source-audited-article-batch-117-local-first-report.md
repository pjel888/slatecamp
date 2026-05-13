# Source-Audited Article Batch 117 Local-First Report

- Batch ID: source-audited-article-batch-117-local-first
- Generated at: 2026-05-13T21:23:11+08:00
- Branch: 3dlab-gray-viewport-bg
- Start baseline commit: 1f73e77bd
- Source acquisition commit: 1f73e77bd
- Status: pass local-first; real git stage/commit/push blocked by live index permissions and GitHub DNS resolution.
- Scope: 2 reopened professional-practice law articles, 20 linked questions, 20 question-edit JSON files.
- Reopen reason: LAW-014 and LAW-015 were blocked in Batch 116 only by the missing local RA 8293/IP Code source. The local source layer now contains Lawphil text/html, refined markdown, and the ADB LPR PDF.
- Primary source rule: RA 8293 Lawphil local text/refined markdown for IP/copyright claims; RA 9266 IRR Section 33 only for signed/sealed architectural-document ownership and written-consent duplication.
- Forbidden actions observed: no Supabase push, no deploy, no production DB mutation, no merge to main.

## Selected Articles

| Article | Status | Sources | Linked Questions | Question Edits | Scenario |
| --- | --- | ---: | ---: | ---: | --- |
| lea-prac-law-014-intellectual-property-code-ra-8293-applied-to-architectural-works | pass | 4 | 10 | 10 | not_added; existing exam-guardrail structure retained and unsupported scenario claims avoided |
| lea-prac-law-015-copyright-duration-transfer-moral-rights-and-infringement-remedies | pass | 3 | 10 | 10 | not_added; existing exam-guardrail structure retained and unsupported scenario claims avoided |

## Validation Gates

- Compose/diff/validate strict 2/2: pass
- UI-block edit validation: pass
- Scoped JSON parse: pass
- Placeholder/internal-note/source-gap scan: pass in outgoing normalized/candidate/question-edit scope; unchanged original.md retains historical UI-block markers only
- Source hash checks: pass; 10 checked source instances
- Linked-question/question-edit count checks: pass (LAW-014 10/10; LAW-015 10/10)
- Stale compose-error scan: pass
- Targeted content-audit tests: pass; 34 pass, 0 fail, 328 expect() calls
- Scoped git diff --check: pass (2026-05-13T21:23:11+08:00)
- Cached diff check: pass via temporary index after intended Batch 117 paths only
- Real git stage/commit/push gate: blocked; live `git add` failed with `.git/index.lock` permission denial, a temporary commit object was created, and `git push` failed because `github.com` could not be resolved.

## Source Decisions

- LAW-014: Bounded to RA 8293 Sections 172, 175, 177, 178, 180, 181, 186, 193, 195, 198, 199, 213, 216, 217, 221, and 226, with RA 9266 IRR Section 33 used only for signed/sealed professional-document ownership and written-consent duplication.
- LAW-015: Bounded to RA 8293 Sections 180, 181, 193, 195, 198, 213, 216, 217, and 226 for assignment, material-object separation, moral rights, duration, civil remedies, criminal penalties, and damages timing.
- Added the RA 8293 ADB LPR 2015 PDF as a local companion source record and source-hash check; Lawphil remains controlling for statutory section claims.

## Removed Or Corrected Claims

- LAW-014: Removed unsupported IPOPHL prima-facie registration-certificate framing from the article and one linked question.
- LAW-014: Corrected stale life-plus-70 answer option/rationale to life plus 50 under local RA 8293 Section 213.1.
- LAW-014: Corrected the RA 9266/RA 8293 relationship question so the selected option is the source-supported answer.
- LAW-014: Narrowed delayed online-use remedies to injunction plus damages subject to Section 226.
- LAW-015: Corrected moral rights from forever/inalienable/unwaivable language to non-assignable/non-licensable, limited-waiver, life-plus-50 language.
- LAW-015: Removed unsupported PHP 250,000 statutory-damages wording from linked question and article framing.
- LAW-015: Corrected criminal-penalty explanation to local Section 217 text instead of unsupported willfulness/intent-to-defraud shorthand.
- LAW-015: Added Section 226 damages-limit caution to delayed infringement remedies.

## Source-Gap Reopen Outcome

- LAW-014: reopened and accepted locally with article improvements plus 10 linked question edits.
- LAW-015: reopened and accepted locally with article improvements plus 10 linked question edits.
- No fabricated edits were created; both bundles already had 10 linked questions, and Batch 117 generated source-supported replacement question-edit JSON files.

## Final-Depth Carryover

- lea-prac-law-014-intellectual-property-code-ra-8293-applied-to-architectural-works: Do not restore IPOPHL prima-facie registration-certificate framing, life-plus-70 copyright duration, blanket post-assignment rights, or uncited online-use remedies without additional local primary source support.
- lea-prac-law-015-copyright-duration-transfer-moral-rights-and-infringement-remedies: Do not restore forever/inalienable/unwaivable moral-rights language, PHP 250,000 statutory-damages shorthand, willfulness/intent-to-defraud criminal shorthand, or life-plus-70 duration unless future local source law supports it.

## Follow-On Handoff

Batch 117 supersedes the Batch 116 LAW-014/LAW-015 source-gap exclusion. Keep Supabase publish, deploy, production DB mutation, and main merge forbidden unless explicitly authorized in a later run.
