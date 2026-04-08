// src/features/3d-lab/components/templates/CalculatorLighting.tsx
//
// @deprecated — Use <StudioLighting preset="flat" /> from
//   src/features/3d-lab/components/rendering/StudioLighting.tsx
//
// The `flat` preset reproduces this component's values exactly:
//   ambientLight intensity={0.6}, directionalLight intensity={0.8} from [5, 8, 3], no shadows.
//
// This file is retained for reference only and will be removed in a future cleanup pass.
'use client'

import { StudioLighting } from '../rendering/StudioLighting'

/**
 * @deprecated Use <StudioLighting preset="flat" /> instead.
 * Kept for backward compatibility only.
 */
export const CalculatorLighting = () => <StudioLighting preset="flat" />
