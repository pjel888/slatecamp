Absolutely — here is a **clean comparison matrix structure** you can use directly in your app, plus a suggested way to resolve conflicts without pretending the codes say the same thing. [dpwh.gov](https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/amended_irr_bp_344_official_gazette_2.pdf)

## App-ready schema

Use one row per rule, not one row per law, so your UI can filter by dimension, building type, and legal basis. [dhsud.gov](https://dhsud.gov.ph/wp-content/uploads/Laws_Issuances/02_IRR/Revised_IRR_BP220_2008.pdf)

```json
[
  {
    "id": "pd1096-stairs-width-general",
    "law": "PD 1096",
    "source_title": "National Building Code of the Philippines",
    "category": "stairs",
    "dimension_type": "clear_width",
    "constraint_type": "minimum",
    "value_mm": 750,
    "applies_to": ["general_buildings", "private_residential_baseline"],
    "overlay_type": "base",
    "conflicts_with": ["bp220-stairs-width-interior"],
    "priority_note": "Use as baseline unless a more specific regime like BP 220 applies.",
    "ui_explanation": "NBCP baseline minimum stair clear width."
  },
  {
    "id": "pd1096-stairs-riser-general",
    "law": "PD 1096",
    "source_title": "National Building Code of the Philippines",
    "category": "stairs",
    "dimension_type": "riser_height",
    "constraint_type": "maximum",
    "value_mm": 200,
    "applies_to": ["general_buildings", "private_residential_baseline"],
    "overlay_type": "base",
    "conflicts_with": ["bp220-stairs-riser-interior"],
    "priority_note": "Default maximum riser for general use.",
    "ui_explanation": "NBCP allows up to 200 mm riser height."
  },
  {
    "id": "pd1096-stairs-tread-general",
    "law": "PD 1096",
    "source_title": "National Building Code of the Philippines",
    "category": "stairs",
    "dimension_type": "tread_run",
    "constraint_type": "minimum",
    "value_mm": 200,
    "applies_to": ["general_buildings", "private_residential_baseline"],
    "overlay_type": "base",
    "conflicts_with": [],
    "priority_note": "Default minimum tread/run.",
    "ui_explanation": "NBCP requires at least 200 mm minimum run."
  },
  {
    "id": "bp220-stairs-width-interior",
    "law": "BP 220",
    "source_title": "Revised IRR of BP 220",
    "category": "stairs",
    "dimension_type": "clear_width",
    "constraint_type": "minimum",
    "value_mm": 600,
    "applies_to": ["economic_housing", "socialized_housing", "interior_stairs"],
    "overlay_type": "base",
    "conflicts_with": ["pd1096-stairs-width-general"],
    "priority_note": "Valid only for projects that qualify under BP 220.",
    "ui_explanation": "BP 220 permits narrower interior stairs than NBCP."
  },
  {
    "id": "bp220-stairs-riser-interior",
    "law": "BP 220",
    "source_title": "Revised IRR of BP 220",
    "category": "stairs",
    "dimension_type": "riser_height",
    "constraint_type": "maximum",
    "value_mm": 250,
    "applies_to": ["economic_housing", "socialized_housing", "interior_stairs"],
    "overlay_type": "base",
    "conflicts_with": ["pd1096-stairs-riser-general"],
    "priority_note": "More permissive than NBCP; do not apply outside BP 220 coverage.",
    "ui_explanation": "BP 220 allows up to 250 mm risers for qualifying housing."
  },
  {
    "id": "bp220-stairs-tread-interior",
    "law": "BP 220",
    "source_title": "Revised IRR of BP 220",
    "category": "stairs",
    "dimension_type": "tread_run",
    "constraint_type": "minimum",
    "value_mm": 200,
    "applies_to": ["economic_housing", "socialized_housing", "interior_stairs"],
    "overlay_type": "base",
    "conflicts_with": [],
    "priority_note": "Same numeric minimum tread as common NBCP baseline references.",
    "ui_explanation": "BP 220 requires at least 200 mm tread width."
  },
  {
    "id": "bp220-winder-tread-min-point",
    "law": "BP 220",
    "source_title": "Revised IRR of BP 220",
    "category": "stairs",
    "dimension_type": "winder_tread_narrow_end",
    "constraint_type": "minimum",
    "value_mm": 150,
    "applies_to": ["economic_housing", "socialized_housing", "winder_stairs"],
    "overlay_type": "base",
    "conflicts_with": [],
    "priority_note": "Only for winders/circular stairs under BP 220.",
    "ui_explanation": "BP 220 allows winders with a narrower minimum point."
  },
  {
    "id": "bp344-stairs-handrail-upper",
    "law": "BP 344",
    "source_title": "BP 344 IRR",
    "category": "stairs",
    "dimension_type": "handrail_height_upper",
    "constraint_type": "required_dimension",
    "value_mm": 900,
    "applies_to": ["accessible_route", "accessible_stairs", "public_buildings", "pwd_use"],
    "overlay_type": "overlay",
    "conflicts_with": [],
    "priority_note": "Apply in addition to the base stair code.",
    "ui_explanation": "Upper accessible handrail height."
  },
  {
    "id": "bp344-stairs-handrail-lower",
    "law": "BP 344",
    "source_title": "BP 344 IRR",
    "category": "stairs",
    "dimension_type": "handrail_height_lower",
    "constraint_type": "required_dimension",
    "value_mm": 700,
    "applies_to": ["accessible_route", "accessible_stairs", "public_buildings", "pwd_use"],
    "overlay_type": "overlay",
    "conflicts_with": [],
    "priority_note": "Apply in addition to the base stair code.",
    "ui_explanation": "Lower accessible handrail height."
  },
  {
    "id": "bp344-stairs-handrail-extension",
    "law": "BP 344",
    "source_title": "BP 344 IRR",
    "category": "stairs",
    "dimension_type": "handrail_extension",
    "constraint_type": "minimum",
    "value_mm": 300,
    "applies_to": ["accessible_route", "accessible_stairs", "public_buildings", "pwd_use"],
    "overlay_type": "overlay",
    "conflicts_with": [],
    "priority_note": "Apply in addition to the base stair code.",
    "ui_explanation": "Handrails extend beyond first and last step."
  }
]
```

## Verified source basis

These rows are grounded in the following source statements: [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf)

- The official DPWH copy of PD 1096 states stairs shall be at least **750 mm clear width**, with a **200 mm rise** and **200 mm minimum run**. [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf)
- The official BP 344 IRR states stair handrails shall be installed at **900 mm and 700 mm** above stair treads and extend at least **300 mm** beyond the first and last step. [dpwh.gov](https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/BP_344_IRR_0.pdf)
- BP 220 is legally a separate standards regime for economic and socialized housing, authorized to differ from PD 1096 and the Fire Code. [elibrary.judiciary.gov](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/13859)
- The DHSUD-hosted BP 220 IRR is the right official reference set for project-specific housing standards, even if search snippets are not as text-rich as the DPWH and BP 344 sources. [dhsud.gov](https://dhsud.gov.ph/wp-content/uploads/Laws_Issuances/02_IRR/Revised_IRR_BP220_2008.pdf)

## Conflict logic

Your app should separate **base rules** from **overlay rules**. In practice: [dpwh.gov](https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/amended_irr_bp_344_official_gazette_2.pdf)

- **Base regime** = PD 1096 *or* BP 220, depending on whether the project qualifies as economic/socialized housing. [elibrary.judiciary.gov](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/13859)
- **Overlay regime** = BP 344 when the stair is part of an accessible route or accessible facility. [dpwh.gov](https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/BP_344_IRR_0.pdf)
- **Additional overlay** = fire/egress constraints when the stair is an exit stair or serves higher occupant loads. [dpwh.gov](https://www.dpwh.gov.ph/DPWH/files/nbc/PD.pdf)

A simple resolver for your app could be:

```js
function resolveStairRules(projectTags, rules) {
  const baseRules = rules.filter(r =>
    r.overlay_type === "base" &&
    r.applies_to.some(tag => projectTags.includes(tag))
  );

  const overlayRules = rules.filter(r =>
    r.overlay_type === "overlay" &&
    r.applies_to.some(tag => projectTags.includes(tag))
  );

  return { baseRules, overlayRules };
}
```

## Good UI labels

Instead of “pass/fail” only, show these statuses: [dpwh.gov](https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/amended_irr_bp_344_official_gazette_2.pdf)

- **Applies**
- **Applies if project is BP 220**
- **Applies as accessibility overlay**
- **Conflicts with baseline**
- **More permissive than NBCP**
- **More restrictive than baseline**

That wording helps users understand that the standards are not random contradictions but **different legal contexts**. [elibrary.judiciary.gov](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/13859)

## Suggested filters

These filters will make the app much easier to use: [dhsud.gov](https://dhsud.gov.ph/wp-content/uploads/Laws_Issuances/02_IRR/Revised_IRR_BP220_2008.pdf)

- **Project type**: single-family, duplex, apartment, public building, school, commercial, socialized housing.
- **Route type**: general stair, exit stair, accessible route stair.
- **Dimension**: width, riser, tread, landing, handrail, headroom.
- **Law**: PD 1096, BP 220, BP 344, Fire Code.
- **Rule behavior**: minimum, maximum, required feature, overlay.

## Best disclaimer text

You should place a short disclaimer in the app like this: [dpwh.gov](https://www.dpwh.gov.ph/dpwh/sites/default/files/laws_codes_orders/amended_irr_bp_344_official_gazette_2.pdf)

> This tool compares Philippine stair standards across multiple legal regimes. A conflict does not automatically mean noncompliance; it may reflect different applicability rules, such as BP 220 for socialized housing or BP 344 accessibility overlays. [elibrary.judiciary.gov](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/2/13859)

If you want, next I can turn this into either:
1. a **full normalized JSON dataset** for stairs, landings, handrails, and headroom, or  
2. a **single-file HTML prototype** of the comparison app.