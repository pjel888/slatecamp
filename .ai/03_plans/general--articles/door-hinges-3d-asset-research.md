# Door Hinges 3D Asset Research — Local Iteration

Generated: 2026-05-15

## Direction

Philip is right: the current procedural hinge widgets are too complicated visually and several do not read as the actual hardware type. Do not push more Supabase changes until the model quality is fixed locally and visually reviewed.

## Local preview route

- Route: `/dev/door-hinges-preview`
- File: `src/app/dev/door-hinges-preview/page.tsx`
- Behavior: local-only development page; returns `notFound()` in production.
- Purpose:
  1. Shows all 9 `<DoorHinge3D />` variants in a QA grid.
  2. Renders `.ai/03_plans/articles/door-hinges-and-architectural-hardware-upgraded.md` through the same `WikiArticle` renderer used by production.

## External model search

### Sketchfab API search

Command used:

```bash
python3 - <<'PY'
import urllib.request, json
u='https://api.sketchfab.com/v3/search?type=models&q=door%20hinge&downloadable=true&count=12'
req=urllib.request.Request(u,headers={'User-Agent':'SlateCamp-local-research'})
data=json.loads(urllib.request.urlopen(req,timeout=20).read())
print(json.dumps(data.get('results',[])[:12], indent=2))
PY
```

Useful candidates found:

1. `Door Hinge - 1MB`
   - Sketchfab UID: `2108070af696477b91b66a5c40c733d6`
   - URL: `https://sketchfab.com/3d-models/none-2108070af696477b91b66a5c40c733d6`
   - License: `CC Attribution`
   - Author: `Mehdi Shahsavan`
   - Notes: strongest first candidate for a baseline butt hinge reference.

2. `Door Hinge`
   - UID: `3b1e4397d70648a9b7a30c91d934187e`
   - URL: `https://sketchfab.com/3d-models/none-3b1e4397d70648a9b7a30c91d934187e`
   - License: `CC Attribution`
   - Author: `VisuTech`

3. `Door hinge`
   - UID: `c2f400cc7c6a43488d9fbef547198271`
   - URL: `https://sketchfab.com/3d-models/none-c2f400cc7c6a43488d9fbef547198271`
   - License: `CC Attribution`
   - Author: `Urdons`

4. `5 Hinge Designs.`
   - UID: `fa58cfe2b9384fceba2f3eb489fb4f26`
   - URL: `https://sketchfab.com/3d-models/none-fa58cfe2b9384fceba2f3eb489fb4f26`
   - License: `CC Attribution`
   - Author: `laycockj32`
   - Notes: potentially useful because it covers multiple hinge silhouettes, but must be inspected visually and attribution/license must be preserved.

5. `Cupboard Hinge`
   - UID: `1ffa7463a95647c5bc8c07359ff161ae`
   - URL: `https://sketchfab.com/3d-models/none-1ffa7463a95647c5bc8c07359ff161ae`
   - License: `CC Attribution`
   - Author: `AleixoAlonso`
   - Notes: useful reference for the concealed/cabinet hinge variant.

Raw JSON capture:

- `.ai/03_plans/articles/door-hinges-3d-asset-research.json`

### Download constraint

Sketchfab download endpoint check:

```bash
https://api.sketchfab.com/v3/models/2108070af696477b91b66a5c40c733d6/download
```

Result: `401 Unauthorized` without Sketchfab OAuth/API token.

So the practical options are:

1. **Reference-only procedural rebuild now**
   - Use the CC BY model thumbnails/viewer pages as visual references only.
   - Rebuild simpler, more recognizable procedural models locally.
   - No third-party geometry enters the repo.
   - Fastest and cleanest for licensing.

2. **Authorized GLB ingestion later**
   - Philip provides/authorizes Sketchfab download access or another asset source.
   - Download original asset package.
   - Store under a tracked/provenance path only after license review.
   - Add attribution metadata and, if needed, visible attribution in the article/card.
   - Optimize/compress GLB before app use.

3. **Blender-authored asset pass**
   - Use Blender/manual modeling to create SlateCamp-owned hinge assets based on hardware references.
   - Export GLB locally.
   - Use `<primitive object={gltf.scene} />` only after node/scale/material QA.
   - Best long-term quality if many hardware widgets are planned.

## Recommended next implementation approach

For local-first iteration, do not start with all 9 variants. Fix one baseline first:

1. Build a high-recognition **butt hinge** model.
2. QA it in `/dev/door-hinges-preview` until it reads correctly without the title.
3. Derive `loose-pin`, `ball-bearing`, and `spring` from the same base geometry.
4. Treat `pivot`, `concealed`, `parliament`, and `strap` as separate silhouette families, not minor variations.

## Acceptance criteria before Supabase update

- Browser route loads without console/WebGL errors.
- Every variant is recognizable from silhouette.
- No cluttered in-canvas labels.
- Model uses calm hardware material and clear type-defining geometry.
- Article preview renders locally with all 9 embeds.
- No Supabase mutation until Philip approves the final visual pass.
