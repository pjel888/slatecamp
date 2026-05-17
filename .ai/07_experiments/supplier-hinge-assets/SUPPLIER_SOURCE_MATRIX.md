# Supplier hinge source matrix

Date: 2026-05-16
Scope: Door-hinges article 3D accuracy improvement.

## Decision

Use official manufacturer/supplier references as source-of-shape and dimension references. Do **not** use random SketchUp Warehouse / GrabCAD / free-CAD assets as production geometry unless a license and provenance pass is completed.

Current production viewer remains procedural R3F until a supplier-grounded `.blend`/`.glb` asset beats it in recognition QA.

## Source candidates by hinge type

### Butt / full-mortise hinge

- Primary candidate: McKinney TA2314 / TA2714 full-mortise butt hinge
- Official page: https://www.mckinneyhinge.com/en/products/Full-Mortise-Butt-Hinge/five-knuckle/product-detail.aehpdp-ta2314-ta2714-ag_mckinney_77234
- Downloaded reference: `downloads/mckinney-ta714-ta314-template.pdf`
- Original URL: https://storage.googleapis.com/aa-americas/dam/AADSS1253368
- Status: good official template reference; PDF text extraction works.
- Use for: leaf proportion, five-knuckle layout, screw locations, mortise template anatomy.
- Caveat: template copyright restricts reproduction; use as internal reference, not copied drawing in article.

### Loose-pin hinge

- Primary candidate: S&S Hinge CAD files / loose-pin CAD categories
- Official page: https://www.sandshinge.com/cad-files
- Secondary CAD catalog: TraceParts loose pin hinges
- Status: candidate only; needs direct asset/license capture.
- Use for: removable pin/head anatomy.
- Caveat: weaker official architectural-door source found so far; may be best modeled procedurally from butt hinge plus pin-removal cue.

### Ball-bearing hinge

- Primary candidate: Ives 5BB1 / Hager BB1191 / McKinney resource library
- Candidate pages:
  - https://www.iveshardware.com/en/products/architectural-hinges/five-knuckle-ball-bearing-full-mortise-hinges.html
  - https://www.hagerco.com/commercial-hinges/full-mortise/five-knuckle/bb1191
  - https://www.mckinneyhinge.com/en/resource-library
- Status: official product pages found; Hager direct access may be Cloudflare-blocked in browser.
- Use for: bearing washer/collar location between knuckles, not just decorative rings.
- Caveat: need direct official template/PDF capture.

### Spring hinge

- Primary candidate: Stanley 2060R spring hinge catalog cut
- Downloaded reference: `downloads/stanley-2060r-spring-hinge.pdf`
- Original URL: https://www.stanleyhinges.com/catalogcuts/stanley-2060r.pdf
- Secondary: Bommer 3029 double-acting spring hinge
- Downloaded reference: `downloads/bommer-3029-double-acting-spring-hinge.pdf`
- Original URL: https://www.pivothinges.com/wp-content/uploads/2025/03/Bommer-3029-Series-Double-Acting-Spring-Hinge.pdf
- Status: Stanley PDF text extraction works; Bommer PDF appears scanned/image-only.
- Use for: spring-barrel placement and self-closing hinge silhouette.

### Pivot / floor pivot hinge

- Primary candidate: dormakaba 355.5 floor pivot installation sheet
- Downloaded reference: `downloads/dormakaba-904990-355-floor-pivot-installation.pdf`
- Original URL: https://my.dormakaba.com/medias/904990-355.5-Floor-Pivot-INS-0619.pdf
- Secondary: Norton Rixson resource library / ASSA ABLOY 147 or F147 pivot set.
- Status: good official installation reference; PDF text extraction works.
- Use for: floor bearing, header spindle alignment, top/bottom pivot relationship.

### Continuous / piano hinge

- Primary candidate: Pemko FMHD continuous geared aluminum hinge template
- Downloaded reference: `downloads/pemko-fmhd-continuous-hinge-template.pdf`
- Original URL: https://thebuilderssupply.com/assets/pdf/pemko/pemko-FMHD%28All%29_HingeTemplates.pdf
- Secondary: Hager Roton catalog PDF.
- Status: PDF downloaded but text extraction is poor/image-like; usable visually after screenshot/OCR if needed.
- Use for: full-height continuous hinge, repeated gear/knuckle anatomy, screw staggering.

### Concealed hinge

- Primary candidates:
  - Blum CAD/CAM data service: https://www.blum.com/gb/en/services/industrial-production/cad-cam-dataservice/
  - Blum CLIP top BLUMOTION downloads: https://www.blum.com/us/en/products/hingesystems/clip-top-blumotion/downloads-videos/
  - SOSS Model 220 Invisible Hinge: https://www.soss.com/product/model-220-invisible-hinge/
  - SIMONSWERK / TECTUS CAD catalogs: https://simonswerk.partcommunity.com/
- Status: good official pages found; CAD asset retrieval still needs manual/download pass.
- Use for: cabinet cup hinge (Blum) or invisible architectural hinge (SOSS/SIMONSWERK). These are different concealed-hinge families; avoid mixing them in one model.

### Parliament / wide-throw hinge

- Primary candidate: not yet captured.
- Search terms attempted: parliament hinge, wide-throw hinge, SOSS wide throw, McKinney/Ives wide throw.
- Status: still weak. Needs targeted manufacturer research.
- Use for: offset throw silhouette. Current procedural model is safer than current supplier-capture state.

### Strap / T hinge

- Primary candidate: not yet captured.
- Search terms attempted: strap hinge, T hinge, gate hardware technical drawing.
- Status: still weak. Many retailer pages exist, but not enough official CAD/dimension references yet.
- Use for: face-fixed strap/T silhouette. Current procedural model is safer until official drawing captured.

## Downloaded files and extraction summaries

See:

- `references/download-manifest.json`
- `references/pdf-extraction-summary.json`
- `references/extracted-text/*.txt`

## Conversion policy

1. Prefer official STEP/SAT/DWG/SKP/CAD from manufacturer portals where licensing permits educational internal use.
2. If no clean 3D CAD is available, model in Blender from official product drawings rather than importing random internet geometry.
3. Save source `.blend`, runtime `.glb`, screenshot contact sheet, and manifest.
4. Do not wire a GLB into `DoorHinge3D.tsx` until it passes recognition QA against the current procedural model.
