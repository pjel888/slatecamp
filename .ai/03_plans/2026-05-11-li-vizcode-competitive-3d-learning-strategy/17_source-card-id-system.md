# 17 — Source Card ID System

## Purpose

Define the ID system that connects LI module configs to vitruvius-connection canonical knowledge. Every LI scene element must be traceable to a verified source. This document specifies the chain of resolution.

## The Resolution Chain

```
LI Module Config Layer
  └── sourceCardId: string
        │
        ▼
Vitruvius Concept (003_Canonical-Knowledge-Layer/shared/concepts/)
  └── regulatory_basis[].source_id
  └── regulatory_basis[].section_id
  └── regulatory_basis[].evidence_snippet
        │
        ▼
Vitruvius Source Page (003_Canonical-Knowledge-Layer/shared/sources/ or 001-Laws/)
  └── Points to raw PDF in 001_Raw-Source-Layer/001-Laws/
        │
        ▼
Raw Source PDF (001_Raw-Source-Layer/001-Laws/[law]/*.pdf)
  └── Section text extracted via OCR pipeline (002_Raw-Conversion-Layer/)
```

## ID Format Convention

### Source Card IDs in LI Module Configs

Source card IDs use the vitruvius concept ID format: `concept-{slug}`

```typescript
// In LearningLayerDef (src/features/3d-lab/types/templates.ts)
export interface LearningLayerDef {
  id: string
  label: string
  description?: string
  geometry: GeometryInstruction
  defaultVisible?: boolean
  group?: string
  /** Vitruvius concept ID for source card resolution */
  sourceCardId?: string       // e.g., "concept-accessible-ramps"
  /** Fallback: direct code citation (used when no vitruvius concept exists) */
  codeCitation?: string        // e.g., "BP 344 §4.02"
}
```

### ID Resolution Logic

```typescript
// Conceptual — implementation may use static imports or a registry

async function resolveSourceCard(sourceCardId: string): Promise<SourceCardData> {
  // 1. Check if this is a vitruvius concept ID
  if (sourceCardId.startsWith('concept-')) {
    // 2. Import concept from vitruvius-connection
    //    (at build time: statically import concept files)
    const concept = await importConcept(sourceCardId)

    // 3. Extract regulatory basis
    const primaryBasis = concept.regulatory_basis?.[0]

    return {
      conceptId: concept.id,
      title: concept.title,
      definition: concept.definition,   // from body ## Definition section
      sourceLabel: resolveSourceLabel(primaryBasis?.source_id),
      sectionId: primaryBasis?.section_id,
      sectionText: primaryBasis?.evidence_snippet,
      canonicalStatus: concept.canonical_status,  // enriched | draft | validated
      stringencyVector: concept.stringency_vector, // maximize | minimize | qualitative
      interpretationBoundary: concept.canonical_status === 'enriched'
        ? 'Source-verified'
        : 'Source pending — draft concept',
    }
  }

  // 3. Fallback: direct code citation (no vitruvius concept)
  return {
    conceptId: null,
    codeCitation: sourceCardId,
    canonicalStatus: 'unverified',
    interpretationBoundary: 'Direct code citation — pending canonical verification',
  }
}
```

## Source Label Resolution

Source IDs in vitruvius map to human-readable labels:

| source_id | Human-Readable Label |
|-----------|---------------------|
| `law-national-building-code-of-the-philippines` | PD 1096: National Building Code of the Philippines |
| `irr-revised-implementing-rules-and-regulations-of-batas-pambansa-blg-344` | BP 344 IRR: Accessibility Law |
| `law-fire-code-of-the-philippines` | RA 9514: Fire Code of the Philippines |
| `law-subdivision-and-condominium-buyers-protective-decree` | PD 957: Subdivision and Condominium Buyers' Protective Decree |
| `law-socialized-housing-law-of-the-philippines` | BP 220: Socialized Housing Law |
| `law-philippine-green-building-code` | GBC: Philippine Green Building Code |

## Source Card Data Interface

```typescript
// In src/features/3d-lab/types/templates.ts

export interface SourceCardData {
  /** Vitruvius concept ID, if available */
  conceptId: string | null
  /** Human-readable title (from concept or layer label) */
  title: string
  /** Regulatory definition text */
  definition?: string
  /** Human-readable source label (e.g., "PD 1096: National Building Code") */
  sourceLabel?: string
  /** Section identifier (e.g., "sec-707", "§4.02") */
  sectionId?: string
  /** The actual regulatory text */
  sectionText?: string
  /** Canonical verification status */
  canonicalStatus: 'enriched' | 'draft' | 'validated' | 'unverified'
  /** Stringency direction */
  stringencyVector?: 'maximize' | 'minimize' | 'qualitative'
  /** Cleared interpretation boundary statement */
  interpretationBoundary: string
  /** Direct code citation (fallback when no concept exists) */
  codeCitation?: string
  /** Link to full Wiki article if available */
  wikiArticleId?: string
  /** Link to full vitruvius concept page */
  conceptPagePath?: string
}
```

## How LI Module Configs Reference Source Cards

### Example: bp344-ramp-layers.ts

```typescript
// Conceptual LI module config using vitruvius concept IDs
export const bp344RampLayers: LearningSceneConfig = {
  id: 'bp344-ramp-layers',
  title: 'BP 344 Accessible Ramp Components',
  subject: 'Accessibility',
  layers: [
    {
      id: 'ramp-surface',
      label: 'Ramp Surface',
      defaultVisible: true,
      description: 'The main ramp running surface with required slope and width.',
      sourceCardId: 'concept-accessible-ramps',  // ← vitruvius concept ID
      geometry: { type: 'box', position: [0,0,0], args: [1.2, 0.15, 4.0], color: '#b0b0b0' },
    },
    {
      id: 'landing-platform',
      label: 'Landing Platform',
      defaultVisible: true,
      description: 'Level landing at top and bottom of ramp. Min 1.50m length.',
      sourceCardId: 'concept-accessible-ramps',  // Same concept covers landings
      geometry: { type: 'box', position: [0,0,4.0], args: [1.5, 0.05, 1.5], color: '#c0c0c0' },
    },
    {
      id: 'handrail',
      label: 'Handrail',
      defaultVisible: true,
      description: 'Handrails required on both sides. Height: 0.90m-1.10m.',
      codeCitation: 'BP 344 §5',  // ← Fallback: concept not yet enriched
      geometry: { type: 'cylinder', position: [0.65,1.0,0.5], args: [0.02, 0.02, 1.5], color: '#404040' },
    },
  ],
  supportedModes: ['focus', 'source'],
  camera: { position: [3, 2, 3], target: [0, 0.5, 2], fov: 45 },
}
```

## Source Card Display in LI UI

### Source View Panel (right sidebar)

```
┌─ Source Card ───────────────────────────────┐
│                                              │
│ 📋 BP 344 IRR: Accessibility Law             │
│ § section-1: Accessible Ramps                │
│                                              │
│ "Accessible ramps shall have the following   │
│  facilities and features and shall be        │
│  provided where changes in level occur       │
│  except when served by a dropped sidewalk,   │
│  curb ramp, elevator, or other mechanical    │
│  device."                                    │
│                                              │
│ ✅ Status: Source-verified (enriched)         │
│ 📐 Stringency: Qualitative                   │
│                                              │
│ ⚠ SlateCamp interpretation:                  │
│ This requirement applies to ALL changes in   │
│ level in the accessible route, including     │
│ both interior and exterior spaces.           │
│                                              │
│ 📖 Full concept: concept-accessible-ramps    │
│ 🔗 Wiki article: BP 344 Accessible Ramps     │
│ 🐛 [Report Issue]                            │
└──────────────────────────────────────────────┘
```

### Source View Panel (draft concept fallback)

```
┌─ Source Card ───────────────────────────────┐
│                                              │
│ ⚠ BP 344 §5: Handrails                      │
│                                              │
│ Direct code citation. Pending canonical      │
│ verification. Expected requirements:         │
│ • Height: 0.90m-1.10m above ramp surface     │
│ • Required on both sides of ramp             │
│ • Must extend 300mm beyond top and bottom    │
│                                              │
│ ⚠ Status: Pending verification               │
│    (concept not yet enriched in Vitruvius)    │
│                                              │
│ 🔗 Wiki article: BP 344 Handrails            │
│ 🐛 [Report Issue / Submit Verification]      │
└──────────────────────────────────────────────┘
```

## Trust Status Indicators

| canonical_status | Display Label | Badge Color | Meaning |
|-----------------|---------------|-------------|---------|
| `validated` | ✅ Source-verified | Green | Fully verified by SME against official source |
| `enriched` | ✅ Source-verified | Green | Enriched with regulatory basis and evidence |
| `draft` | ⚠ Pending verification | Amber | Concept exists but lacks full regulatory basis |
| *(missing concept)* | ⚠ Pending verification | Amber | Direct code citation; no canonical concept yet |
| *(no source)* | ❌ Unverified | Red | No source reference at all |

## Implementation: Importing Vitruvius Concepts

### Option A: Static Import at Build Time (Recommended for MVP)

```typescript
// src/features/3d-lab/config/source-cards.ts
// Generated at build time or manually maintained

import { accessibleRamps } from '@/vitruvius-connection/003_Canonical-Knowledge-Layer/shared/concepts/accessible-ramps.md'
// ↑ This requires a markdown loader or pre-processing step

// Simpler approach: manual mapping
export const SOURCE_CARD_REGISTRY: Record<string, SourceCardData> = {
  'concept-accessible-ramps': {
    conceptId: 'concept-accessible-ramps',
    title: 'Accessible Ramps',
    definition: 'Accessible ramps shall have the following facilities and features...',
    sourceLabel: 'BP 344 IRR: Accessibility Law',
    sectionId: 'section-1',
    sectionText: 'Accessible ramps shall have the following facilities...',
    canonicalStatus: 'enriched',
    stringencyVector: 'qualitative',
    interpretationBoundary: 'Source-verified',
  },
  'concept-stairs': {
    conceptId: 'concept-stairs',
    title: 'Stairs',
    definition: 'The construction of stairs and exits shall conform to...',
    sourceLabel: 'PD 1096: National Building Code',
    sectionId: 'sec-1207',
    sectionText: 'The construction of stairs and exits shall conform...',
    canonicalStatus: 'enriched',
    stringencyVector: 'qualitative',
    interpretationBoundary: 'Source-verified',
  },
  // ... all LI-relevant concepts
}
```

### Option B: Dynamic Import from Vitruvius (Future)

When the pipeline is more mature, concepts can be dynamically loaded:
```typescript
const concept = await import(
  `@/vitruvius-connection/003_Canonical-Knowledge-Layer/shared/concepts/${conceptId}.md`
)
```

### Option C: Build-Time Extraction Script (Scalable)

A script that reads all `shared/concepts/*.md` files, extracts frontmatter, and generates a `SOURCE_CARD_REGISTRY` TypeScript file. This can be a `bun run generate:source-cards` script.

## Source Card ID for Non-Vitruvius Dimensions

When a dimension is not yet extracted into a vitruvius concept, use the `codeCitation` field with a structured format:

```
Format: {LAW_ID} §{SECTION}
Examples:
  "BP 344 §4.02"        — BP 344, Section 4.02 (ramp clear width)
  "PD 1096 §804(a)"     — PD 1096, Section 804(a) (court dimensions)
  "RA 9514 §10.2.5.2"   — RA 9514, Section 10.2.5.2 (stair geometry)
  "BP 220 Rule III §5"  — BP 220, Rule III, Section 5
```

This provides a human-readable citation that can later be upgraded to a vitruvius concept ID when enrichment occurs.
