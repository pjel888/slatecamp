# Supplier CAD to Blender/GLB hinge workflow

Purpose: replace door-hinge article models only when supplier-grounded assets are more accurate than current procedural R3F models.

## Folder contract

- `downloads/` — raw supplier PDFs/CAD files, unchanged.
- `references/` — manifests, extracted text, source matrix, screenshots.
- `source-blend/` — editable Blender files, one per hinge type.
- `exports/` — candidate GLB exports for browser QA.
- `qa/` — screenshots/contact sheets and reviewer notes.

## Acceptance gate per hinge

A hinge asset can replace the procedural model only if:

1. Source provenance exists:
   - manufacturer/supplier name
   - source URL
   - model/product number if applicable
   - downloaded file hash
   - license/terms note
2. Geometry is intentionally simplified for education, not blindly imported.
3. Blender file has semantic object names:
   - `LEAF_*`, `KNUCKLE_*`, `PIN_*`, `SCREW_*`, `BEARING_*`, `SPRING_*`, `PIVOT_*`, etc.
4. Runtime GLB is under article performance budget.
5. Browser QA passes without label recognition.
6. It is more accurate than the current procedural R3F version.

## Preferred conversion paths

### STEP/SAT/IGES available

1. Import into FreeCAD or Blender CAD importer.
2. Reduce/simplify geometry.
3. Rebuild named educational parts if imported mesh is too dense.
4. Export `.blend` and `.glb`.

### SKP available

1. Open in SketchUp or Blender SKP importer/converter.
2. Inspect scale and license.
3. Remove texture clutter and irrelevant surroundings.
4. Rename parts and export `.blend` + `.glb`.

### PDF/DWG only

1. Use drawing as dimensional/proportional reference.
2. Model greybox in Blender Python.
3. Keep dimensions/assumptions in manifest.
4. Export `.blend` + `.glb`.

## First recommended conversion candidates

1. **Pivot hinge** — use dormakaba 355.5 floor pivot installation sheet. Clear official source, simple geometry, high educational value.
2. **Spring hinge** — use Stanley 2060R PDF. Good text extraction and recognizable spring-hinge purpose.
3. **Butt hinge** — use McKinney template. Strong official reference and straightforward geometry.
4. **Concealed hinge** — use Blum/SOSS/SIMONSWERK after CAD access is confirmed.

## Do not do

- Do not use random 3D Warehouse/GrabCAD/SKP models as production assets without license/provenance.
- Do not import manufacturer geometry wholesale if it is too dense, branded, or unclear at article scale.
- Do not claim code/legal compliance from the model itself.
- Do not replace current procedural models until browser QA proves a better teaching result.
