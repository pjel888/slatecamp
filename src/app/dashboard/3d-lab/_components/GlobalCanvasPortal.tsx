// src/app/dashboard/3d-lab/_components/GlobalCanvasPortal.tsx
'use client'

import tunnel from 'tunnel-rat'

/**
 * A tunnel for R3F content to be portaled into a global persistent Canvas.
 * This prevents WebGL context re-initialization during navigation.
 */
export const SceneTunnel = tunnel()
