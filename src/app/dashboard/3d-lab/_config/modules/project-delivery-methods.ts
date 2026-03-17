// src/app/dashboard/3d-lab/_config/modules/project-delivery-methods.ts
// Project Delivery Methods — Professional Practice
// ─────────────────────────────────────────────────────────────────────────────
// Animated flowchart comparing Design-Bid-Build, Design-Build, CM at Risk,
// and Integrated Project Delivery (IPD) phase structures.

import type { AnimatedSequenceConfig } from '../../_types/templates'

export const projectDeliveryMethodsConfig: AnimatedSequenceConfig = {
  id: 'project-delivery-methods',
  title: 'Project Delivery Methods',
  description:
    'Animated comparison of the four primary project delivery methods: Design-Bid-Build, Design-Build, CM at Risk, and IPD. Each step illustrates the contractual relationships and phase overlaps.',
  subject: 'prof-practice',
  loop: true,
  autoPlaySpeed: 2500,
  camera: { position: [0, 4, 6], target: [0, 0, 0], fov: 50 },
  steps: [
    // ── Step 1: Design-Bid-Build ─────────────────────────────────────────────
    {
      id: 'design-bid-build',
      label: 'Design-Bid-Build (Traditional)',
      description:
        'Owner contracts separately with Architect (design) then Contractor (construction). Sequential phases: Pre-design → SD → DD → CDs → Bidding → Construction → Closeout. Most common delivery method in the Philippines.',
      codeCitation: 'RA 9184 Government Procurement Reform Act',
      duration: 2000,
      geometry: [
        // Base platform
        { id: 'base', type: 'box', args: [5, 0.05, 2], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Owner block
        { id: 'owner', type: 'box', args: [0.8, 0.5, 0.6], position: [-2.0, 0.25, 0], color: '#3b82f6', label: 'Owner' },
        // Architect block
        { id: 'architect', type: 'box', args: [0.8, 0.5, 0.6], position: [0, 0.25, 0.5], color: '#8b5cf6', label: 'Architect' },
        // Contractor block
        { id: 'contractor', type: 'box', args: [0.8, 0.5, 0.6], position: [0, 0.25, -0.5], color: '#64748b', label: 'Contractor' },
        // Phase bar: Design
        { id: 'phase-design', type: 'box', args: [1.8, 0.15, 0.25], position: [-0.6, 1.1, 0], color: '#8b5cf6', opacity: 0.85, transparent: true, label: 'Design Phase' },
        // Phase bar: Bid
        { id: 'phase-bid', type: 'box', args: [0.6, 0.15, 0.25], position: [0.9, 1.1, 0], color: '#f59e0b', opacity: 0.85, transparent: true, label: 'Bid' },
        // Phase bar: Construction
        { id: 'phase-construction', type: 'box', args: [1.2, 0.15, 0.25], position: [1.9, 1.1, 0], color: '#64748b', opacity: 0.85, transparent: true, label: 'Construction' },
        // Arrow: Owner → Architect
        { id: 'arrow-oa', type: 'cone', args: [0.06, 0.18, 8], position: [-1.4, 0.5, 0.3], rotation: [0, 0, -Math.PI / 2], color: '#3b82f6' },
        // Arrow: Owner → Contractor
        { id: 'arrow-oc', type: 'cone', args: [0.06, 0.18, 8], position: [-1.4, 0.5, -0.3], rotation: [0, 0, -Math.PI / 2], color: '#3b82f6' },
        // Connector line Owner–Architect
        { id: 'line-oa', type: 'box', args: [1.0, 0.02, 0.02], position: [-1.5, 0.5, 0.35], color: '#3b82f6' },
        // Connector line Owner–Contractor
        { id: 'line-oc', type: 'box', args: [1.0, 0.02, 0.02], position: [-1.5, 0.5, -0.35], color: '#3b82f6' },
      ],
    },

    // ── Step 2: Design-Build ─────────────────────────────────────────────────
    {
      id: 'design-build',
      label: 'Design-Build (Single Entity)',
      description:
        'Owner contracts with a single Design-Build entity responsible for both design and construction. Phases overlap significantly: design and construction can proceed concurrently. Faster delivery, single point of accountability.',
      codeCitation: 'RA 9184 IRR Annex H — Alternative Methods',
      duration: 2000,
      geometry: [
        // Base platform
        { id: 'base', type: 'box', args: [5, 0.05, 2], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Owner block
        { id: 'owner', type: 'box', args: [0.8, 0.5, 0.6], position: [-2.0, 0.25, 0], color: '#3b82f6', label: 'Owner' },
        // Design-Build entity block (larger — combined)
        { id: 'db-entity', type: 'box', args: [1.0, 0.7, 0.8], position: [0.5, 0.35, 0], color: '#16a34a', label: 'D-B Entity' },
        // Single contract arrow
        { id: 'arrow-single', type: 'cone', args: [0.07, 0.22, 8], position: [-1.0, 0.35, 0], rotation: [0, 0, -Math.PI / 2], color: '#3b82f6' },
        // Connector line
        { id: 'line-contract', type: 'box', args: [0.9, 0.02, 0.02], position: [-1.5, 0.35, 0], color: '#3b82f6' },
        // Overlapping phase bars (design + construction simultaneous)
        { id: 'phase-design', type: 'box', args: [2.0, 0.15, 0.25], position: [-0.5, 1.1, 0.2], color: '#8b5cf6', opacity: 0.85, transparent: true, label: 'Design' },
        { id: 'phase-construction', type: 'box', args: [2.0, 0.15, 0.25], position: [0.5, 1.1, -0.2], color: '#64748b', opacity: 0.85, transparent: true, label: 'Construction' },
        // Overlap highlight
        { id: 'overlap-zone', type: 'box', args: [0.8, 0.2, 0.55], position: [0.1, 1.1, 0], color: '#f59e0b', opacity: 0.35, transparent: true, label: 'Overlap' },
        // Label: Single Point
        { id: 'label-single', type: 'sphere', args: [0.08, 8, 8], position: [0.5, 1.0, 0], color: '#16a34a' },
      ],
    },

    // ── Step 3: CM at Risk ───────────────────────────────────────────────────
    {
      id: 'cm-at-risk',
      label: 'CM at Risk (Guaranteed Max Price)',
      description:
        'Owner hires a Construction Manager (CM) during design phase as a consultant. CM provides a Guaranteed Maximum Price (GMP) before construction. CM acts as general contractor during construction, absorbing cost overruns above GMP.',
      codeCitation: 'CIAP Document 101 — CM Delivery Guidelines',
      duration: 2000,
      geometry: [
        // Base platform
        { id: 'base', type: 'box', args: [5, 0.05, 2], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Owner block
        { id: 'owner', type: 'box', args: [0.8, 0.5, 0.6], position: [-2.0, 0.25, 0], color: '#3b82f6', label: 'Owner' },
        // Architect block
        { id: 'architect', type: 'box', args: [0.7, 0.5, 0.5], position: [0, 0.25, 0.6], color: '#8b5cf6', label: 'Architect' },
        // CM block
        { id: 'cm', type: 'box', args: [0.7, 0.5, 0.5], position: [0, 0.25, -0.6], color: '#dc2626', label: 'CM' },
        // Subcontractors under CM
        { id: 'sub1', type: 'box', args: [0.4, 0.35, 0.35], position: [1.5, 0.175, -0.9], color: '#94a3b8', label: 'Sub 1' },
        { id: 'sub2', type: 'box', args: [0.4, 0.35, 0.35], position: [1.5, 0.175, -0.35], color: '#94a3b8', label: 'Sub 2' },
        // GMP indicator bar
        { id: 'gmp-bar', type: 'box', args: [1.4, 0.08, 0.15], position: [0.5, 1.3, -0.6], color: '#f59e0b', label: 'GMP' },
        // Arrow Owner → Architect
        { id: 'arrow-oa', type: 'cone', args: [0.05, 0.15, 8], position: [-1.2, 0.4, 0.4], rotation: [0, 0, -Math.PI / 4], color: '#3b82f6' },
        // Arrow Owner → CM
        { id: 'arrow-ocm', type: 'cone', args: [0.05, 0.15, 8], position: [-1.2, 0.4, -0.4], rotation: [0, 0, Math.PI / 4], color: '#3b82f6' },
        // Arrow CM → Subs
        { id: 'arrow-cm-sub', type: 'cone', args: [0.05, 0.15, 8], position: [0.85, 0.25, -0.6], rotation: [0, 0, -Math.PI / 2], color: '#dc2626' },
        // Phase overlap: CM during design
        { id: 'phase-cm-design', type: 'box', args: [1.6, 0.1, 0.15], position: [-0.7, 1.0, 0], color: '#dc2626', opacity: 0.6, transparent: true, label: 'CM as Consultant' },
      ],
    },

    // ── Step 4: IPD (Integrated Project Delivery) ────────────────────────────
    {
      id: 'ipd',
      label: 'Integrated Project Delivery (IPD)',
      description:
        'Multi-party agreement binding Owner, Architect, and CM/Contractor into a single contract. Risk and reward shared. All parties collaborate from pre-design through closeout. BIM-enabled, lean construction principles.',
      codeCitation: 'AIA C191 — Standard Form Multi-Party Agreement for IPD',
      duration: 2000,
      geometry: [
        // Base platform
        { id: 'base', type: 'box', args: [5, 0.05, 2], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Central shared risk pool (triangle arrangement)
        { id: 'shared-pool', type: 'cylinder', args: [0.9, 0.9, 0.06, 6], position: [0, 0.03, 0], color: '#fbbf24', opacity: 0.45, transparent: true, label: 'Shared Risk/Reward' },
        // Owner
        { id: 'owner', type: 'box', args: [0.7, 0.5, 0.5], position: [-1.2, 0.25, 0.8], color: '#3b82f6', label: 'Owner' },
        // Architect
        { id: 'architect', type: 'box', args: [0.7, 0.5, 0.5], position: [-1.2, 0.25, -0.8], color: '#8b5cf6', label: 'Architect' },
        // CM/Contractor
        { id: 'cm-contractor', type: 'box', args: [0.7, 0.5, 0.5], position: [1.2, 0.25, 0], color: '#16a34a', label: 'CM/GC' },
        // Lines connecting all to center (IPD triparty)
        { id: 'line-owner', type: 'box', args: [1.1, 0.02, 0.02], position: [-0.65, 0.4, 0.6], rotation: [0, -Math.PI / 6, 0], color: '#fbbf24' },
        { id: 'line-arch', type: 'box', args: [1.1, 0.02, 0.02], position: [-0.65, 0.4, -0.6], rotation: [0, Math.PI / 6, 0], color: '#fbbf24' },
        { id: 'line-cm', type: 'box', args: [1.1, 0.02, 0.02], position: [0.65, 0.4, 0], rotation: [0, 0, 0], color: '#fbbf24' },
        // Fully overlapping phase bars (all phases simultaneous)
        { id: 'phase-pre', type: 'box', args: [0.7, 0.12, 0.18], position: [-1.9, 1.1, 0], color: '#3b82f6', opacity: 0.9, transparent: true },
        { id: 'phase-design', type: 'box', args: [1.2, 0.12, 0.18], position: [-0.9, 1.1, 0], color: '#8b5cf6', opacity: 0.9, transparent: true },
        { id: 'phase-const', type: 'box', args: [1.2, 0.12, 0.18], position: [0.5, 1.1, 0], color: '#16a34a', opacity: 0.9, transparent: true },
        { id: 'phase-closeout', type: 'box', args: [0.6, 0.12, 0.18], position: [1.7, 1.1, 0], color: '#f59e0b', opacity: 0.9, transparent: true },
      ],
    },
  ],
}
