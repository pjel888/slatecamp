# 3D GLTF Integration — Implementation Plan

**Created:** 2026-04-12
**Status:** APPROVED — Consensus Reached (Iteration 2) + Storage Architecture Revision (R2 from Phase 1)
**Author:** RALPLAN Consensus (Planner → Architect ITERATE → Critic ITERATE → Revision → Architect APPROVE → Critic APPROVE)
**Consensus Date:** 2026-04-12
**Scope:** Introduce a first-class `gltf-asset` template into the 3D Lab, covering the full stack from admin ingestion to student runtime rendering.

---

## RALPLAN-DR Summary

### Principles
1. **Shell reuse maximization** — The ViewportShell, CameraNavigationBar, SceneToolbar, DOMOverlayLayer, and all 26 shell components are template-agnostic. GLTF modules must plug into the same slot-based architecture.
2. **Reconnection over greenfield** — The `models_3d` table, admin asset actions, `Workspace.tsx` DynamicModel logic, and `AssetPreloader` already exist. Binary storage moves to Cloudflare R2, but the metadata/admin layer is a reconnection of dormant infrastructure, not a greenfield build.
3. **Config-driven consistency** — GLTF modules must be first-class citizens in the template system, using the same `ModuleConfig` discriminated union, `ModuleRegistryEntry`, and `useTemplateContent` hook.
4. **Phased rollout** — View-only + annotations first, then layers/X-ray/parameters. Do not attempt full feature parity with procedural modules in Phase 1.
5. **Admin-to-student pipeline completeness** — The plan must cover the full path: admin uploads GLB -> creates metadata -> authors config -> module appears in student-facing lab.

### Decision Drivers
1. The 209 procedural modules define the UX bar; GLTF modules must not regress quality
2. Existing admin infrastructure (`models_3d` table, `assets.ts` actions) should be reused; binary storage moves to Cloudflare R2 from Phase 1
3. The DRACO blocker (`/public/draco/` missing) must be resolved before any GLTF work ships

### Viable Options — Asset-to-Module Linking

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. Code-authored config referencing DB asset** | Module configs remain `.ts` files. Each GLTF config references a `models_3d` record by URL/slug. | Type-safe, version-controlled, reviewable, consistent with 209 existing modules | Requires developer to author config per module |
| **B. DB-authored config** | Module configs stored entirely in `models_3d.metadata` JSONB. Renderer reads config from DB at runtime. | No code changes per module; admin-only workflow | Loses type safety, version control, code review; diverges from existing architecture |
| **C. Generated config from upload** | CLI/admin tool generates `.ts` config scaffold from uploaded GLB metadata | Fastest authoring; maintains code-based architecture | Generated code needs manual review; tool maintenance overhead |

**Selected: Option A** — Code-authored config referencing DB asset. Option C is the future enhancement (config generation CLI).

---

## 1. Executive Summary

This plan introduces a `gltf-asset` template type into SlateCamp's 3D Lab, enabling GLB/GLTF-backed modules to coexist alongside the 209 existing procedural modules. The implementation reconnects dormant metadata infrastructure (`models_3d` table, admin asset actions, `Workspace.tsx` patterns, `AssetPreloader`) with the modern ViewportShell architecture, while establishing Cloudflare R2 as the binary asset storage layer from Phase 1.

**Key deliverables:**
- New `gltf-asset` member in the `TemplateType` union and `ModuleConfig` discriminated union
- New `GltfAssetConfig` interface with model URL, node mapping, annotations, and camera config
- New `GltfAssetScene` renderer cannibalizing `DynamicModel` logic from `Workspace.tsx`
- DRACO decoder path consolidation and `/public/draco/` WASM file deployment
- Extended admin asset workflow connecting `models_3d` records to module registry
- Convention-based GLTF node naming with admin-authored override mapping
- Phased rollout: prerequisites -> types/router -> renderer -> admin workflow -> validation

**Key architectural recommendations:**
1. Binary assets go to Cloudflare R2 from Phase 1; Supabase Storage is legacy-only during migration
2. Metadata stays in Supabase Postgres (`models_3d` table) with structured JSONB fields (`storage_provider`, `bucket`, `object_key`, `asset_version`)
3. Cannibalize `Workspace.tsx` DynamicModel logic; retire `Workspace` after `gltf-asset` template is proven
4. `.glb` is the required runtime format (single binary, no loose texture references)
5. Code-authored config referencing DB asset records (Option A) for asset-to-module linking
6. Convention-based GLTF node naming (`SC_xray_*`, `SC_layer_*`, `SC_hotspot_*`) with fallback admin mapping
7. Initial GLTF modules support view + annotations + camera presets; X-ray/layers added in Phase 2
8. Introduce `gltf-asset` template now — all infrastructure prerequisites exist or are small fixes

---

## 2. Inputs and Source-of-Truth References

| Input | Location | Role |
|-------|----------|------|
| 3D Lab Feature Specification v4.2 | `.ai/docs/01-product/008-3d-lab-feature-specification.md` | Primary spec with GLB/GLTF readiness audit |
| Template type system | `src/features/3d-lab/types/templates.ts` | `TemplateType`, `ModuleConfig`, `ModuleRegistryEntry`, shell types |
| Template router | `src/features/3d-lab/components/LabViewport.tsx` (183 lines) | Routes `templateType` to renderer components |
| Content builder hook | `src/features/3d-lab/hooks/useTemplateContent.tsx` (336 lines) | Builds `ViewportShellContent` per template type |
| Legacy GLTF viewer | `src/components/3d/Workspace.tsx` (381 lines) | `DynamicModel`, X-ray traversal, `disposeObject`, DRACO CDN |
| Asset preloader | `src/features/3d-lab/components/rendering/AssetPreloader.tsx` (62 lines) | Suspense + `useProgress` overlay |
| Canvas host | `src/features/3d-lab/components/shell/LabViewportFrame.tsx` | R3F Canvas, DRACO local path, PerformanceMonitor |
| Admin asset actions | `src/lib/actions/admin/assets.ts` (261 lines) | CRUD for `models_3d`, upload to storage (currently Supabase, migrating to R2) |
| Admin asset UI | `src/components/admin/AssetUploader.tsx`, `AssetList.tsx`, `AssetDetailView.tsx` | Upload form, asset grid, detail view |
| Admin asset routes | `src/app/admin/assets/` | `/admin/assets` pages |
| Admin 3D models route | `src/app/admin/3d-models/` | Config registry browser (separate from asset management) |
| Database schema | `supabase/` migrations 004, 006, 007, 012, 20260324, 20260408 | `models_3d` table DDL |

---

## 3. Current-State Summary

### What Already Exists

| Component | Status | Location |
|-----------|--------|----------|
| `TemplateType` union (7 members) | Active | `types/templates.ts:25-32` |
| `ModuleConfig` discriminated union (7 members) | Active | `types/templates.ts` |
| `TEMPLATE_SHELL_DEFAULTS` (7 entries) | Active | `types/templates.ts:523` |
| `LabViewport` template router (7 cases + 3 legacy) | Active | `components/LabViewport.tsx:101-120` |
| `useTemplateContent` hook (6 template branches) | Active | `hooks/useTemplateContent.tsx` |
| `ViewportShell` slot-based layout | Active | `components/shell/ViewportShell.tsx` |
| 26 shell components (camera, toolbar, overlays, etc.) | Active | `components/shell/` |
| `AssetPreloader` + `AssetProgressOverlay` | Prepared, unused | `components/rendering/AssetPreloader.tsx` |
| `ModuleRegistryEntry.assets` field (`{ models?: string[]; textures?: string[] }`) | Prepared, unused | `types/templates.ts` |
| DRACO decoder config (shell: local `/draco/`) | Active, broken path | `shell/LabViewportFrame.tsx:12` |
| DRACO decoder config (legacy: Google CDN) | Active | `Workspace.tsx:93` |
| `Workspace.tsx` with `DynamicModel` (useGLTF + X-ray) | Legacy, active fallback | `src/components/3d/Workspace.tsx` |
| `models_3d` table with status lifecycle | Active | Supabase Postgres |
| `3d-models` storage bucket (public, 50MB limit) | Active (legacy — new uploads go to R2) | Supabase Storage |
| Admin asset CRUD actions | Active | `src/lib/actions/admin/assets.ts` |
| Admin asset UI (upload, list, detail) | Active | `src/components/admin/Asset*.tsx` |
| `disposeObject()` utility | Active | `src/lib/three-utils.ts` |
| `useDisposeOnUnmount` hook | Active | `src/components/r3f/useDisposeOnUnmount.ts` |
| `useWebGLMemoryMonitor` hook | Active | `src/components/r3f/useWebGLMemoryMonitor.ts` |

### What Is Missing

| Requirement | Status |
|-------------|--------|
| `'gltf-asset'` in `TemplateType` union | Missing |
| `GltfAssetConfig` interface | Missing |
| `TEMPLATE_SHELL_DEFAULTS['gltf-asset']` | Missing |
| `GltfAssetScene` renderer component | Missing |
| `useTemplateContent` branch for `gltf-asset` | Missing |
| `LabViewport` route for `gltf-asset` | Missing |
| `/public/draco/` WASM decoder files | **Missing — BLOCKER** |
| DRACO path consolidation (shell vs legacy conflict) | Missing |
| Asset-to-module linking convention | Missing (design decision) |
| GLTF node naming convention | Missing (design decision) |
| Module config authoring workflow for GLTF | Missing |
| Asset size budget enforcement | Missing |
| Thumbnail auto-generation | Missing |
| GLB structural validation on upload | Missing |

### What Needs Small Changes

| Component | Change Required |
|-----------|----------------|
| `TemplateType` union | Add `'gltf-asset'` (1 line) |
| `ModuleConfig` union | Add `GltfAssetConfig` member (1 line) |
| `TEMPLATE_SHELL_DEFAULTS` | Add `'gltf-asset'` entry (~20 lines) |
| `LabViewport` switch | Add `case 'gltf-asset'` with dynamic import (~8 lines) |
| `useTemplateContent` switch | Add `case 'gltf-asset'` branch (~40 lines) |
| `LabViewportFrame.tsx:12` | Change `/draco/` to Google CDN or add WASM files |
| `models_3d` table | Add columns to `metadata` JSONB (no schema migration needed) |

---

## 4. Target-State Architecture

### Conceptual Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Student Runtime                           │
│                                                             │
│  /dashboard/3d-lab/[moduleId]                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ModuleViewer                                         │   │
│  │  ├─ loadModuleConfig(moduleId)                      │   │
│  │  │   └─ import('config/modules/12-ph-heritage/      │   │
│  │  │          bahay-kubo-3d.ts')                       │   │
│  │  │          → GltfAssetConfig { modelUrl, ... }     │   │
│  │  │                                                   │   │
│  │  ├─ useTemplateContent(moduleId, config)             │   │
│  │  │   └─ case 'gltf-asset': returns                  │   │
│  │  │       canvasContent: <GltfAssetScene />           │   │
│  │  │       rightSidebarContent: <AnnotationPanel />    │   │
│  │  │                                                   │   │
│  │  └─ ViewportShell(shellContent)                      │   │
│  │      ├─ ViewportHeader                               │   │
│  │      ├─ ViewportSidebar (annotations/info)           │   │
│  │      ├─ LabViewportFrame                             │   │
│  │      │   └─ Canvas (frameloop="demand")              │   │
│  │      │       ├─ SceneConfig (camera, lights)         │   │
│  │      │       ├─ AssetPreloader                       │   │
│  │      │       │   └─ GltfAssetScene                   │   │
│  │      │       │       ├─ useGLTF(modelUrl)            │   │
│  │      │       │       ├─ scene traversal (X-ray)      │   │
│  │      │       │       └─ annotation anchors           │   │
│  │      │       └─ SceneGround                          │   │
│  │      ├─ SceneToolbar (Grid/Dims/X-ray/Layers/...)    │   │
│  │      ├─ CameraNavigationBar (15 presets)             │   │
│  │      └─ DOMOverlayLayer (annotations, violations)    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Admin Ingestion                           │
│                                                             │
│  /admin/assets                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AssetUploader                                        │   │
│  │  ├─ Upload .glb file → Cloudflare R2 (server-mediated)│   │
│  │  ├─ Create/update models_3d metadata in Supabase PG  │   │
│  │  │   (storage_provider, bucket, object_key, version)  │   │
│  │  ├─ Admin authors metadata (name, category, etc.)    │   │
│  │  ├─ Developer authors module config (.ts file)       │   │
│  │  │   (references asset by slug, not hardcoded URL)    │   │
│  │  ├─ models_3d.status → published                     │   │
│  │  └─ Module appears in registry → student lab         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### How `gltf-asset` Fits Into the Template System

The `gltf-asset` template is an **8th template type** alongside the existing 7. It participates in the same discriminated union, the same template router, the same shell defaults, and the same content builder hook. The only difference is that its renderer loads external geometry via `useGLTF` instead of building geometry from `GeometryInstruction[]` arrays.

### Coexistence of Procedural and GLTF Modules

- Procedural modules (209 existing): `geometry: (params) => GeometryInstruction[]` — code-defined geometry
- GLTF modules (new): `modelUrl: string` — externally authored geometry loaded via `useGLTF`
- Both types share: ViewportShell, camera presets, overlays, annotations, violations, parameters, presets
- Both types are registered in `ALL_MODULES` via `ModuleRegistryEntry` with the same fields

### Hybrid Modules

**Deferred to a future phase.** A hybrid module (GLTF base model + procedural annotation overlays or parametric additions) is architecturally possible but adds complexity to the renderer. The initial `gltf-asset` template assumes the GLB is the complete geometry. Hybrid support can be added later by composing `GltfAssetScene` with procedural mesh children.

---

## 5. Storage Architecture Decision Memo

### Current Reality

| Layer | Technology | Status |
|-------|-----------|--------|
| Binary assets (.glb files) | Supabase Storage, `3d-models` bucket, public, 50MB limit | Active (legacy) |
| Asset metadata | Supabase Postgres, `models_3d` table, JSONB `metadata` column | Active |
| Asset delivery | Supabase Storage public URLs (CDN-backed) | Active (legacy — to be superseded by R2) |

### Target Architecture: Supabase + Cloudflare R2 Hybrid

The decided storage architecture is a **Supabase + Cloudflare R2 hybrid** from Phase 1:

- **Supabase Postgres** — metadata and control plane (asset records, status lifecycle, structured fields, RLS, audit)
- **Cloudflare R2** — binary asset storage layer (`.glb` files, thumbnails)
- **Supabase Storage (`3d-models` bucket)** — legacy compatibility only; existing assets remain accessible during migration; not the target for new uploads

#### Why R2 From Phase 1 (Not Later)

| Factor | Supabase Storage | Cloudflare R2 |
|--------|-----------------|---------------|
| Egress cost | Bandwidth limits on free/Pro plans | **Zero egress fees** |
| Edge delivery | CDN-backed (Cloudflare under the hood) | **Native Cloudflare edge, <50ms globally** |
| Custom headers | Limited control | **Full control** over Cache-Control, Content-Encoding, CORS |
| File size limit | 50MB (bucket config) | **5GB per object** (no practical limit for GLBs) |
| Access control | Public buckets or Supabase auth | **Private by default**; signed URLs or Workers for controlled access |
| Cost | Included in plan up to limits | $0.015/GB stored, zero egress |
| Vendor flexibility | Locked to Supabase | **S3-compatible API** — portable |

Starting with R2 avoids a costly mid-stream migration. The Supabase Storage bucket has already been the interim solution; there is no reason to add new assets to a layer that will be migrated away.

#### Recommendation

**Cloudflare R2 is the binary asset layer from Phase 1.** All new `.glb` uploads go to R2. Existing assets in the Supabase `3d-models` bucket are migrated in Phase 4 (see Migration subsection below).

### Structured Asset Metadata Contract

The current `models_3d.url` column stores a single public URL string. This is too brittle for a multi-provider architecture. The `models_3d` table metadata should be extended to support structured storage references.

**Recommended `models_3d` metadata JSONB structure:**

```json
{
  "storage_provider": "r2",
  "bucket": "slatecamp-3d-assets",
  "object_key": "models/bahay-kubo/v1/bahay-kubo.glb",
  "asset_version": 1,
  "thumbnail_key": "thumbnails/bahay-kubo/v1/thumb.webp",
  "file_size_bytes": 4200000,
  "poly_count": null,
  "has_draco": true,
  "category": "PH_HERITAGE",
  "node_naming_version": "1.0",
  "module_config_path": "config/modules/12-ph-heritage/bahay-kubo-3d.ts"
}
```

The legacy `models_3d.url` column is retained for backward compatibility but is no longer the primary contract. A **URL resolver function** generates runtime URLs from the structured metadata:

```typescript
// src/lib/storage/asset-url-resolver.ts (NEW)

export type StorageProvider = 'r2' | 'supabase' | 'local'

interface AssetReference {
  storage_provider: StorageProvider
  bucket: string
  object_key: string
}

/**
 * Resolves an asset reference to a runtime URL.
 * For R2: generates a signed URL or public custom domain URL.
 * For Supabase: returns the legacy public URL.
 * For local: returns /public/ path (dev only).
 */
export const resolveAssetUrl = async (ref: AssetReference): Promise<string> => {
  switch (ref.storage_provider) {
    case 'r2':
      // Option A: Public R2 custom domain (if configured)
      // return `https://assets.slatecamp.com/${ref.object_key}`
      // Option B: Signed URL via server action
      return generateSignedR2Url(ref.bucket, ref.object_key)
    case 'supabase':
      // Legacy fallback
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${ref.bucket}/${ref.object_key}`
    case 'local':
      return `/${ref.object_key}`
  }
}
```

This resolver is called by the module loading path (in `useTemplateContent` or `GltfAssetScene`) to convert the DB-stored structured reference into a runtime-fetchable URL. The renderer never hardcodes storage URLs.

### What Lives Where

| Data | Location | Rationale |
|------|----------|-----------|
| `.glb` binary files | **Cloudflare R2** (`slatecamp-3d-assets` bucket) | Zero egress, edge delivery, private-by-default, S3-compatible |
| Asset metadata | **Supabase Postgres** (`models_3d` table) | Relational queries, RLS, audit trail, status lifecycle, structured JSONB |
| Module config | TypeScript `.ts` files in `config/modules/` | Type safety, version control, code review, IDE support |
| Thumbnails | **Cloudflare R2** (same bucket, `thumbnails/` prefix) | Co-located with assets, same delivery path |
| DRACO decoder WASM | `/public/draco/` (static, committed to repo) | Must be available at build time; <200KB total |
| Legacy assets | **Supabase Storage** (`3d-models` bucket) — read-only during migration | Backward compatibility; migrated to R2 in Phase 4 |

### Why `.glb` Is the Required Runtime Format

1. **Single binary** — no loose texture files to manage, no relative path resolution issues
2. **DRACO-compressible** — `.glb` supports DRACO mesh compression; `.gltf` with external `.bin` adds complexity
3. **Faster loading** — single HTTP request vs. multiple for `.gltf` + `.bin` + textures
4. **R2 compatibility** — single object upload, single signed URL or custom domain path
5. **`useGLTF` compatibility** — drei's `useGLTF` handles `.glb` natively with DRACO decoder
6. **SketchUp export** — SketchUp exports `.glb` directly via the glTF exporter extension

Loose `.gltf` bundles (`.gltf` + `.bin` + texture files) are **not supported** in this architecture. Authors must export or convert to `.glb` before upload. The admin upload UI should validate this.

### Delivery Mode: Private by Default (Mixed Strategy)

The 3D Lab is **auth-gated and tier-gated** — it requires login and `pro` tier access. Fully public binary delivery undercuts this product boundary. Premium educational models should not default to public.

**Delivery strategy:**

| Asset Type | Delivery | Rationale |
|-----------|----------|-----------|
| Premium module GLBs | **Private** — signed R2 URLs (1-hour expiry) generated server-side | Protects premium IP; URLs expire and cannot be shared |
| Demo/free-tier GLBs | **Public** — via R2 custom domain or public URL | No protection needed; good for marketing/SEO |
| Thumbnails | **Public** — via R2 custom domain | Needed for gallery browsing before auth check |

**Implementation:**

1. **Server action** `getAssetUrl(assetId: string)` — checks user auth + tier, looks up `models_3d` metadata, calls `resolveAssetUrl()` with signed URL generation for premium assets
2. **Signed URL generation** — uses Cloudflare R2 S3-compatible `GetObject` presigned URLs with 1-hour TTL
3. **`GltfAssetScene` receives resolved URL** — the renderer calls `useGLTF(resolvedUrl)` with the signed URL passed from the server via `useTemplateContent`
4. **Caching** — signed URLs include cache-friendly query params; browser caches the response for the TTL duration

**Fallback for development:** `storage_provider: 'local'` resolves to `/public/models/` for local dev without R2 credentials.

### Migration From Current State

The existing `3d-models` Supabase bucket and `models_3d` records require a migration path.

#### Phase 0-2: Dual-Read Compatibility

During Phases 0-2, the URL resolver supports both providers:
- New assets uploaded to R2 have `storage_provider: 'r2'` in metadata
- Existing assets remain in Supabase Storage with `storage_provider: 'supabase'` (or inferred from legacy `url` column)
- The resolver handles both transparently

#### Phase 4: Migration Script

A migration script (run once, idempotent) performs:

1. **Enumerate** all `models_3d` records where `metadata->>'storage_provider'` is null or `'supabase'`
2. **For each record:**
   a. Download `.glb` from Supabase Storage public URL
   b. Upload to R2 bucket with structured key: `models/{slug}/v1/{filename}.glb`
   c. Update `models_3d.metadata` with R2 structured fields (`storage_provider`, `bucket`, `object_key`, `asset_version`)
   d. Keep legacy `url` column intact (for rollback safety)
3. **Verify** all R2 objects are accessible via the resolver
4. **Mark** migration complete; legacy `url` column becomes read-only
5. **Decommission** Supabase `3d-models` bucket after 30-day observation period (or keep for non-3D assets if needed)

#### Whether Old Supabase-Hosted Models Remain Supported

**Yes, during transition.** The `resolveAssetUrl` function handles `storage_provider: 'supabase'` as a first-class path. After migration completes (Phase 4), all records will have `storage_provider: 'r2'`. The Supabase fallback path remains in code but is unused. It can be removed in a future cleanup pass.

#### Versioned Uploads

Assets are versioned via the `asset_version` field in metadata and the object key pattern:
- `models/{slug}/v1/model.glb` — version 1
- `models/{slug}/v2/model.glb` — version 2 (re-upload creates new version)

Admin cannot overwrite a published version. Replacing a binary creates a new version, and the module config references the latest published version. Previous versions remain in R2 for rollback.

---

## 6. Proposed `gltf-asset` Template Contract

### `TemplateType` Addition

```typescript
// src/features/3d-lab/types/templates.ts line 25
export type TemplateType =
  | 'parametric'
  | 'exploded'
  | 'floorplan'
  | 'cutaway'
  | 'animated'
  | 'calculator'
  | 'wall-configurator'
  | 'gltf-asset'              // NEW
```

### `GltfAssetConfig` Interface

```typescript
// src/features/3d-lab/types/templates.ts — NEW interface

export interface GltfAssetNodeMapping {
  /** Maps semantic roles to GLTF node name patterns.
   *  Roles: 'xray' (semi-transparent in X-ray mode),
   *         'layer:<name>' (toggleable layer group),
   *         'hotspot:<id>' (annotation anchor point),
   *         'interact:<id>' (clickable/hoverable target)
   */
  xray?: string[]               // Node names that become transparent in X-ray mode
  layers?: Record<string, string[]>  // Layer name → node names in that layer
  hotspots?: Record<string, string>  // Annotation ID → node name for anchor position
  interactions?: Record<string, string>  // Interaction ID → node name for click target
}

/**
 * GltfAnnotationDef — GLTF-specific annotation where position can be:
 * (a) a static Vector3Tuple (preferred for GLTF — JSON-serializable, future DB-authoring ready)
 * (b) a function (params) => Vector3Tuple (for parameter-dependent annotations)
 * (c) omitted entirely when nodeMapping.hotspots provides the anchor node
 */
export interface GltfAnnotationDef {
  id: string
  label: string
  description: string
  codeCitation?: string
  /** Static position OR dynamic function. Optional when nodeMapping.hotspots has this id. */
  position?: Vector3Tuple | ((params: Record<string, number | boolean | string>) => Vector3Tuple)
  visibleWhen?: (params: Record<string, number | boolean | string>) => boolean
}

export interface GltfAssetConfig {
  // ── Required fields (same as all templates) ──
  id: string
  title: string
  description: string
  subject: string

  // ── GLTF-specific required fields ──
  /** Runtime URL to the .glb file. Resolved at load time via resolveAssetUrl()
   *  from models_3d structured metadata (storage_provider + bucket + object_key).
   *  For code-authored configs, use the assetSlug field to reference the DB record
   *  rather than hardcoding a URL. The URL is resolved at runtime by the renderer. */
  modelUrl?: string

  // ── Optional interaction fields ──
  /** Interactive parameter controls (if the GLTF module has runtime-adjustable properties) */
  parameters?: ParameterDef[]
  /** Hotspot/label annotations — uses GltfAnnotationDef which allows static positions
   *  and optional position (when nodeMapping.hotspots provides the anchor). */
  annotations?: GltfAnnotationDef[]
  /** Building code violation rules */
  violations?: ViolationRule[]
  /** Named parameter presets */
  presets?: Preset[]

  // ── GLTF-specific optional fields ──
  /** Camera position and target for initial view */
  camera?: CameraConfig
  /** Uniform scale applied to the loaded model (default: 1) */
  scale?: number
  /** Initial rotation applied to the loaded model (default: [0, 0, 0]).
   *  Use [-Math.PI / 2, 0, 0] for Z-up sources (e.g., SketchUp exports). */
  rotation?: Vector3Tuple
  /** Center offset applied after loading (default: auto-center on bounding box) */
  centerOffset?: Vector3Tuple
  /** Node name mapping for X-ray, layers, hotspots, interactions */
  nodeMapping?: GltfAssetNodeMapping
  /** Whether to auto-center the model on its bounding box (default: true) */
  autoCenter?: boolean
  /** drei Environment preset for PBR materials (default: 'city').
   *  GLTF models with metallic-roughness PBR materials require environment maps
   *  for correct rendering. Set to null to disable. */
  environment?: 'city' | 'studio' | 'warehouse' | 'apartment' | 'forest' | 'sunset' | null

  // ── Standard research-driven fields ──
  contextScenario?: string
  leaQuestionCount?: number
  leaQuestionType?: string
  supportedPhases?: Array<'guided' | 'faded' | 'sandbox' | 'challenge'>
  hasChallengeMode?: boolean
  showHumanScale?: boolean

  // ── DB reference (optional — links to models_3d record) ──
  /** Slug matching models_3d.slug for admin asset tracking */
  assetSlug?: string
}

// NOTE: `autoScale` is DEFERRED to Phase 5. The target bounding sphere size
// is undefined and the explicit `scale` field covers the use case.
// When implemented, it will take `autoScale?: { targetSize: number }`.
```

### `ModuleConfig` Union Addition

```typescript
// src/features/3d-lab/types/templates.ts — add to the discriminated union
type ModuleConfig =
  | ({ templateType: 'parametric' } & ParametricSceneConfig)
  | ({ templateType: 'exploded' } & ExplodedAssemblyConfig)
  | ({ templateType: 'floorplan' } & FloorPlanConfig)
  | ({ templateType: 'cutaway' } & CutawaySectionConfig)
  | ({ templateType: 'animated' } & AnimatedSequenceConfig)
  | ({ templateType: 'calculator' } & CalculatorConfig)
  | ({ templateType: 'wall-configurator' } & ParametricSceneConfig)
  | ({ templateType: 'gltf-asset' } & GltfAssetConfig)  // NEW
```

### `TEMPLATE_SHELL_DEFAULTS` Entry

```typescript
// src/features/3d-lab/types/templates.ts — add to TEMPLATE_SHELL_DEFAULTS
'gltf-asset': {
  shell: {
    leftSidebar: false,                    // No controls sidebar by default (view-only)
    rightSidebar: { defaultCollapsed: false, width: 300, title: 'Info' },
    statusBar: false,
    mobileBottomSheetTabs: ['Info'],
  },
  capabilities: {
    cameraPresets: true,
    viewModes: ['perspective', 'isometric'] as ViewMode[],
    crossSection: false,                   // Deferred to Phase 2
    explodedView: false,                   // Not applicable to GLTF
    humanScale: true,
    focusMode: false,
    resetCamera: true,
    floatingToolbar: {
      position: 'top-left' as const,
      items: [
        { id: 'grid', icon: 'Grid3X3', label: 'Grid', shortcut: 'G', type: 'toggle' as const, storeBinding: 'gridVisible' },
        { id: 'xray', icon: 'Scan', label: 'X-Ray', shortcut: 'X', type: 'toggle' as const, storeBinding: 'xrayMode' },
        { id: 'layers', icon: 'Layers', label: 'Layers', shortcut: 'L', type: 'toggle' as const, storeBinding: 'layersPanelOpen' },
        { id: 'screenshot', icon: 'Camera', label: 'Screenshot', shortcut: 'P', type: 'action' as const },
        { id: 'fullscreen', icon: 'Maximize', label: 'Fullscreen', shortcut: 'F', type: 'action' as const },
      ],
    },
    cameraPresetBar: true,
    compassRose: false,
  },
}
```

### Example Module Config

```typescript
// src/features/3d-lab/config/modules/12-ph-heritage/bahay-kubo-3d.ts
import type { GltfAssetConfig } from '@/features/3d-lab/types/templates'

export const bahayKubo3d: GltfAssetConfig = {
  id: 'bahay-kubo-3d',
  title: 'Bahay Kubo — Traditional Filipino House',
  description: 'Explore the structural components of the traditional Filipino stilt house...',
  subject: 'Philippine Heritage Architecture',
  // modelUrl is resolved at runtime via resolveAssetUrl() from models_3d metadata.
  // Do NOT hardcode storage URLs here. The assetSlug links to the DB record.
  assetSlug: 'bahay-kubo',  // matches models_3d.slug → resolver generates runtime URL
  camera: { position: [5, 3, 5], target: [0, 1.5, 0], fov: 35 },
  scale: 1,
  rotation: [-Math.PI / 2, 0, 0],  // SketchUp Z-up → Three.js Y-up
  autoCenter: true,
  environment: 'city',              // PBR materials need environment map
  nodeMapping: {
    xray: ['SC_xray_Roof', 'SC_xray_ExteriorWalls'],
    layers: {
      // camelCase layer names + __ delimiter for parts
      'RoofStructure': ['SC_layer_RoofStructure__frame', 'SC_layer_RoofStructure__thatch'],
      'WallPanels': ['SC_layer_WallPanels__sawali'],
      'FloorAndStilts': ['SC_layer_FloorAndStilts__floor', 'SC_layer_FloorAndStilts__stilts'],
    },
    hotspots: {
      'haligi': 'SC_hotspot_haligi',
      'sahig': 'SC_hotspot_sahig',
    },
  },
  annotations: [
    {
      id: 'haligi',
      label: 'Haligi (Post)',
      description: 'The main structural posts, typically made of molave or yakal hardwood...',
      // Static Vector3Tuple — no function wrapper needed (GltfAnnotationDef)
      position: [0.8, 0.5, 0],
    },
    {
      id: 'sahig',
      label: 'Sahig (Floor)',
      description: 'Split bamboo flooring raised above ground for ventilation...',
      // position omitted — will use SC_hotspot_sahig node position from nodeMapping
    },
  ],
  contextScenario: 'You are documenting a heritage bahay kubo for the NHCP...',
  leaQuestionCount: 3,
  leaQuestionType: 'visual identification',
  supportedPhases: ['guided', 'sandbox'],
}
```

### What Remains Code-Authored vs. Inferred From GLB

| Aspect | Code-authored (in `.ts` config) | Inferred from GLB asset |
|--------|--------------------------------|------------------------|
| Module metadata (id, title, description, subject) | Yes | No |
| Model reference | Yes (`assetSlug` referencing `models_3d.slug` — URL resolved at runtime) | No |
| Camera position/target | Yes | No (could auto-compute from bounding box) |
| Annotations (positions, text, citations) | Yes | Partially (if using `SC_hotspot_*` node names) |
| Violations (check functions, code citations) | Yes | No |
| Parameters (sliders, toggles) | Yes | No |
| Node mapping (X-ray, layers) | Yes (or inferred from naming convention) | Partially (convention-based) |
| Scale / center | Optional (auto-center/auto-scale available) | Yes (bounding box) |
| Geometry | No — loaded from GLB | Yes |
| Textures / materials | No — embedded in GLB | Yes |

---

## 7. Renderer and Shell Integration Plan

### `GltfAssetScene` Renderer

**New file:** `src/features/3d-lab/templates/GltfAssetScene.tsx`

This is the core new component. It replaces the legacy `DynamicModel` from `Workspace.tsx` with a modern implementation integrated into the shell architecture.

#### Loading Flow

```
GltfAssetScene mount
  → useGLTF(config.modelUrl) [suspends, triggers AssetPreloader progress]
  → scene received
  → auto-center on bounding box (if config.autoCenter !== false)
  → apply config.scale
  → traverse scene graph:
      → build node name index (Map<string, THREE.Object3D>)
      → identify X-ray targets from config.nodeMapping.xray
      → identify layer groups from config.nodeMapping.layers
      → identify hotspot anchor nodes from config.nodeMapping.hotspots
  → register overlay items (annotations → useOverlayStore)
  → render <primitive object={scene} />
  → useEffect cleanup: disposeObject(scene)
```

#### What to Cannibalize From `Workspace.tsx`

| Logic | Source | Target | Changes |
|-------|--------|--------|---------|
| `useGLTF(url)` loading | `Workspace.tsx:100` | `GltfAssetScene.tsx` | Same pattern, different component context |
| X-ray material traversal | `Workspace.tsx:104-114` | `GltfAssetScene.tsx` | Generalize: read node names from `config.nodeMapping.xray` instead of hardcoded `'envelope'`/`'finish'` |
| `disposeObject(scene)` cleanup | `Workspace.tsx:118-120` | `GltfAssetScene.tsx` | Same pattern |
| DRACO decoder path | `Workspace.tsx:93` | Consolidated in `LabViewportFrame.tsx` | Single path, not per-component |

#### Material Mutation / X-Ray Strategy

```typescript
// Inside GltfAssetScene — material state snapshot + X-ray toggle

// Snapshot original material state on first scene load (run once after load).
// This prevents the destructive mutation bug where setting transparent=true
// permanently alters render order even after X-ray is toggled off.
const originalMaterialState = useRef<Map<THREE.Material, { transparent: boolean; opacity: number }>>(new Map())

useEffect(() => {
  if (!scene) return
  const stateMap = new Map<THREE.Material, { transparent: boolean; opacity: number }>()
  scene.traverse((child: THREE.Object3D) => {
    if (!(child as THREE.Mesh).isMesh) return
    const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
    if (mat && !stateMap.has(mat)) {
      stateMap.set(mat, { transparent: mat.transparent, opacity: mat.opacity })
    }
  })
  originalMaterialState.current = stateMap
}, [scene])

// Apply/restore X-ray mode
useEffect(() => {
  if (!scene || !nodeMapping?.xray) return
  const xrayNodes = new Set(nodeMapping.xray)

  scene.traverse((child: THREE.Object3D) => {
    if (!(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh
    if (!mesh.material) return

    const isXrayTarget = xrayNodes.has(mesh.name) ||
      xrayNodes.has(mesh.parent?.name ?? '')

    if (isXrayTarget) {
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (xrayMode) {
        // Apply X-ray: force transparent + low opacity
        mat.transparent = true
        mat.opacity = 0.15
      } else {
        // Restore original state from snapshot
        const original = originalMaterialState.current.get(mat)
        if (original) {
          mat.transparent = original.transparent
          mat.opacity = original.opacity
        }
      }
      mat.needsUpdate = true
    }
  })
  invalidate()
}, [scene, xrayMode, nodeMapping, invalidate])
```

**Why snapshot/restore:** The legacy `Workspace.tsx:104-114` has a known bug where setting `mat.transparent = true` permanently alters Three.js render order. When X-ray is toggled off, opacity returns to 1.0 but `transparent` remains `true`, causing z-fighting on originally-opaque materials. The snapshot approach stores original `{transparent, opacity}` per material on first traversal and restores them cleanly on toggle-off.

#### Selection / Layers Strategy

**CRITICAL DESIGN DECISION: Where does per-layer hide/show state live?**

The existing `useViewportShellStore` has `layersPanelOpen: boolean` (controls panel visibility) and `xrayMode: boolean` (global toggle), but **no per-layer hide/show state** (`hiddenLayers` does not exist in the codebase). The existing `LayersPanel` at `src/features/3d-lab/components/shell/LayersPanel.tsx` only toggles three global booleans (grid, dimensions, xray) and accepts module-specific layers via a `children` prop.

**Decision: Per-layer state lives in the per-module store via `createModuleStore`.**

Rationale:
- Layer definitions are per-module (each GLTF module has different layers)
- `createModuleStore` already handles per-module defaults and resets on unmount
- Keeps `useViewportShellStore` template-agnostic (no module-specific state)
- Consistent with how parametric parameters are stored (in `createModuleStore`, not shell store)

**Required store changes:**

```typescript
// In createModuleStore factory — add to ModuleStoreState:
hiddenLayers: Set<string>        // Layer names currently hidden
toggleLayer: (name: string) => void   // Toggle a layer's visibility
showAllLayers: () => void        // Reset all layers to visible

// Implementation in createModuleStore:
hiddenLayers: new Set<string>(),
toggleLayer: (name) => set((state) => {
  const next = new Set(state.hiddenLayers)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  state.invalidateFn?.()
  return { hiddenLayers: next }
}),
showAllLayers: () => set((state) => {
  state.invalidateFn?.()
  return { hiddenLayers: new Set<string>() }
}),
```

**Required LayersPanel integration:**

The `useTemplateContent` hook's `gltf-asset` branch must pass a `GltfLayersList` component as children to `LayersPanel`. This component reads `config.nodeMapping.layers` and renders per-layer toggle buttons wired to `moduleStore.toggleLayer()`.

```tsx
// New component: src/features/3d-lab/templates/GltfLayersList.tsx (~40 lines)
// Rendered inside LayersPanel children slot by useTemplateContent

const GltfLayersList = ({ layers, moduleStore }: {
  layers: Record<string, string[]>
  moduleStore: StoreApi<ModuleStoreState>
}) => {
  const hiddenLayers = useStore(moduleStore, (s) => s.hiddenLayers)
  const toggleLayer = useStore(moduleStore, (s) => s.toggleLayer)

  return (
    <>
      {Object.keys(layers).map((layerName) => (
        <button
          key={layerName}
          onClick={() => toggleLayer(layerName)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm w-full',
            hiddenLayers.has(layerName) ? 'opacity-50' : 'opacity-100'
          )}
        >
          <Eye size={14} className={hiddenLayers.has(layerName) ? 'text-muted-foreground' : 'text-foreground'} />
          {layerName}
        </button>
      ))}
    </>
  )
}
```

**Layer visibility effect in GltfAssetScene:**

```typescript
// Layer visibility — driven by moduleStore.hiddenLayers + config.nodeMapping.layers
const hiddenLayers = useStore(moduleStore, (s) => s.hiddenLayers)

useEffect(() => {
  if (!scene || !nodeMapping?.layers) return
  for (const [layerName, nodeNames] of Object.entries(nodeMapping.layers)) {
    const isVisible = !hiddenLayers.has(layerName)
    for (const nodeName of nodeNames) {
      const node = nodeIndex.get(nodeName)
      if (node) node.visible = isVisible
    }
  }
  invalidate()
}, [scene, hiddenLayers, nodeMapping, invalidate])
```

#### Annotation Anchor Strategy

For annotations, two anchor strategies:

1. **Config-authored positions** (default): `AnnotationDef.position` returns a `Vector3Tuple`. Works exactly like procedural modules. Annotations are registered in `useOverlayStore` and projected by `DOMOverlayLayer`.

2. **Node-anchored positions** (convention-based): If `config.nodeMapping.hotspots` maps an annotation ID to a GLTF node name, the renderer reads the node's world position and uses it as the annotation anchor. This overrides the config-authored position.

```typescript
// Node-anchored annotation positions
const getAnnotationPosition = (annotationId: string): Vector3Tuple => {
  const nodeName = nodeMapping?.hotspots?.[annotationId]
  if (nodeName) {
    const node = nodeIndex.get(nodeName)
    if (node) {
      const worldPos = new THREE.Vector3()
      node.getWorldPosition(worldPos)
      return [worldPos.x, worldPos.y, worldPos.z]
    }
  }
  // Fallback to config-authored position
  const annotation = config.annotations?.find(a => a.id === annotationId)
  return annotation?.position({}) ?? [0, 0, 0]
}
```

#### Handling Missing/Malformed Assets

| Failure | Detection | Response |
|---------|-----------|----------|
| GLB fails to load (404, network) | `useGLTF` throws → caught by `AssetPreloader` Suspense → falls through to `SceneErrorBoundary` | Show error state with "Model unavailable" message and retry button |
| GLB loads but has 0 meshes | Post-load scene traversal finds no meshes | Show warning toast via `ViewportToast`: "Model appears empty" |
| Node names in `nodeMapping` don't match GLB | Post-load node index lookup fails | Log warning in dev; silently skip unmatched mappings in production; show dev-mode toast |
| GLB exceeds size budget | Not enforced at runtime (handled at upload) | Admin upload validates file size |
| DRACO decoder fails | `useGLTF` throws DRACO error | `SceneErrorBoundary` catches; show "Decoder error" with instructions |

#### Integration Points

| Shell Component | Integration Method |
|----------------|-------------------|
| `SceneToolbar` X-ray toggle | Reads `xrayMode` from `useViewportShellStore` → `GltfAssetScene` applies material opacity |
| `SceneToolbar` Grid toggle | `SceneGround` handles independently (already works) |
| `SceneToolbar` Layers toggle | `LayersPanel` reads layer definitions from `GltfAssetConfig.nodeMapping.layers` |
| `CameraNavigationBar` | Works automatically via `useCameraSnap` (no changes needed) |
| `DOMOverlayLayer` | `GltfAssetScene` registers annotations in `useOverlayStore` (same as procedural templates) |
| `AssetPreloader` | `GltfAssetScene` is wrapped in `<AssetPreloader>` inside `useTemplateContent` |
| `WebGLErrorBoundary` | Already wraps the Canvas in `LabViewportFrame` (no changes needed) |
| `useDisposeOnUnmount` | Called in `GltfAssetScene` cleanup effect |
| `PerformanceMonitor` | Already in `LabViewportFrame` (no changes needed) |

#### `AssetPreloader` Usage

No refactoring needed. `AssetPreloader` is used as-is:

```tsx
// In useTemplateContent, gltf-asset branch:
canvasContent: (
  <CanvasWrapper>
    <SceneConfig cameraPosition={config.camera?.position} cameraFov={config.camera?.fov} />
    <AssetPreloader>
      <GltfAssetScene config={config} moduleStore={moduleStore} />
    </AssetPreloader>
    <SceneGround />
  </CanvasWrapper>
)
```

`AssetProgressOverlay` is placed in the DOM layer (already handled by `LabViewportFrame`'s existing structure, but may need adding — see Phase 2 deliverables).

---

## 8. Admin Ingestion and Asset Lifecycle Plan

### Current Admin Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/admin/assets` | Upload GLB/GLTF, manage `models_3d` records | Active |
| `/admin/assets/[id]` | View/edit single asset detail | Active |
| `/admin/3d-models` | Browse 209-module config registry | Active (separate system) |

### End-to-End Ingestion Flow

```
1. Admin navigates to /admin/assets
2. Admin uploads .glb file via AssetUploader
   → Server action receives file
   → Server generates object key: `models/{slug}/v{version}/{filename}.glb`
   → Server uploads to Cloudflare R2 via S3-compatible API
   → Server returns structured reference (provider, bucket, object_key)
3. Admin fills metadata form:
   - name: "Bahay Kubo"
   - slug: "bahay-kubo"
   - thumbnail: (optional upload → R2 `thumbnails/` prefix, or URL)
   - metadata: { category: "PH_HERITAGE", node_naming_version: "1.0" }
4. Admin saves → createAsset() → models_3d record with structured metadata (status: 'draft')
   - storage_provider: 'r2'
   - bucket: 'slatecamp-3d-assets'
   - object_key: 'models/bahay-kubo/v1/bahay-kubo.glb'
   - asset_version: 1
5. Developer (or future CLI tool) authors module config:
   - Creates src/features/3d-lab/config/modules/12-ph-heritage/bahay-kubo-3d.ts
   - References asset by `assetSlug: 'bahay-kubo'` (NOT a hardcoded URL)
   - Authors annotations, camera, nodeMapping
6. Developer adds registry entry:
   - Adds to cat-12.ts: { id: 'bahay-kubo-3d', templateType: 'gltf-asset', ... }
7. Admin reviews module in /admin/3d-models (config browser)
8. Admin updates models_3d.status → 'published'
9. Developer adds module ID to DASHBOARD_VISIBLE_IDS (or opens visibility)
10. Student opens module → renderer resolves runtime URL via resolveAssetUrl()
    → For premium: signed R2 URL (1h TTL)
    → For demo: public R2 custom domain URL
11. Student sees module in /dashboard/3d-lab

**Upload details:**
- **Server-mediated upload** — admin uploads to Next.js server action, which forwards to R2 (prevents R2 credentials from reaching client)
- **Object key generation** — server generates deterministic key from slug + version: `models/{slug}/v{n}/{filename}.glb`
- **Versioning** — replacing a binary creates `v{n+1}` key; previous versions remain in R2 for rollback
- **Admin cannot overwrite** a published version; must create new version
- **Thumbnails** — uploaded to same R2 bucket under `thumbnails/{slug}/v{n}/thumb.webp`; served publicly via R2 custom domain (thumbnails are always public for gallery browsing)
```

### Status Lifecycle

```
draft → pending_review → published → archived
  ↑                          │
  └──────────────────────────┘ (re-draft for updates)
```

| Status | Meaning | Student Visibility |
|--------|---------|-------------------|
| `draft` | Uploaded but not reviewed | Not visible |
| `pending_review` | Ready for admin/SME review | Not visible |
| `published` | Approved for student use | Visible (if in registry + DASHBOARD_VISIBLE_IDS) |
| `archived` | Removed from active use | Not visible |

### Thumbnail Handling

**Phase 1 (manual):** Admin uploads a thumbnail image alongside the GLB, or provides a URL. The `createAsset` action already supports a `thumbnail` field.

**Future enhancement:** Server-side thumbnail generation using headless Three.js (e.g., `three-stdlib` + `node-canvas`) or a Vercel Function that renders a GLB to a PNG. This is **not in scope** for the initial implementation.

### Asset Validation Requirements

**On upload (Phase 1 — client-side):**
- File extension must be `.glb` (reject `.gltf`, `.obj`, `.fbx`, etc.)
- File size must be ≤ 25MB (tighter than the 50MB bucket limit, to leave room for DRACO overhead)
- MIME type must be `model/gltf-binary` or `application/octet-stream`

**Future (Phase 4 — server-side):**
- Parse GLB header to verify valid glTF container
- Extract polygon count, texture sizes, node names
- Reject if polygon count > 500K or total texture size > 20MB
- Auto-populate `metadata.nodeNames` for the admin config authoring workflow

### Module Config Authoring Workflow

**Phase 1 (code-authored):** Developers hand-author `.ts` config files, referencing the `models_3d` record by `assetSlug`. The runtime URL is resolved via `resolveAssetUrl()` from the DB record's structured metadata. This is consistent with how all 209 existing modules are authored (code-driven configs).

**Future (config generation CLI):**
```bash
bun run gen-gltf-module --slug bahay-kubo --category PH_HERITAGE
```
This would:
1. Look up `models_3d` record by slug
2. Download GLB, parse scene graph
3. Extract node names, bounding box, materials
4. Generate a scaffold `.ts` config file with:
   - `modelUrl` from DB
   - `nodeMapping` pre-populated from `SC_*` prefixed nodes
   - `camera` positioned based on bounding box
   - Empty `annotations` and `violations` arrays for manual authoring

---

## 9. Asset-to-Module Linking Recommendation

### Recommended Approach: Code-Authored Config Referencing DB Asset (Option A)

The module config `.ts` file is the source of truth for the module's behavior (camera, annotations, violations, node mapping). The `models_3d` DB record is the source of truth for the asset's lifecycle (status, URL, metadata, review state).

The link between them is the `assetSlug` field in `GltfAssetConfig`, which matches `models_3d.slug` in Supabase Postgres. At runtime, the renderer looks up the `models_3d` record by slug, reads the structured metadata (`storage_provider`, `bucket`, `object_key`), and calls `resolveAssetUrl()` to generate the runtime URL (signed R2 URL for premium, public for demo). No hardcoded storage URLs exist in config files.

**Why this is best:**

1. **Type safety** — Config is TypeScript. All fields are typed. IDE autocomplete works. Build fails on type errors.
2. **Version control** — Config files are committed to git. Changes are reviewed in PRs. History is preserved.
3. **Consistency** — All 209 existing modules are code-authored configs. The 8th template follows the same pattern.
4. **Reviewability** — Annotations, violations, and node mappings are visible in code review. No hidden DB-only config.
5. **Separation of concerns** — Admin manages the asset lifecycle (upload, review, publish). Developer manages the pedagogical config (annotations, violations, camera).

**Trade-off acknowledged:** Every GLTF module requires a developer to author a config file. This is mitigated by:
- Config files are small (~50-100 lines for a typical view-only module)
- Future config generation CLI reduces boilerplate
- The alternative (DB-authored config) loses type safety and review

**Reconsideration threshold:** If GLTF module count exceeds 50 and content-author friction is blocking growth, revisit DB-authored config with runtime Zod validation of `models_3d.metadata` JSONB. The `GltfAssetConfig` interface is deliberately designed with JSON-serializable fields where possible (static `Vector3Tuple` positions via `GltfAnnotationDef` instead of function-type `AnnotationDef`) to keep this future migration path open.

### Registry Entry

Each GLTF module gets a standard `ModuleRegistryEntry` in the appropriate `cat-*.ts` file:

```typescript
// src/features/3d-lab/config/registry/cat-12.ts
{
  id: 'bahay-kubo-3d',
  title: 'Bahay Kubo — Traditional Filipino House',
  templateType: 'gltf-asset',
  subject: 'Philippine Heritage Architecture',
  categoryId: 'PH_HERITAGE',
  launchPhase: 2,
  status: 'ready',
  description: 'Explore the structural components...',
  assets: { models: ['https://...supabase.co/.../bahay-kubo.glb'] },
}
```

The `assets.models[]` field (already typed, currently unused) is populated with the `assetSlug` value (not a raw URL). At preload time, the slug is resolved to a runtime URL via `resolveAssetUrl()`. This enables future preloading via `useGLTF.preload(resolvedUrl)`.

---

## 10. GLTF Node Naming / Mapping Recommendation

### Recommended Approach: Convention-Based Naming With Admin Override

#### Convention: `SC_` Prefix System

All SlateCamp-meaningful nodes in a GLB file should use the `SC_` prefix (SlateCamp namespace) to avoid collisions with SketchUp/Blender default names.

| Prefix | Purpose | Example |
|--------|---------|---------|
| `SC_xray_<name>` | Node becomes semi-transparent in X-ray mode | `SC_xray_Roof`, `SC_xray_ExteriorWalls` |
| `SC_layer_<LayerName>__<part>` | Node belongs to a toggleable layer group. **Double underscore `__` separates layer name from part name.** Layer names use camelCase. | `SC_layer_RoofStructure__frame`, `SC_layer_RoofStructure__thatch`, `SC_layer_ExteriorWalls__panels` |
| `SC_hotspot_<annotationId>` | Node's world position anchors an annotation | `SC_hotspot_haligi`, `SC_hotspot_sahig` |
| `SC_interact_<interactionId>` | Node is a click/hover target | `SC_interact_door`, `SC_interact_window` |
| `SC_hide` | Node is hidden by default (construction geometry, helpers) | `SC_hide_wireframe` |

**Naming convention rationale:** The `__` (double underscore) delimiter between layer name and part name eliminates the parsing ambiguity identified during review. Single underscores within layer names are prohibited — use camelCase instead. This ensures `SC_layer_RoofStructure__frame` unambiguously parses to layer `RoofStructure`, part `frame`.

#### How the Renderer Uses Convention Names

On GLB load, `GltfAssetScene` traverses the scene graph and builds a node index:

```typescript
const nodeIndex = new Map<string, THREE.Object3D>()
const autoXray: string[] = []
const autoLayers: Record<string, string[]> = {}

scene.traverse((child) => {
  nodeIndex.set(child.name, child)

  if (child.name.startsWith('SC_xray_')) {
    autoXray.push(child.name)
  }
  if (child.name.startsWith('SC_layer_')) {
    // Convention: SC_layer_<LayerName>__<partName>
    // Double underscore (__) separates layer name from part name.
    // Layer names use camelCase (no single underscores allowed).
    const afterPrefix = child.name.slice('SC_layer_'.length) // 'RoofStructure__frame'
    const layerName = afterPrefix.split('__')[0] // 'RoofStructure'
    if (layerName) {
      if (!autoLayers[layerName]) autoLayers[layerName] = []
      autoLayers[layerName].push(child.name)
    }
  }
  if (child.name === 'SC_hide' || child.name.startsWith('SC_hide_')) {
    child.visible = false
  }
})
```

Convention-discovered nodes are **merged with** (not replaced by) `config.nodeMapping`. The config always wins in case of conflict.

#### Admin Override: `nodeMapping` in Config

For GLB files that don't follow the `SC_` convention (e.g., imported from third-party sources), the module config's `nodeMapping` field provides explicit mapping:

```typescript
nodeMapping: {
  xray: ['Group_roof', 'Group_exterior'],  // Non-convention names
  layers: {
    'Roof': ['Group_roof_frame', 'Group_roof_tiles'],
    'Walls': ['Group_walls'],
  },
}
```

#### SketchUp Export Conventions

SketchUp exports groups/components as named nodes in GLTF. The recommended authoring workflow:

1. In SketchUp, name groups with `SC_` prefixes: `SC_xray_roof`, `SC_layer_roof_frame`, etc.
2. Export as `.glb` using the glTF exporter
3. Node names are preserved in the GLTF scene graph
4. The renderer auto-discovers `SC_*` nodes

**SketchUp-specific guidance (to be documented in an authoring guide):**
- Use Groups (not Components) for top-level scene organization
- Name groups explicitly — SketchUp's default `Group#1` names are useless
- Avoid deeply nested group hierarchies (flatten where possible)
- Use `SC_` prefix for all SlateCamp-meaningful groups
- Keep total geometry under 200K polygons (SketchUp can easily produce bloated meshes)

#### Handling Malformed/Inconsistent Naming

| Scenario | Behavior |
|----------|----------|
| GLB has no `SC_*` nodes and no `nodeMapping` in config | Module works as view-only. X-ray, layers, hotspots are unavailable. Camera orbit and annotations (if config-authored) still work. |
| GLB has `SC_*` nodes but config also has `nodeMapping` | Config `nodeMapping` wins. Convention-discovered nodes are supplementary. |
| `nodeMapping` references a node name that doesn't exist in GLB | Silently skip in production. Log warning in development. |
| Multiple nodes share the same name | `scene.traverse` visits all; `nodeIndex` stores last-found. Recommend unique names in authoring guide. |

---

## 11. Performance, Loading, and Failure-Handling Plan

### GLB Size Budgets

| Category | Max Size | Rationale |
|----------|----------|-----------|
| Desktop | 25 MB | Comfortable on broadband; DRACO can compress 5-10x |
| Mobile | 10 MB | 3G/4G constraints; memory pressure on mobile WebGL |
| Recommended target | 5 MB (DRACO-compressed) | Fast load even on slow connections |
| Upload limit (admin) | 25 MB | Enforced in `AssetUploader` client-side validation |

### DRACO Strategy

**Resolution of the DRACO blocker:**

1. **Copy decoder files** from `node_modules/three/examples/jsm/libs/draco/gltf/` to `/public/draco/`
2. Files needed: `draco_decoder.wasm`, `draco_wasm_wrapper.js`, `draco_decoder.js`
3. Total size: ~190KB (one-time, committed to repo)
4. **Remove the CDN path** from `Workspace.tsx:93` — all GLTF loading uses the local path
5. **Single `setDecoderPath` call** in `LabViewportFrame.tsx:12` (already exists, just needs the files)

**Why local over CDN:**
- No external dependency at runtime
- Works offline (service worker cacheable)
- No CORS issues
- Consistent behavior across environments

### Texture Budgets

| Constraint | Limit |
|-----------|-------|
| Max texture dimensions | 2048x2048 (mobile), 4096x4096 (desktop) |
| Max total texture memory | 64MB (estimated from typical mobile GPU limits) |
| Preferred format | Embedded in GLB (PNG or JPEG compressed) |
| KTX2/Basis | Not required for Phase 1; evaluate if texture-heavy models appear |

### Memory Disposal

```typescript
// GltfAssetScene cleanup — runs on unmount or URL change
useEffect(() => {
  return () => {
    if (scene) {
      disposeObject(scene)  // from src/lib/three-utils.ts
      useGLTF.clear(config.modelUrl)  // clear drei's internal cache
    }
  }
}, [scene, config.modelUrl])
```

`disposeObject` (already exists in `src/lib/three-utils.ts`, used by `Workspace.tsx`) traverses the scene graph and disposes all geometries, materials, and textures.

### Mobile Fallback Behavior

| Condition | Response |
|-----------|----------|
| GLB > 10MB on mobile | Show warning toast: "Large model — loading may be slow" |
| WebGL context lost on mobile | `WebGLRecovery` component handles (already implemented) |
| DPR degrades to 1.0 | `PerformanceMonitor` handles automatically |
| Touch interaction | OrbitControls touch support (already works) |
| Bottom sheet instead of sidebar | `ViewportBottomSheet` handles (already works) |

### Cache / Preload Strategy

- **drei internal cache:** `useGLTF` caches loaded GLTFs by URL. Navigating back to the same module reuses the cached scene graph.
- **Preloading:** For modules listed in `DASHBOARD_VISIBLE_IDS` that have `assets.models[]` populated, call `useGLTF.preload(url)` in the lab browser component. **Call site:** `src/features/3d-lab/components/LabBrowser.tsx` — add a `useEffect` on mount that iterates `DASHBOARD_VISIBLE_IDS`, looks up each module's `assets.models[]` via `getModuleById`, and calls `useGLTF.preload(url)` for each GLB URL. This preloads visible GLTF modules while the user browses the gallery, before they click into a specific module.
- **HTTP caching:** R2 objects are served with configurable `Cache-Control` headers via custom domain or Worker. Set `max-age=604800` (1 week) for published GLBs. Signed URLs include cache-friendly query params so browsers cache the response for the TTL duration. For legacy Supabase-hosted assets during migration, Supabase Storage's default cache headers apply.
- **No custom cache layer needed** for Phase 1.

### Lazy Loading

`GltfAssetScene` is loaded via `next/dynamic` with `ssr: false` (same pattern as all other template renderers). The GLB file is fetched only when the module is opened.

### Handling Slow / Failed Asset Loads

| Scenario | Detection | UX |
|----------|-----------|-----|
| Slow load (>3s) | `useProgress` active, progress < 100 | `AssetProgressOverlay` shows progress bar |
| Network error | `useGLTF` throws | `SceneErrorBoundary` shows error with retry button |
| 404 (asset deleted) | `useGLTF` throws 404 | Error state: "Model not found. Contact admin." |
| DRACO decode failure | `useGLTF` throws decoder error | Error state: "Failed to decode model." |
| Timeout (>30s) | Custom timeout wrapper | Abort and show timeout message |

### Interaction With `frameloop="demand"`

GLTF models are static geometry — they don't animate continuously. This is a **perfect fit** for `frameloop="demand"`:

- Initial render after load: `invalidate()` called once
- X-ray mode change: `invalidate()` called in the material mutation effect
- Layer visibility change: `invalidate()` called in the layer toggle effect
- Camera movement: OrbitControls calls `invalidate()` automatically
- No `useFrame` loop needed (unlike animated procedural modules)

GLTF modules will actually be **more battery-efficient** than procedural modules that use `useAnimationComplete`.

---

## 12. File-Level Implementation Targets

### Files to Modify

| File | Change | Phase |
|------|--------|-------|
| `src/features/3d-lab/types/templates.ts` | Add `'gltf-asset'` to `TemplateType`, add `GltfAssetConfig` interface, add `GltfAssetNodeMapping` interface, add union member to `ModuleConfig`, add `TEMPLATE_SHELL_DEFAULTS['gltf-asset']` entry | 1 |
| `src/features/3d-lab/components/LabViewport.tsx` | Add dynamic import for `GltfAssetTemplate`, add `case 'gltf-asset'` to `TemplateModuleWrapper` switch | 1 |
| `src/features/3d-lab/hooks/useTemplateContent.tsx` | Add `case 'gltf-asset'` branch returning `GltfAssetScene` in canvas, info panel in right sidebar | 2 |
| `src/features/3d-lab/components/shell/LabViewportFrame.tsx` | Verify DRACO path; no code change if `/public/draco/` files are added | 0 |
| `src/components/3d/Workspace.tsx:93` | Remove `useGLTF.setDecoderPath(CDN)` — consolidated in `LabViewportFrame` | 0 |
| `src/lib/actions/admin/assets.ts` | Refactor upload to target R2 via S3-compatible API; add structured metadata fields; add `getAssetUrl()` server action for signed URL generation; add `updateAssetStatus()` and `updateAssetMetadata()` actions | 1-3 |
| `src/components/admin/AssetUploader.tsx` | Add `.glb`-only file filter, size limit (25MB), validation messaging | 3 |
| `src/components/admin/AssetDetailView.tsx` | Show node names extracted from metadata, link to module config if exists | 3 |
| `src/features/3d-lab/stores/createModuleStore.ts` | Add `hiddenLayers: Set<string>`, `toggleLayer()`, `showAllLayers()` to `ModuleStoreState` | 2 |
| `src/features/3d-lab/components/LabBrowser.tsx` | Add `useEffect` for `useGLTF.preload()` of GLTF modules in `DASHBOARD_VISIBLE_IDS` | 2 |
| `src/features/3d-lab/config/registry/cat-12.ts` (example) | Add first GLTF module registry entry | 2 |

### Files to Create

| File | Purpose | Phase |
|------|---------|-------|
| `src/features/3d-lab/templates/GltfAssetScene.tsx` | Core GLTF renderer component (~250 lines, includes material snapshot/restore for X-ray) | 2 |
| `src/features/3d-lab/templates/GltfAssetTemplate.tsx` | Template wrapper (thin — delegates to `GltfAssetScene` via `useTemplateContent` pattern) | 2 |
| `src/features/3d-lab/templates/GltfInfoSidebar.tsx` | Right sidebar for GLTF modules (annotations list, model info) | 2 |
| `src/features/3d-lab/templates/GltfLayersList.tsx` | Dynamic layer toggle list for LayersPanel children slot (~40 lines) | 2 |
| `src/lib/storage/asset-url-resolver.ts` | Storage-agnostic URL resolver: R2 signed URLs, Supabase legacy fallback, local dev (~60 lines) | 1 |
| `src/lib/storage/r2-client.ts` | Cloudflare R2 S3-compatible client (upload, signed URL generation) (~80 lines) | 1 |
| `src/features/3d-lab/config/modules/12-ph-heritage/bahay-kubo-3d.ts` | First proof-of-concept GLTF module config | 2 |
| `public/draco/draco_decoder.wasm` | DRACO WASM decoder | 0 |
| `public/draco/draco_wasm_wrapper.js` | DRACO JS wrapper | 0 |
| `public/draco/draco_decoder.js` | DRACO fallback decoder | 0 |

### Files to Eventually Retire

| File | Condition | Phase |
|------|-----------|-------|
| `src/components/3d/Workspace.tsx` | After `gltf-asset` template handles all GLTF loading paths and the fallback in `LabViewport.tsx:173-181` is no longer needed | 4+ |

---

## 13. Phased Execution Plan

### Phase 0: Prerequisites / Blockers

**Goal:** Resolve all blockers before any template work begins.

**Deliverables:**
1. Copy DRACO decoder files to `/public/draco/` (from `node_modules/three/examples/jsm/libs/draco/gltf/`)
2. Remove `useGLTF.setDecoderPath(CDN)` from `Workspace.tsx:93`
3. Verify local DRACO path works by loading any DRACO-compressed GLB in dev

**Files touched:**
- `public/draco/draco_decoder.wasm` (new)
- `public/draco/draco_wasm_wrapper.js` (new)
- `public/draco/draco_decoder.js` (new)
- `src/components/3d/Workspace.tsx` (remove line 93)

**Risks:** DRACO WASM files must match the Three.js version (0.183.x). Mismatch causes silent decode failures.

**Acceptance criteria:**
- [ ] `/public/draco/` contains 3 decoder files
- [ ] `Workspace.tsx` no longer calls `setDecoderPath`
- [ ] `LabViewportFrame.tsx:12` `setDecoderPath('/draco/')` is the single global DRACO config
- [ ] A DRACO-compressed GLB loads successfully via the legacy `Workspace` fallback path
- [ ] `bun run build` succeeds with DRACO files in `/public/`

---

### Phase 1: Type System / Router / Template Introduction

**Goal:** Add `gltf-asset` to the type system and routing infrastructure. No renderer yet — the route exists but returns a placeholder.

**Deliverables:**
1. Add `'gltf-asset'` to `TemplateType` union
2. Define `GltfAssetNodeMapping` and `GltfAssetConfig` interfaces
3. Add `({ templateType: 'gltf-asset' } & GltfAssetConfig)` to `ModuleConfig` union
4. Add `TEMPLATE_SHELL_DEFAULTS['gltf-asset']` entry
5. Add `case 'gltf-asset'` to `LabViewport.tsx` `TemplateModuleWrapper` (dynamic import placeholder)
6. Create placeholder `GltfAssetTemplate.tsx` that renders a "GLTF Asset — Coming Soon" message

**Files touched:**
- `src/features/3d-lab/types/templates.ts` (modify: ~60 lines added)
- `src/features/3d-lab/components/LabViewport.tsx` (modify: ~8 lines added)
- `src/features/3d-lab/templates/GltfAssetTemplate.tsx` (new: ~20 lines placeholder)

**Risks:** `TEMPLATE_SHELL_DEFAULTS` is a `Record<TemplateType, ...>`. Adding `'gltf-asset'` to the union without adding the defaults entry causes a TS error. Must add both simultaneously.

**Acceptance criteria:**
- [ ] `bun run type-check` passes
- [ ] `bun run build` succeeds
- [ ] No existing module behavior changes (regression-free)
- [ ] A test registry entry with `templateType: 'gltf-asset'` compiles and routes to the placeholder

---

### Phase 2: Renderer + Shell Integration

**Goal:** Build `GltfAssetScene`, wire it into the shell via `useTemplateContent`, and render the first proof-of-concept GLTF module.

**Deliverables:**
1. Create `GltfAssetScene.tsx` — the core renderer (~200 lines)
   - `useGLTF(modelUrl)` loading
   - Scene traversal + node index building
   - Auto-center on bounding box
   - X-ray material mutation from `useViewportShellStore.xrayMode`
   - Layer visibility toggling
   - Annotation overlay registration in `useOverlayStore`
   - `SC_*` convention-based node discovery
   - `disposeObject` cleanup on unmount
2. Create `GltfInfoSidebar.tsx` — right sidebar showing annotations list and model metadata
3. Add `case 'gltf-asset'` to `useTemplateContent` returning:
   - `canvasContent`: `CanvasWrapper > SceneConfig > AssetPreloader > GltfAssetScene > SceneGround`
   - `rightSidebarContent`: `GltfInfoSidebar`
4. Replace placeholder `GltfAssetTemplate.tsx` with real template
5. Create first module config: `bahay-kubo-3d.ts` (or equivalent test model)
6. Add registry entry in appropriate `cat-*.ts`
7. Verify full shell integration: camera, toolbar, overlays, mobile

**Files touched:**
- `src/features/3d-lab/templates/GltfAssetScene.tsx` (new: ~200 lines)
- `src/features/3d-lab/templates/GltfAssetTemplate.tsx` (replace placeholder)
- `src/features/3d-lab/templates/GltfInfoSidebar.tsx` (new: ~80 lines)
- `src/features/3d-lab/hooks/useTemplateContent.tsx` (modify: ~40 lines added)
- `src/features/3d-lab/config/modules/12-ph-heritage/bahay-kubo-3d.ts` (new: ~60 lines)
- `src/features/3d-lab/config/registry/cat-12.ts` (modify: 1 entry added)

**Risks:**
- GLB loading performance on mobile (mitigated by size budgets)
- X-ray material mutation on complex GLB scenes (test with real SketchUp export)
- `useGLTF` cache behavior with `frameloop="demand"` (test invalidation)

**Acceptance criteria:**
- [ ] GLTF module loads and renders in the viewport
- [ ] Camera orbit/pan/look works
- [ ] X-ray toggle makes `SC_xray_*` nodes semi-transparent
- [ ] Layer panel toggles layer visibility
- [ ] Annotations appear as DOM overlays at correct positions
- [ ] Mobile layout works (bottom sheet, touch controls)
- [ ] `AssetPreloader` progress bar shows during load
- [ ] Clean disposal on unmount (no VRAM leaks)
- [ ] No regression in existing 209 procedural modules

---

### Phase 3: Admin / Asset-Linking Workflow

**Goal:** Enhance the admin asset workflow to support the GLTF module pipeline.

**Deliverables:**
1. Update `AssetUploader` to:
   - Restrict file types to `.glb` only
   - Enforce 25MB client-side size limit
   - Show validation error messages
2. Update `AssetDetailView` to:
   - Display asset metadata fields (category, node naming version)
   - Show a "Module Config" section linking to the corresponding config file (if `assetSlug` matches)
   - Add a "Publish" button that sets `status: 'published'`
3. Add `updateAssetStatus` server action to `assets.ts` (pending_review, published transitions)
4. Add `updateAssetMetadata` server action for editing metadata fields
5. Add structured metadata schema in `models_3d.metadata`:
   ```json
   {
     "category": "PH_HERITAGE",
     "nodeNamingVersion": "1.0",
     "polyCount": null,
     "textureSize": null,
     "hasDraco": true,
     "moduleConfigPath": "config/modules/12-ph-heritage/bahay-kubo-3d.ts"
   }
   ```

**Files touched:**
- `src/components/admin/AssetUploader.tsx` (modify)
- `src/components/admin/AssetDetailView.tsx` (modify)
- `src/lib/actions/admin/assets.ts` (modify: +2 new actions, ~80 lines)
- `src/app/admin/assets/[id]/page.tsx` (modify if needed)

**Risks:** Admin UI changes could affect existing asset management workflow. Changes must be backward-compatible.

**Acceptance criteria:**
- [ ] Admin can upload `.glb` files (non-`.glb` rejected)
- [ ] Files >25MB rejected with clear message
- [ ] Asset detail shows metadata fields
- [ ] Status can be transitioned: draft → pending_review → published
- [ ] Published assets are queryable by status
- [ ] Existing asset management workflow unchanged for current assets

---

### Phase 4: Validation, Rollout, and Migration Cleanup

**Goal:** Validate the full pipeline, clean up legacy paths, and prepare for broader rollout.

**Deliverables:**
1. Create 3-5 real GLTF module configs (from actual SketchUp exports of Philippine heritage buildings)
2. Add these modules to `DASHBOARD_VISIBLE_IDS` for testing
3. Write integration tests for:
   - GLTF module routing (type-check, build)
   - Asset loading failure cases
   - Admin upload workflow
4. Performance audit:
   - Measure load time for largest GLB on mobile
   - Verify memory disposal (no VRAM leaks after module navigation)
   - Verify `frameloop="demand"` works correctly with loaded models
5. Document the GLTF authoring guide:
   - SketchUp export settings
   - `SC_*` node naming convention
   - GLB optimization (polygon budget, texture sizes, DRACO compression)
   - Module config authoring template
6. Evaluate `Workspace.tsx` retirement:
   - If all GLTF loading now goes through `gltf-asset` template, the fallback in `LabViewport.tsx:173-181` can be replaced with an error state
   - Mark `Workspace.tsx` as deprecated

**Files touched:**
- `src/features/3d-lab/config/modules/` (3-5 new module configs)
- `src/features/3d-lab/config/registry/` (registry entries)
- `src/features/3d-lab/config/dashboard-visibility.ts` (add visible IDs)
- Test files (new)
- `.ai/docs/` (authoring guide)

**Acceptance criteria:**
- [ ] 3-5 real GLTF modules render correctly
- [ ] Mobile performance within acceptable bounds (<5s load, 30+ FPS orbit)
- [ ] No VRAM leaks after 10 module navigations
- [ ] DRACO compression verified working
- [ ] Authoring guide published
- [ ] Workspace.tsx marked deprecated

---

### Phase 5 (Future): Hybrid Procedural + GLTF Enhancements

**Deferred. Not in initial scope.**

Potential enhancements:
- Hybrid modules (GLTF base + procedural overlays)
- Config generation CLI (`bun run gen-gltf-module`)
- Server-side thumbnail generation
- Server-side GLB validation (polygon count, texture size extraction)
- Cloudflare R2 migration for binary assets
- KTX2/Basis texture compression support
- LOD (level of detail) for large models

---

## 14. Validation and Test Strategy

### Type Safety

- `bun run type-check` must pass after every phase
- The `ModuleConfig` discriminated union ensures all `GltfAssetConfig` fields are type-checked
- `TEMPLATE_SHELL_DEFAULTS` is `Record<TemplateType, ...>` — missing entries cause TS errors

### Route Build Safety

- `bun run build` must succeed after every phase
- Dynamic imports in `LabViewport.tsx` are verified by the Next.js build
- Registry entries with `templateType: 'gltf-asset'` must have corresponding configs

### Renderer Smoke Tests

| Test | Method | Phase |
|------|--------|-------|
| GLB loads and renders | Manual: open module in browser, verify 3D model visible | 2 |
| X-ray toggle works | Manual: click X-ray button, verify opacity change | 2 |
| Layers toggle works | Manual: open layers panel, toggle layer, verify visibility | 2 |
| Annotations appear | Manual: verify DOM overlays at correct positions | 2 |
| Camera presets work | Manual: click camera preset buttons, verify snap | 2 |
| Mobile layout works | Manual: resize to mobile, verify bottom sheet | 2 |

### Asset Loading Failure Cases

| Test | Method | Phase |
|------|--------|-------|
| 404 model URL | Point `modelUrl` to non-existent URL, verify error boundary | 2 |
| Corrupt GLB file | Upload invalid file, verify error handling | 2 |
| DRACO decode failure | Load DRACO GLB without decoder files, verify error | 0 |
| Timeout (slow network) | Throttle network in DevTools, verify progress indicator | 2 |

### Admin Workflow Validation

| Test | Method | Phase |
|------|--------|-------|
| Upload .glb accepted | Upload valid .glb, verify success | 3 |
| Upload .gltf rejected | Upload .gltf file, verify rejection | 3 |
| Upload >25MB rejected | Upload large file, verify rejection | 3 |
| Status transitions | Change status draft → published, verify DB | 3 |

### Performance Sanity Checks

| Metric | Target | Method | Phase |
|--------|--------|--------|-------|
| GLB load time (5MB, desktop) | <2s | Chrome DevTools Performance | 4 |
| GLB load time (5MB, mobile 4G) | <5s | Chrome DevTools throttling | 4 |
| Frame rate during orbit | >30 FPS | `PerformanceMonitor` logs | 4 |
| VRAM after 10 module navigations | No growth trend | `useWebGLMemoryMonitor` | 4 |
| Bundle size impact | <5KB added to main bundle | `bun run build` analysis | 2 |

### Unit / Integration Tests Worth Prioritizing

| Test | Location | Priority |
|------|----------|----------|
| `GltfAssetConfig` type validation | Type-level test (no runtime needed) | High |
| Node naming convention parser | `GltfAssetScene` node discovery logic | High |
| Node mapping merge (convention + config) | Unit test for merge logic | Medium |
| `createAsset` with GLTF metadata | `assets.test.ts` | Medium |
| `uploadAssetFile` with .glb validation | `assets.test.ts` | Medium |

---

## 15. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| DRACO decoder version mismatch with Three.js | Medium | High (silent decode failures) | Pin decoder version to match `three@0.183.x`; test with real DRACO GLBs |
| GLB performance regression on mobile | Medium | High (poor UX) | Enforce 10MB mobile budget; test on real devices; PerformanceMonitor auto-adjusts DPR |
| SketchUp exports produce bloated meshes | High | Medium (large file sizes) | Document polygon budget (200K max); provide optimization guide |
| Admin confusion between `/admin/assets` and `/admin/3d-models` | Medium | Low (workflow friction) | Add cross-links between the two admin sections; consider merging in future phase |
| Two GLTF loading paths (Workspace + GltfAssetScene) | Low (after Phase 0) | Medium (inconsistent behavior) | Phase 0 consolidates DRACO path; Phase 4 retires Workspace |
| Config authoring bottleneck (every module needs .ts file) | High | Medium (slow module creation) | Accept for Phase 1; plan config generation CLI for Phase 5 |
| `useGLTF` cache prevents model updates | Low | Low | `useGLTF.clear(url)` on unmount; re-upload creates new URL |

---

## 16. Open Decisions That Still Remain

| Decision | Options | Recommendation | Status |
|----------|---------|---------------|--------|
| **First GLTF test module** | Bahay Kubo, Vigan Heritage House, or a simple test model | Use a simple architectural model (< 2MB) for Phase 2 proof-of-concept; heritage buildings for Phase 4 | Open — depends on available GLB assets |
| **`/admin/3d-models` merge with `/admin/assets`** | Keep separate vs. merge into unified admin | Keep separate for now; merge is a Phase 5 concern | Deferred |
| **Config generation CLI scope** | Scaffold-only vs. interactive vs. admin UI | Scaffold-only CLI for Phase 5; admin UI for Phase 6+ | Deferred |
| **KTX2/Basis texture support** | Add now vs. defer | Defer — standard PNG/JPEG textures in GLB are sufficient for initial modules | Deferred |
| **GLTF animation support** | Support animated GLTF (skinned meshes, morph targets) | Defer — initial modules are static architectural models | Deferred |
| **`autoCenter` / `autoScale` implementation** | Bounding box calculation on load | Implement in Phase 2 — simple bounding box center + scale | Decided: Phase 2 |

---

## 17. Final Recommendation

**Proceed with implementation.** All prerequisites are achievable (Phase 0 is a 1-hour task). The existing infrastructure — ViewportShell, template router, asset pipeline, admin CRUD, DRACO configuration, disposal hooks — makes this a reconnection of dormant plumbing, not a greenfield build.

**Top 8 architectural recommendations:**

1. **Binary assets: Cloudflare R2** from Phase 1. Private by default with signed URLs for premium content. Supabase `3d-models` bucket is legacy-only during migration.
2. **Metadata: Supabase Postgres** (`models_3d` table). Structured JSONB metadata (`storage_provider`, `bucket`, `object_key`, `asset_version`). Runtime URLs resolved via `resolveAssetUrl()`, never hardcoded.
3. **`Workspace.tsx`: Cannibalize, then retire.** Extract `DynamicModel` X-ray traversal and `disposeObject` patterns into `GltfAssetScene`. Mark `Workspace` deprecated after Phase 2. Remove after Phase 4.
4. **Introduce `gltf-asset` template now.** All type-system and routing infrastructure supports it. Phase 1 is a 2-hour task.
5. **Asset-to-module linking: Code-authored config referencing DB asset (Option A).** Maintains type safety, version control, and consistency with 209 existing modules. Future CLI generates scaffolds.
6. **Node naming: Convention-based (`SC_*` prefix) with config override.** Convention enables auto-discovery; config overrides handle non-conforming assets. Both paths merge at runtime.
7. **`.glb` is the required runtime format.** Single binary, DRACO-compressible, single HTTP request, `useGLTF`-native.
8. **Phase 1 modules: View + annotations + camera presets.** X-ray and layers are immediate (Phase 2) but parameters and violations are authored per-module. Start with view-only modules to prove the pipeline.

**Estimated effort by phase:**
- Phase 0: 1-2 hours (DRACO files + path consolidation)
- Phase 1: 2-3 hours (type system + router)
- Phase 2: 8-12 hours (renderer + shell integration + first module)
- Phase 3: 4-6 hours (admin workflow enhancements)
- Phase 4: 6-10 hours (validation, real modules, cleanup)

**Total: ~25-35 hours of engineering work for a production-ready GLTF module pipeline.**

---

## ADR: Asset-to-Module Linking

**Decision:** Code-authored TypeScript config files reference DB asset records via `modelUrl` and optional `assetSlug`.

**Drivers:**
- Type safety and IDE support for config authoring
- Version control and code review for pedagogical content
- Consistency with 209 existing procedural module configs
- Separation of asset lifecycle (admin) from module behavior (developer)

**Alternatives considered:**
- DB-authored config (rejected: loses type safety, version control, diverges from architecture)
- Generated config only (rejected: still needs manual review, adds tool maintenance)

**Why chosen:** Minimizes architectural divergence. The 8th template type follows the same patterns as the first 7. Future CLI tooling (Phase 5) can scaffold configs to reduce manual effort.

**Consequences:** Every GLTF module requires a developer to create/review a `.ts` config file. At the expected volume (5-20 GLTF modules in the first year), this is sustainable.

**Follow-ups:** Config generation CLI in Phase 5; admin-side config preview in Phase 6+.
