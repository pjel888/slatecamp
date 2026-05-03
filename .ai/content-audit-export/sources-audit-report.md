# BLOCKER 5 & 6: Sources.json Audit Report
## Generated: 2026-05-03

---

## BLOCKER 6: Orphan sources.json

### 7 Alias Stub Directories Found

7 directories share UUIDs with canonical article directories (manifest entries). These are the "7 alias stub directories":

| UUID | Stub Directory (NOT in manifest) | Has sources.json? | Canonical Directory (IN manifest) |
|------|----------------------------------|-------------------|-----------------------------------|
| 97befd70 | lea-prac-ctr-003-suspension-termination | NO sources.json | lea-prac-ctr-003-suspension-and-termination-of-the-owner-architect-agreement |
| 2baaafee | lea-prac-ctr-004-uap-doc-301 | NO sources.json | lea-prac-ctr-004-uap-doc-301-overview-purpose-structure-and-the-three-party-relationship |
| 5e8c7d0a | lea-prac-ctr-005-the-architect-s-authority-during-construction | NO sources.json | lea-prac-ctr-005-the-architect-s-authority-during-construction-powers-limits-and-the-line-with-the-c |
| 7a7a042f | lea-prac-ctr-013-professional-indemnity-insurance | NO sources.json | lea-prac-ctr-013-professional-indemnity-insurance-for-architects-what-it-covers-and-why-it-matters |
| c36a3b99 | lea-prac-ctr-014-certificate-of-payment | HAS sources.json (1 source) | lea-prac-ctr-014-certificate-of-payment-issuance-process-architect-s-certification-role-and-legal-im |
| af5e9418 | lea-prac-ctr-015-retention-money | HAS sources.json (1 source) | lea-prac-ctr-015-retention-money-standard-rates-purpose-and-release-conditions |
| 4e28889a | lea-prac-ctr-016-change-orders | HAS sources.json (1 source) | lea-prac-ctr-016-change-orders-types-authority-limits-and-the-documentation-process |

### Sources.json Count vs Article Directories

- **Manifest articles**: 567
- **Article directories on disk**: 575 (567 canonical + 8 extra)
- **sources.json files in article directories**: 570
- **5 article directories missing sources.json**: NONE (all 567 manifest dirs have sources.json)
- **Extra items** (not in manifest): 18 items (11 scripts/files, 7 alias stub directories)

The 7 alias stubs are abbreviated-slug copies of their canonical counterparts — likely created during a content export/import cycle. 4 have no sources.json at all, 3 have sources.json with real source data.

### Verdict: Cleanup Needed?

**Harmless but messy.** The stub directories are on-disk only (not in manifest) and don't affect the application. However:
- 4 stubs without sources.json should be **deleted** (they're stale copies)
- 3 stubs WITH sources.json duplicate data — the canonical dirs also have sources. These should be **removed** to avoid confusion
- The 108 manifest source_count=0 discrepancies (manifest says 0 but sources.json has real data) should be **reconciled** — re-export or update the manifest

**Recommendation**: Clean up the 7 alias stub directories. The sources.json data in the stubs is already present in the canonical directories.

---

## BLOCKER 5: Empty sources.json

### Counts

| Category | Count |
|----------|-------|
| Total manifest articles with source_count=0 | 247 |
| Articles with truly empty sources.json `"sources": []` | **139** |
| Articles where manifest says 0 but sources.json HAS real sources | **108** (data discrepancy - manifest needs refresh) |
| Articles with no sources.json file | 0 |

### Sampled Classification (139 truly empty)

After examining article content for 12+ sampled articles, I classified all 139 by slug patterns and article type:

| Classification | Count | Examples |
|---------------|-------|---------|
| ✅ **Acceptably empty** (conceptual/overview/mastery/test) | **38** | 8 overview-*, 8 mastery-*, 4 owner-smoke, 1 playwright, 17 historical/conceptual named topics |
| ❌ **Should have sources** (legal/regulatory/technical content) | **102** | 9 lea-prac-cmp, 19 lea-prac-svc, 6 lea-prac-frm, 8 lea-prac-ctr, 10 lea-plan, 28 lea-util, 6 technical named topics, 11 SPP doc articles, 1 law-qa-deck, 2 uap-spp, 3 other technical |

### Detailed Breakdown

**38 Acceptably Empty:**
- 8 Overview articles (study strategy/roadmaps)
- 8 Mastery articles (cross-topic connections)
- 5 Test/smoke articles (owner-smoke, playwright)
- 17 Historical/conceptual named topics (brutalism, bauhaus, pre-colonial, mies, le-corbusier, movements, etc.)

**102 Should Have Sources:**
- 9 lea-prac-cmp (compensation formulas referencing SPP Doc 202)
- 19 lea-prac-svc (service descriptions referencing SPP Docs 202-209)
- 6 lea-prac-frm (practice forms referencing RA 9266, CPD, etc.)
- 8 lea-prac-ctr (contracts referencing bonds, guarantees, legal codes)
- 10 lea-plan (planning regulations referencing PD 1096, BP 344)
- 28 lea-util (MEPF standards referencing PEC, NSCP, PD 1096)
- 11 SPP Doc articles (literally describing official documents — should cite them)
- 6 Technical named topics (chimneys/fireplaces, excavation, prefab, glass/glazing, etc.)
- 1 Law QA deck
- 3 Other technical (ergonomics, exam-meta, institutional dimensions)

### Sample Content Verifications

| Sampled Article | Type | Finding |
|----------------|------|---------|
| 21st Century Movements | Historical/conceptual | ✅ Acceptably empty |
| Chimneys and Fireplaces | Technical (PD 1096 §1211) | ❌ Should cite PD 1096 |
| Overview - Professional Practice | Study strategy | ✅ Acceptably empty |
| Mastery - Architectural Design | Cross-topic connections | ✅ Acceptably empty |
| lea-prac-law-010 (Civil Code 1723) | Legal (15-year liability) | ❌ Should cite Civil Code |
| lea-prac-frm-012 (RA 9184) | Legal (Procurement Reform) | ❌ Should cite RA 9184 |
| Plastics in Construction | Technical (PD 1096, ASTM) | ❌ Should cite standards |
| lea-theo-001-12 (Semiotics) | Conceptual/theoretical | ✅ Acceptably empty |
| lea-prac-cmp-006 (MDPE formula) | Technical (fee computation) | ❌ Should cite SPP Doc 202 |
| lea-prac-ctr-008 (Bid Documents) | Legal/procedural | ❌ Should cite SPP Doc 202 |
| lea-util-006-05 (Illumination levels) | Technical (IESNA standards) | ❌ Should cite lighting standards |

### Verdict

- **38 articles** (~27%) are truly conceptual/overview and empty sources is acceptable
- **102 articles** (~73%) contain legal, regulatory, or technical claims derived from specific laws, codes, standards, or official documents — these **should have sources.json populated**
- **108 additional articles** have a manifest/disk discrepancy (manifest says source_count=0 but sources.json has real data) — the manifest needs to be re-exported/refreshed
