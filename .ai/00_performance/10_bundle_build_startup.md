# 10 — Bundle, Build, and Startup Performance

Generated: 2026-04-27T02:05:10.180Z

## Commands measured
- `bun run build` repeat count: 1
- `bun run type-check` repeat count: 1

## Build timing
- Exit codes: 0
- p50: 42475 ms
- p95: 42475 ms
- min/max: 42475 / 42475 ms
- mean/stddev: 42475 / 0 ms

## Typecheck timing
- Exit codes: 0
- Duration: 4334 ms

## Largest static build artifacts
| File | Size |
| --- | ---: |
| `.next/static/chunks/0aq1rnlgyew3d.js` | 2290.6 KiB |
| `.next/static/chunks/17vc1bv91yc08.js` | 848.4 KiB |
| `.next/static/chunks/07hg49jq684a3.js` | 452.2 KiB |
| `.next/static/chunks/0sr9g4ijcrk89.js` | 418.6 KiB |
| `.next/static/chunks/07rzc0e__82_h.js` | 396.7 KiB |
| `.next/static/chunks/0pg~8tlmtu~~m.css` | 366.2 KiB |
| `.next/static/chunks/17z2p.f04v3mf.js` | 265.3 KiB |
| `.next/static/chunks/03.b9z-1o34dx.js` | 255.6 KiB |
| `.next/static/chunks/0v8wvmjciv088.js` | 246.0 KiB |
| `.next/static/chunks/0b2acuj1-3gr-.js` | 246.0 KiB |
| `.next/static/chunks/0345-laulhhsv.js` | 246.0 KiB |
| `.next/static/chunks/0wlyw~iit6los.js` | 246.0 KiB |
| `.next/static/chunks/14z1icq~9fm4w.js` | 246.0 KiB |
| `.next/static/chunks/018y.fea_asol.js` | 246.0 KiB |
| `.next/static/chunks/06~2kjf49up0b.js` | 246.0 KiB |
| `.next/static/chunks/0vo~g7p1yrgbw.js` | 213.1 KiB |
| `.next/static/chunks/0_smmzknl9ine.js` | 202.3 KiB |
| `.next/static/chunks/0rwwge57xnfls.js` | 198.6 KiB |
| `.next/static/chunks/0vxs-0q51i3q4.js` | 174.8 KiB |
| `.next/static/chunks/0l04qulxfoa9_.js` | 168.5 KiB |
| `.next/static/chunks/186q2881.dgwu.js` | 163.0 KiB |
| `.next/static/chunks/07fpgf-.t-o3m.js` | 146.4 KiB |
| `.next/static/chunks/0hfq59j50e4nv.js` | 143.0 KiB |
| `.next/static/chunks/0isq_gd6_rv71.js` | 140.2 KiB |
| `.next/static/chunks/0zva.5mfv_zf0.js` | 135.2 KiB |
| `.next/static/chunks/0sqvlhgf9jrpo.js` | 135.2 KiB |
| `.next/static/chunks/0.v_wj31ceyk9.js` | 130.9 KiB |
| `.next/static/chunks/0b-piy5eootl1.js` | 130.9 KiB |
| `.next/static/chunks/09gplhibf2oj7.js` | 129.4 KiB |
| `.next/static/chunks/0-~2wztu137np.js` | 123.6 KiB |

## Largest server build artifacts
| File | Size |
| --- | ---: |
| `.next/server/chunks/ssr/_0s2u4.b._.js.map` | 10470.5 KiB |
| `.next/server/chunks/ssr/_0s0e7c.._.js.map` | 5944.7 KiB |
| `.next/server/chunks/ssr/_0s2u4.b._.js` | 2292.3 KiB |
| `.next/server/chunks/ssr/[root-of-the-server]__05ar4zx._.js.map` | 1997.1 KiB |
| `.next/server/chunks/ssr/node_modules_cytoscape_dist_cytoscape_esm_mjs_0642y5z._.js.map` | 1996.7 KiB |
| `.next/server/edge/chunks/[root-of-the-server]__0g99z3_._.js.map` | 1618.8 KiB |
| `.next/server/chunks/ssr/[root-of-the-server]__086fmm6._.js.map` | 1425.2 KiB |
| `.next/server/chunks/ssr/[root-of-the-server]__0_p2m0w._.js.map` | 1425.2 KiB |
| `.next/server/chunks/ssr/node_modules_0_f6cra._.js.map` | 1353.6 KiB |
| `.next/server/chunks/ssr/node_modules_@supabase_supabase-js_dist_index_mjs_04qodwz._.js.map` | 1334.3 KiB |
| `.next/server/chunks/node_modules_@supabase_supabase-js_dist_index_mjs_0hp37pu._.js.map` | 1334.1 KiB |
| `.next/server/chunks/ssr/node_modules_0gmw9dd._.js.map` | 1325.3 KiB |
| `.next/server/chunks/ssr/node_modules_0onn6rv._.js.map` | 1324.8 KiB |
| `.next/server/chunks/ssr/node_modules_005qqe7._.js.map` | 1324.7 KiB |
| `.next/server/chunks/ssr/node_modules_113o-58._.js.map` | 1324.7 KiB |
| `.next/server/chunks/ssr/node_modules_12j14g1._.js.map` | 1324.7 KiB |
| `.next/server/chunks/ssr/_0s0e7c.._.js` | 1318.1 KiB |
| `.next/server/chunks/ssr/node_modules_next_dist_0nafn2-._.js.map` | 1094.7 KiB |
| `.next/server/chunks/ssr/node_modules_katex_dist_katex_mjs_0zuygmo._.js.map` | 977.8 KiB |
| `.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_0_7.ew0.js.map` | 868.0 KiB |

## Heavy dependency signals
- `three` (^0.183.2)
- `@react-three/fiber` (^9.6.0)
- `@react-three/drei` (^10.7.7)
- `framer-motion` (^12.38.0)
- `recharts` (^3.8.1)
- `mermaid` (^11.14.0)
- `@tiptap/react` (^3.22.4)
- `@uiw/react-codemirror` (^4.25.9)
- `marked` (^17.0.6)
- `isomorphic-dompurify` (^3.10.0)
- `papaparse` (^5.5.3)
- `openai` (^6.34.0)
- `@anthropic-ai/sdk` (^0.78.0)

## Raw evidence
- `.ai/00_performance/results/build_startup_results.json`
- `.ai/00_performance/logs/build-startup-commands.md`
