# 11 — Component, Function, and Hotspot Audit

Generated: 2026-04-27T00:29:36.012Z

## Method
Static scan of `src/**/*.ts(x)` for render-heavy patterns, expensive imports, list operations, context/provider breadth, sequential awaits, JSON serialization, image/3D risks, and client-component signals. These are **risk signals** until paired with runtime trace evidence.

## Summary by hotspot category
| Category | File count/signals |
| --- | ---: |
| regexConstruction | 1774 |
| clientComponent | 666 |
| renderArrayWork | 656 |
| stateStormCandidate | 372 |
| sequentialAwait | 263 |
| clientFiltering | 215 |
| dynamicImportCandidate | 99 |
| r3fHeavy | 96 |
| expensiveFormatting | 64 |
| clientSorting | 57 |
| jsonSerialization | 44 |
| unboundedList | 39 |
| broadContext | 35 |
| imageRisk | 10 |
| useEffectFetch | 5 |

## Largest source files by line count
| File | Lines |
| --- | ---: |
| `src/types/supabase.ts` | 4668 |
| `src/components/admin/unified-editor/QuestionsPanel.tsx` | 1482 |
| `src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts` | 1437 |
| `src/lib/actions/admin/content.ts` | 1206 |
| `src/stores/useQuizStore.ts` | 870 |
| `src/components/shared/taxonomy-picker.tsx` | 838 |
| `src/types/app.ts` | 833 |
| `src/features/3d-lab/config/modules/08-vertical/stairway-computation.ts` | 829 |
| `src/components/admin/unified-editor/EIPromptsPanel.tsx` | 827 |
| `src/components/admin/unified-editor/SaveAllBar.tsx` | 761 |
| `src/components/admin/unified-editor/ContentEditorIndex.tsx` | 753 |
| `src/components/admin/unified-editor/ArticlePanel.tsx` | 730 |
| `src/features/3d-lab/components/templates/WallConfigurator/BOMPanel.tsx` | 726 |
| `src/lib/demo/mock-supabase.ts` | 720 |
| `src/components/shared/taxonomy-tree.tsx` | 681 |
| `src/lib/actions/analytics/chart-data.ts` | 665 |
| `src/features/3d-lab/types/templates.ts` | 637 |
| `src/lib/actions/wiki-actions.ts` | 614 |
| `src/features/3d-lab/config/modules/11-arch-history/classical-orders-comparison.ts` | 602 |
| `src/features/3d-lab/config/modules/10-materials/wall-computation.ts` | 601 |
| `src/lib/developer/api-reference-data.ts` | 586 |
| `src/lib/actions/trails.ts` | 585 |
| `src/components/admin/QuestionsTableClient.tsx` | 583 |
| `src/types/module-blueprint.ts` | 582 |
| `src/components/interactive-illustrations/2D/SetbackIllustration.tsx` | 580 |
| `src/lib/actions/dashboard-page.ts` | 556 |
| `src/lib/actions/analytics.ts` | 555 |
| `src/components/shared/data-table.tsx` | 550 |
| `src/lib/actions/quiz-v2/submit-answer.ts` | 543 |
| `src/components/testing/hub/SessionsTable.tsx` | 531 |

## Heavy import / bundle-risk signals
| File | Category | Line | Example |
| --- | --- | ---: | --- |
| `src/storybook/scenes/DesignSystem/ColorPalette.stories.tsx` | r3fHeavy | 36 | `{ name: '--canvas', class: 'bg-canvas', label: 'Canvas' },` |
| `src/types/module-blueprint.ts` | r3fHeavy | 252 | `/** Canvas configuration */` |
| `src/app/dashboard/studio/_components/StudioHub.tsx` | r3fHeavy | 31 | `description: 'Explore spatial relationships and architectural concepts in three dimensions.',` |
| `src/app/calculators/_lib/calculator-materials.ts` | dynamicImportCandidate | 6 | `import * as THREE from 'three'` |
| `src/app/calculators/_lib/calculator-materials.ts` | r3fHeavy | 6 | `import * as THREE from 'three'` |
| `src/features/3d-lab/scenes/FARPlayground/FARPlayground.tsx` | r3fHeavy | 183 | `* Full FAR Playground scene: Canvas + parametric geometry + control panel + telemetry.` |
| `src/features/3d-lab/scenes/FARPlayground/FARScene.tsx` | dynamicImportCandidate | 5 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/scenes/FARPlayground/FARScene.tsx` | r3fHeavy | 5 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/scenes/ClassicalOrders/ClassicalOrdersScene.tsx` | dynamicImportCandidate | 4 | `import { Vector3 } from 'three'` |
| `src/features/3d-lab/scenes/ClassicalOrders/ClassicalOrdersScene.tsx` | r3fHeavy | 4 | `import { Vector3 } from 'three'` |
| `src/features/3d-lab/scenes/ClassicalOrders/ClassicalOrders.tsx` | r3fHeavy | 16 | `'The topmost step of the three-stepped platform (crepidoma) upon which columns stand. The stylobate provides a level, finished surface and visually anchors the colonnade to the landscape. Ancient builders subtly curved t` |
| `src/features/3d-lab/scenes/NBCPEnvelope/NBCPScene.tsx` | dynamicImportCandidate | 6 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/scenes/NBCPEnvelope/NBCPScene.tsx` | r3fHeavy | 6 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/scenes/NBCPEnvelope/NBCPEnvelope.tsx` | dynamicImportCandidate | 5 | `import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'` |
| `src/features/3d-lab/scenes/NBCPEnvelope/NBCPEnvelope.tsx` | r3fHeavy | 5 | `import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'` |
| `src/features/3d-lab/types/templates.ts` | dynamicImportCandidate | 6 | `import type { Vector3Tuple } from 'three'` |
| `src/features/3d-lab/types/templates.ts` | r3fHeavy | 6 | `import type { Vector3Tuple } from 'three'` |
| `src/features/3d-lab/config/modules/12-ph-heritage/ifugao-house.ts` | r3fHeavy | 65 | `description: 'Low woven bamboo walls on two or three sides. Very short — interior headroom is mostly in the roof space.',` |
| `src/features/3d-lab/config/modules/04-structural/superposition-demo.ts` | r3fHeavy | 4 | `// Colosseum-style stacking of the three classical orders:` |
| `src/features/3d-lab/config/modules/02-accessibility/tactile-block-types.ts` | r3fHeavy | 10 | `description: 'Side-by-side comparison of the three BP 344 tactile paving block types: Directional (parallel bars), Warning (5×5 dome grid), and Positional (staggered domes) — each 300×300mm.',` |
| `src/features/3d-lab/config/modules/11-arch-history/composite-order.ts` | r3fHeavy | 72 | `description: 'Rich entablature: three-fascia architrave, continuous frieze with scrollwork, modillion cornice. Combines Ionic and Corinthian elements at maximum richness.',` |
| `src/features/3d-lab/config/modules/11-arch-history/doric-order.ts` | r3fHeavy | 16 | `description: 'Top step of the three-stepped crepidoma. Greek Doric column rises directly from stylobate with no individual base.',` |
| `src/features/3d-lab/config/modules/11-arch-history/tuscan-order.ts` | r3fHeavy | 16 | `description: 'Top step of the three-stepped platform (crepidoma). Direct support for column base.',` |
| `src/features/3d-lab/config/modules/11-arch-history/greek-peristyle-temple.ts` | r3fHeavy | 10 | `description: 'Exploded assembly of a Greek peristyle temple (hexastyle). Shows three-stepped crepidoma, Doric peristyle colonnade, pronaos, cella (naos), opisthodomos, and pediment.',` |
| `src/features/3d-lab/config/modules/11-arch-history/classical-orders-comparison.ts` | r3fHeavy | 345 | `? `A three-fascia architrave with progressively projecting bands — characteristic of the ${orderLabel} order.`` |
| `src/features/3d-lab/config/modules/11-arch-history/egyptian-post-lintel.ts` | r3fHeavy | 88 | `description: 'Lotus or papyrus capital forms — three types: papyriform (closed bud), campaniform (open bell), and palm capitals. Purely compressive load path.',` |
| `src/features/3d-lab/config/modules/01-building-code/site-development-controls.ts` | r3fHeavy | 3 | `// This is a BESPOKE scene (custom Canvas + own store), not a parametric template.` |
| `src/features/3d-lab/config/modules/10-materials/wall-types.ts` | dynamicImportCandidate | 5 | `import type { Vector3Tuple } from 'three'` |
| `src/features/3d-lab/config/modules/10-materials/wall-types.ts` | r3fHeavy | 5 | `import type { Vector3Tuple } from 'three'` |
| `src/features/3d-lab/constants/scene-colors.ts` | r3fHeavy | 2 | `// Meshes inside <Canvas> must use hex strings (not Tailwind tokens).` |
| `src/features/3d-lab/stores/createModuleStore.ts` | r3fHeavy | 22 | `/** Updates annotation state only — does NOT trigger Canvas re-render. */` |
| `src/features/3d-lab/stores/useLabStore.ts` | r3fHeavy | 2 | `// Backward-compatible re-export that delegates to the three focused stores.` |
| `src/features/3d-lab/stores/legacyLabStore.ts` | r3fHeavy | 18 | `// R3F bridge — registered from inside Canvas via useInvalidateOnChange` |
| `src/features/3d-lab/stores/useOverlayStore.ts` | dynamicImportCandidate | 2 | `import * as THREE from 'three'` |
| `src/features/3d-lab/stores/useOverlayStore.ts` | r3fHeavy | 2 | `import * as THREE from 'three'` |
| `src/features/3d-lab/stores/nbcpStore.ts` | r3fHeavy | 48 | `// R3F bridge — registered from inside Canvas via useNBCPInvalidateOnChange` |
| `src/features/3d-lab/components/shell/SceneGround.tsx` | dynamicImportCandidate | 7 | `import { GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'` |
| `src/features/3d-lab/components/shell/SceneGround.tsx` | r3fHeavy | 7 | `import { GizmoHelper, GizmoViewport, Grid } from '@react-three/drei'` |
| `src/features/3d-lab/components/shell/LabViewportFrame.tsx` | dynamicImportCandidate | 4 | `import { Canvas } from '@react-three/fiber'` |
| `src/features/3d-lab/components/shell/LabViewportFrame.tsx` | r3fHeavy | 4 | `import { Canvas } from '@react-three/fiber'` |
| `src/features/3d-lab/components/shell/ViewportShell.tsx` | r3fHeavy | 213 | `{/* Canvas content from template */}` |
| `src/features/3d-lab/components/shell/CompassRose.tsx` | dynamicImportCandidate | 8 | `import { useFrame, useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/components/shell/CompassRose.tsx` | r3fHeavy | 8 | `import { useFrame, useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/components/overlays/CameraSync.tsx` | dynamicImportCandidate | 8 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/components/overlays/CameraSync.tsx` | r3fHeavy | 3 | `// NULL-RENDER component. Mounts inside <Canvas>.` |
| `src/features/3d-lab/components/templates/GeometryMesh.tsx` | dynamicImportCandidate | 1 | `import { ThreeEvent } from '@react-three/fiber'` |
| `src/features/3d-lab/components/templates/GeometryMesh.tsx` | r3fHeavy | 1 | `import { ThreeEvent } from '@react-three/fiber'` |
| `src/features/3d-lab/components/templates/InstancedMesh.tsx` | dynamicImportCandidate | 3 | `import { Instances, Instance } from '@react-three/drei'` |
| `src/features/3d-lab/components/templates/InstancedMesh.tsx` | r3fHeavy | 3 | `import { Instances, Instance } from '@react-three/drei'` |
| `src/features/3d-lab/components/templates/ExplodedPartsSidebar.tsx` | dynamicImportCandidate | 4 | `import { AnimatePresence, motion } from 'framer-motion'` |
| `src/features/3d-lab/components/templates/ArchMass.tsx` | dynamicImportCandidate | 4 | `import { Edges, Outlines } from '@react-three/drei'` |
| `src/features/3d-lab/components/templates/ArchMass.tsx` | r3fHeavy | 4 | `import { Edges, Outlines } from '@react-three/drei'` |
| `src/features/3d-lab/components/templates/ControlPanel.tsx` | r3fHeavy | 30 | `* — no React re-renders inside the Canvas.` |
| `src/features/3d-lab/components/templates/HumanSilhouette.tsx` | dynamicImportCandidate | 4 | `import { Vector3 } from 'three'` |
| `src/features/3d-lab/components/templates/HumanSilhouette.tsx` | r3fHeavy | 4 | `import { Vector3 } from 'three'` |
| `src/features/3d-lab/components/templates/InfoPanel.tsx` | dynamicImportCandidate | 4 | `import { AnimatePresence, motion } from 'framer-motion'` |
| `src/features/3d-lab/components/templates/ViolationIndicator.tsx` | dynamicImportCandidate | 5 | `import { Vector3 } from 'three'` |
| `src/features/3d-lab/components/templates/ViolationIndicator.tsx` | r3fHeavy | 5 | `import { Vector3 } from 'three'` |
| `src/features/3d-lab/components/templates/HotspotAnnotation.tsx` | dynamicImportCandidate | 4 | `import { Vector3 } from 'three'` |
| `src/features/3d-lab/components/templates/HotspotAnnotation.tsx` | r3fHeavy | 4 | `import { Vector3 } from 'three'` |
| `src/features/3d-lab/components/rendering/SceneBase.tsx` | dynamicImportCandidate | 4 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/components/rendering/SceneBase.tsx` | r3fHeavy | 4 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/components/rendering/AssetPreloader.tsx` | dynamicImportCandidate | 7 | `import { useProgress } from '@react-three/drei'` |
| `src/features/3d-lab/components/rendering/AssetPreloader.tsx` | r3fHeavy | 7 | `import { useProgress } from '@react-three/drei'` |
| `src/features/3d-lab/components/rendering/SceneConfig.tsx` | dynamicImportCandidate | 4 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/components/rendering/SceneConfig.tsx` | r3fHeavy | 4 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/DevControlsModule/canvas/layers/LotGround.tsx` | dynamicImportCandidate | 4 | `import { Line } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/layers/LotGround.tsx` | r3fHeavy | 4 | `import { Line } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/layers/RROWIndicator.tsx` | dynamicImportCandidate | 4 | `import { Line, Html } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/layers/RROWIndicator.tsx` | r3fHeavy | 4 | `import { Line, Html } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/layers/DevControlsLayers.tsx` | dynamicImportCandidate | 8 | `import { Line, Edges } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/layers/DevControlsLayers.tsx` | r3fHeavy | 8 | `import { Line, Edges } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/layers/FirewallMarkers.tsx` | dynamicImportCandidate | 4 | `import { Html, Edges } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/layers/FirewallMarkers.tsx` | r3fHeavy | 4 | `import { Html, Edges } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/InvalidateBridge.tsx` | dynamicImportCandidate | 11 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/DevControlsModule/canvas/InvalidateBridge.tsx` | r3fHeavy | 11 | `import { useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx` | dynamicImportCandidate | 9 | `import { Canvas, useThree } from '@react-three/fiber'` |
| `src/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas.tsx` | r3fHeavy | 3 | `// canvas/DevControlsCanvas.tsx` |
| `src/features/3d-lab/DevControlsModule/canvas/annotations/DimensionLines.tsx` | dynamicImportCandidate | 4 | `import { Line, Html } from '@react-three/drei'` |
| `src/features/3d-lab/DevControlsModule/canvas/annotations/DimensionLines.tsx` | r3fHeavy | 4 | `import { Line, Html } from '@react-three/drei'` |

## Sequential-await candidates
Sequential awaits can create server/API waterfalls. Validate dependencies before changing.

| File | First signal line |
| --- | ---: |
| `src/storybook/mocks/server-actions.ts` |  |
| `src/app/developer/tools/console/page.tsx` |  |
| `src/app/developer/status/page.tsx` |  |
| `src/app/developer/page.tsx` |  |
| `src/app/auth/callback/route.ts` |  |
| `src/app/admin/settings/page.tsx` |  |
| `src/app/admin/pipeline/_components/PipelineCard.tsx` |  |
| `src/app/admin/activity/page.tsx` |  |
| `src/app/admin/knowledge/new/page.tsx` |  |
| `src/app/admin/knowledge/[id]/page.tsx` |  |
| `src/app/admin/knowledge/page.tsx` |  |
| `src/app/admin/knowledge/questions/design-problems/[id]/page.tsx` |  |
| `src/app/admin/knowledge/questions/design-problems/page.tsx` |  |
| `src/app/admin/knowledge/questions/new/page.tsx` |  |
| `src/app/admin/knowledge/questions/scenarios/[id]/page.tsx` |  |
| `src/app/admin/knowledge/questions/scenarios/page.tsx` |  |
| `src/app/admin/knowledge/questions/[id]/page.tsx` |  |
| `src/app/admin/knowledge/questions/page.tsx` |  |
| `src/app/admin/layout.tsx` |  |
| `src/app/admin/preview/[previewId]/page.tsx` |  |
| `src/app/admin/assets/[id]/page.tsx` |  |
| `src/app/quiz/[mode]/setup/page.tsx` |  |
| `src/app/quiz/[mode]/session/[sessionId]/results/page.tsx` |  |
| `src/app/quiz/[mode]/session/[sessionId]/page.tsx` |  |
| `src/app/dashboard/settings/page.tsx` |  |
| `src/app/dashboard/upgrade/page.tsx` |  |
| `src/app/dashboard/exam-outcome/actions.ts` |  |
| `src/app/dashboard/score-reveal/page.tsx` |  |
| `src/app/dashboard/welcome-pro/page.tsx` |  |
| `src/app/dashboard/3d-lab/page.tsx` |  |
| `src/app/dashboard/wiki/[slug]/page.tsx` |  |
| `src/app/dashboard/assessment/page.tsx` |  |
| `src/app/dashboard/camptrails/[slug]/today/page.tsx` |  |
| `src/app/dashboard/camptrails/[slug]/day/[dayNumber]/complete/page.tsx` |  |
| `src/app/dashboard/camptrails/[slug]/page.tsx` |  |
| `src/app/dashboard/results-day/page.tsx` |  |
| `src/app/dashboard/flash/[category]/page.tsx` |  |
| `src/app/dashboard/notes/page.tsx` |  |
| `src/app/dashboard/pods/_components/PodView.tsx` |  |
| `src/app/dashboard/pods/page.tsx` |  |
| `src/app/dashboard/pods/[podId]/page.tsx` |  |
| `src/app/dashboard/dae-mode/_components/DAEModeClient.tsx` |  |
| `src/app/dashboard/dae-mode/page.tsx` |  |
| `src/app/dashboard/drills/sessions/page.tsx` |  |
| `src/app/dashboard/drills/page.tsx` |  |
| `src/app/dashboard/notifications/page.tsx` |  |
| `src/app/dashboard/area-c/design-quiz/[scenarioId]/page.tsx` |  |
| `src/app/dashboard/area-c/design-problems/[problemId]/page.tsx` |  |
| `src/app/(protected)/ceo/financials/page.tsx` |  |
| `src/app/(protected)/ceo/team/page.tsx` |  |
| `src/app/(protected)/ceo/layout.tsx` |  |
| `src/app/api/payments/checkout/route.test.ts` |  |
| `src/app/api/payments/checkout/route.ts` |  |
| `src/app/api/admin/flags/route.ts` |  |
| `src/app/api/ai/embed/route.ts` |  |
| `src/app/api/ai/study-agent/route.ts` |  |
| `src/app/api/ai/tutor/route.ts` |  |
| `src/app/api/ai/generate-questions/route.ts` |  |
| `src/app/api/ai/socratic/route.ts` |  |
| `src/app/api/webhooks/lemonsqueezy/route.test.ts` |  |
| `src/app/api/webhooks/lemonsqueezy/route.ts` |  |
| `src/app/api/webhooks/payrex/route.test.ts` |  |
| `src/app/api/webhooks/payrex/route.ts` |  |
| `src/app/(auth)/onboarding/page.tsx` |  |
| `src/stores/useNotificationStore.ts` |  |
| `src/components/trails/TrailDailyView.tsx` |  |
| `src/components/admin/QuestionImporter.tsx` |  |
| `src/components/admin/ArticleQuestionImporter.tsx` |  |
| `src/components/admin/AssetUploader.tsx` |  |
| `src/components/admin/SMEReviewQueue.tsx` |  |
| `src/components/admin/TaxonomyEditor.tsx` |  |
| `src/components/admin/unified-editor/ArticlePanel.tsx` |  |
| `src/components/wiki/navigation/WikiHeader.tsx` |  |
| `src/components/wiki/navigation/WikiLayoutContent.tsx` |  |
| `src/components/wiki/article/WikiArticle.tsx` |  |
| `src/components/wiki/widgets/registry.ts` |  |
| `src/components/shared/LogoutButton.tsx` |  |
| `src/components/assessment/AssessmentQuiz.tsx` |  |
| `src/components/ceo/FinancialEntryForm.tsx` |  |
| `src/components/dashboard/upgrade/UpgradeButtons.tsx` |  |

## Key static risks to validate with measurements
- Large client-heavy files and provider/context files may cause broad rerender costs.
- 3D/R3F, charting, rich text, markdown, Mermaid, and CodeMirror imports are likely bundle/runtime hotspots when pulled into initial routes.
- Client-side array sorting/filtering and unbounded maps should be checked against real data sizes.
- Sequential awaits in server actions/API handlers should be reviewed for safe parallelization.
- Image and canvas-heavy surfaces need route-specific network and rendering traces.

## Raw evidence
- `.ai/00_performance/results/component_hotspot_inventory.json`
