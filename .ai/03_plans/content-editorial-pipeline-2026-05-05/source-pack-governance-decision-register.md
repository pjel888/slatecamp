# Source Pack Governance Decision Register — Pre-Implementation

**Generated:** 2026-05-05T15:28:29Z  
**Scope:** Track unresolved governance decisions that can be planned before source-pack implementation.  
**Status:** Decision register only. It does not approve source packs, chunking, embeddings, provider use, or publication.

---

## 1. Purpose

Source-pack creation remains blocked until verification packets are approved. However, governance decisions can be prepared before implementation so the eventual build plan is not blocked by avoidable ambiguity.

---

## 2. Decision Register

| Decision ID | Topic | Current default | Required decision | Owner/gate | Status |
|---|---|---|---|---|---|
| SPG-001 | Storage location | plan folder only for evidence; no source packs generated | Decide final source-pack location and ignored/tracked boundaries | Philip/admin | OPEN |
| SPG-002 | Original PDF retention | retain PDFs in `vitruvius-connection/`; no deletion | Decide retention/backup policy for verified original PDFs | Philip/admin | OPEN |
| SPG-003 | Copyright status | unknown unless government/public-domain evidence exists | Classify each source as government_work, licensed, fair_use, restricted, or unknown | legal/admin | OPEN |
| SPG-004 | Provider boundary | do not upload copyrighted/local PDFs to external providers by default | Decide which source classes can be sent to AI providers | legal/admin | OPEN |
| SPG-005 | Chunk size strategy | unresolved | Choose legal/code chunk granularity: page, section, rule, table, formula | editorial/engineering | OPEN |
| SPG-006 | Locator policy | page or section locator required for High/Critical | Decide minimum locator support by risk tier | SME/admin | OPEN |
| SPG-007 | Versioning policy | explicit year preferred; `current` discouraged | Decide source_pack_id version naming and supersession rules | editorial/engineering | OPEN |
| SPG-008 | Diff/update strategy | no automatic replacement | Decide how amended laws/IRRs update source packs and derived claims | SME/admin | OPEN |
| SPG-009 | Embedding boundary | blocked | Decide when/where embeddings are generated and stored | engineering/admin | BLOCKED |
| SPG-010 | Admin audit linkage | planned only | Decide whether source-pack decisions sync to `ai_audit_*` | engineering/admin | OPEN |
| SPG-011 | Local vs official conflict | flag and human review | Decide tie-break procedure where official hosts disagree | SME/legal | OPEN |
| SPG-012 | Textbook/reference use | discovery only unless rights cleared | Decide which textbook-derived material is excluded from provider processing | legal/admin | OPEN |

---

## 3. Defaults Until Decided

1. `allowed_use = DISCOVERY_ONLY` for all bundles.
2. No source-pack files are generated.
3. No chunks or embeddings are generated.
4. No provider upload of local source files.
5. No article/question edits rely on these sources.
6. High/Critical legal-code claims require source verification packet approval.

---

## 4. Required Before Source-Pack Build Plan

Before Phase 0.5D source-pack build planning can become implementation-ready, decide or explicitly defer:

- SPG-001 storage location
- SPG-003 copyright status model
- SPG-004 provider boundary model
- SPG-005 chunk size strategy
- SPG-006 locator policy
- SPG-007 versioning policy
- SPG-008 diff/update strategy

---

## 5. Current Verdict

```txt
SOURCE_PACK_GOVERNANCE_REGISTER = CREATED
SOURCE_PACK_BUILD_IMPLEMENTATION = BLOCKED
SOURCE_APPROVAL = BLOCKED
EMBEDDINGS = BLOCKED
```
