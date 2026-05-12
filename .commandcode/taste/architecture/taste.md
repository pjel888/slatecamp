# architecture
- LI mode must support cross-code comparative analysis where learners can compare how different building codes specify different requirements (e.g., stair widths, habitable area minimums) side-by-side. Confidence: 0.80
- BP344 ramp compliance module belongs in LI mode — compliance-checking content is valid for LI, not solely PI (parametric) mode. Confidence: 0.75
- LI mode should prioritize simplicity and ease of use. Confidence: 0.80
- LI mode should include 3D model hotspots that users can click to trigger quiz modals or information modals. Confidence: 0.80
- LI mode hotspots should reuse existing HotspotAnnotation, HotspotCard, DOMOverlayLayer, and useOverlayStore infrastructure rather than building new interaction components. Confidence: 0.80
- PI (Parametric Interactivity) and LI (Learning Interactivity) serve complementary roles: PI handles parametric compliance checking (sliders → violations), LI handles hotspot-based educational discovery (click model → information/quiz). Do not duplicate content across both modes. Confidence: 0.85
