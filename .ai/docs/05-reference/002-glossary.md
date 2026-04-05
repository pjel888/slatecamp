# ALE Glossary

**Status:** Active
**Analysis Date:** 2026-04-06
**Source:** Taxonomy, quiz content, database schema, readiness score

## Purpose

This glossary defines domain-specific terminology for the Philippine Architecture Licensure Exam (ALE) as used in SlateCamp. Terms are organized by category and cross-referenced to their implementation locations.

---

## Domain Terms

### ALE Subjects

| Term | Full Name | Description |
|------|----------|-------------|
| **ALE** | Architectural Licensure Examination | The 4-hour, 100-item pencil-and-paper exam administered by PRC. Passing rate varies 30-50%. |
| **AMBF** | Allowable Maximum Building Floor Area | Maximum total floor area permitted based on lot size and FLAR. Formula: `AMBF = Lot Area × FLAR`. |
| **BHL** | Building Height Limit | Maximum allowed building height in meters, determined by street width and zone classification. |
| **EOS** | Easement of Service | Required setback for utility easements (sewer, water, electrical). Minimum 3m. |
| **FLAR** | Floor Area Ratio Limit | Ratio of total floor area to lot area. Governs density. Formula: `FLAR = Total Floor Area / Lot Area`. |
| **GFA** | Gross Floor Area | Total floor area of all floors including walls, but excluding open courts > 10m². |
| **ISA** | Impervious Surface Area | Portion of lot covered by buildings, pavement, or other impermeable surfaces. Expressed as percentage. |
| **MACA** | Maximum Allowable Construction Area | Maximum buildable footprint. Formula: `MACA = Lot Area - OSA - EOS`. |
| **OSA** | Open Space Requirement | Mandatory unbuilt area ratio. Minimum 30% for residential in QC. |
| **PSO** | Permeable Surface/Open Space | Area that allows rainwater infiltration (gardens, grass, pavers with gaps). |
| **TGFA** | Total Gross Floor Area | Same as GFA. Sum of all floor areas including thickness of walls. |
| **TOSL** | Total Outdoor Sitting/Legally-required Open Space | Open space required by fire code (1.5m clearance around BFP). |
| **USA** | Usable Space Area | Floor area available for occupancy. Excludes walls, columns, stairs, toilets. |

### Development Controls (PD 1096 / NBCP)

| Term | Full Name | Description |
|------|----------|-------------|
| **PD 1096** | Presidential Decree 1096 | The National Building Code of the Philippines (1977). Sets minimum standards for design, construction, and occupancy. |
| **NBCP** | National Building Code of the Philippines | Modern name/revision of PD 1096. Administered by the DPWH. |
| **Rule VII** | Height and Bulk Regulations | Covers BHL, FLAR, setback requirements by occupancy and location. |
| **Rule VIII** | Lot Size, Yards, Courts, and Spaces | Covers lot dimensions, front/side/rear yards, courts, and parking. |
| **NBCP 2010** | Revised Implementing Rules | Updated IRR for PD 1096, effective 2010. |

### Fire Safety (PD 1185 / RA 9514)

| Term | Full Name | Description |
|------|----------|-------------|
| **RA 9514** | Republic Act 9514 | Fire Code of the Philippines (2009), repealing PD 1185. |
| **BFP** | Building Fire Protection | Requirements per NBCP Rule XI. Includes fire exits, fire resistive construction. |
| **PFSD** | Philippine Fire Safety Standards Delineation | Classification of occupancy types and required fire protection. |

### Zoning and Land Use

| Term | Full Name | Description |
|------|----------|-------------|
| **NUW** | National Urban Week | — |
| **CBCP** | — | — |
| **ZOLRB** | Zoning Ordinance of the Local Government Unit | Local ordinance defining land use zones. Varies per municipality. |
| **FLD** | Flood Line Determination | Required for developments near waterways. |

### Professional Practice

| Term | Full Name | Description |
|------|----------|-------------|
| **RAP** | Rules of Professional Practice | PRC Board Resolution governing architect conduct. |
| **UAP** | United Architects of the Philippines | National professional organization. Members use "UAP" suffix. |
| **PIID** | Philippine Institute of Interior Designers | Allied professional organization. |
| **PAI** | Philippine Association of Landscape Architects | Allied professional organization. |
| **BOA** | Board of Architecture | PRC regulatory board for architects. |

### Construction and Materials

| Term | Full Name | Description |
|------|----------|-------------|
| **CHB** | Concrete Hollow Blocks | Standard masonry unit. Sizes: 4", 6", 8". Used for load-bearing and partition walls. |
| **NMC** | National Building Code | See PD 1096 |
| **PFES** | Philippine Fire Code | See RA 9514 |

---

## SlateCamp-Specific Terms

### Quiz Modes

| Term | Description | Implementation |
|------|-------------|----------------|
| **CAMP** | Main study mode — adaptive question selection by IRT | `MODE_PRESETS.camp` in `src/lib/quiz/mode-presets.ts` |
| **STORM** | Timed practice mode — pressure-tested mastery | `MODE_PRESETS.storm` |
| **BLINDSPOT** | Focus on weakest 3 nodes + unexplored topics | `src/lib/srs/blindspot.ts` |
| **CHILL** | Untimed review with explanations always visible | `MODE_PRESETS.chill` |
| **PROOF** | Full exam simulation — 100 items, 4 hours | `MODE_PRESETS.proof` |

### Scoring and Mastery

| Term | Description | Implementation |
|------|-------------|----------------|
| **θ (theta)** | Student ability estimate from IRT 2PL model | `src/lib/readiness-score.ts` |
| **a-parameter** | Item discrimination (slope of ICC) | Stored in `questions` table |
| **b-parameter** | Item difficulty (midpoint of ICC) | Stored in `questions` table |
| **Readiness Score** | Composite 0-100 score using 6 vectors | `src/lib/readiness-score.ts` |
| **Mastery Level** | building, developing, proficient, mastered | Derived from theta intervals |

### Taxonomy Structure

| Term | Description |
|------|-------------|
| **Subject** | Top-level category (e.g., "Architectural Design") |
| **Subtopic** | Child of subject (e.g., "Site Planning") |
| **Article** | Learning content linked to subtopics |
| **Question** | Assessment item linked to subtopics |

---

## Database Entity References

| Entity | Description | Key Fields |
|--------|-------------|-----------|
| `subjects` | ALE exam subjects | id, name, code |
| `subtopics` | Topics within subjects | id, subject_id, name |
| `articles` | Wiki learning content | id, subtopic_id, title, content_md |
| `questions` | Assessment items | id, subtopic_id, stem, correct_answer, explanation, difficulty, discrimination |
| `user_progress` | Per-question mastery tracking | user_id, question_id, theta, easiness, interval |
| `sessions` | Quiz/testing sessions | id, user_id, mode, started_at, completed_at |

---

## Implementation Locations

| Term Area | Files |
|-----------|-------|
| IRT 2PL model | `src/lib/srs/irt.ts`, `src/lib/readiness-score.ts` |
| SRS scheduling | `src/lib/srs/sm2.ts`, `src/lib/srs/update.ts` |
| Blindspot queue | `src/lib/srs/blindspot.ts` |
| Mode presets | `src/lib/quiz/mode-presets.ts` |
| Database schema | `DATABASE_SCHEMA.sql` |

---

*Glossary: 2026-04-06*
