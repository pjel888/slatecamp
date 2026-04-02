<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# r3f

## Purpose

React Three Fiber utilities. Scene invalidation via version counter, geometry switching, loading overlay. For Calculator Suite frameloop="demand" tools.

## For AI Agents

1. **SceneInvalidator is render gate:** Mount inside Canvas with inputVersion selector
2. **Version counter pattern:** Increment numeric inputVersion in Zustand on user input
3. **60 FPS target:** All calculations within 16.6ms per frame

## Dependencies

Internal: @/stores/*, @/lib/utils

External: @react-three/fiber, three, react, tailwindcss

<!-- MANUAL: -->
