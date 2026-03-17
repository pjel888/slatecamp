// src/app/dashboard/3d-lab/_config/modules/contract-document-hierarchy.ts
// Contract Document Hierarchy — Professional Practice
import type { ExplodedAssemblyConfig } from '../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const contractDocumentHierarchyConfig: ExplodedAssemblyConfig = {
  id: 'contract-document-hierarchy',
  title: 'Contract Document Hierarchy',
  description: 'Layered stack showing the legal hierarchy of construction contract documents: from Owner-Architect Agreement at the apex down through General Conditions, Specifications, and Drawings.',
  subject: 'prof-practice',
  parts: [
    {
      id: 'cdh-owner-architect',
      label: 'Owner-Architect Agreement',
      description: 'Primary contract defining scope of architectural services, fees, and responsibilities. Governs all downstream documents.',
      codeCitation: 'UAP Doc. 301',
      geometry: { id: 'cdh-owner-architect-geo', type: 'box', position: [0, 0.06, 0], args: [1.0, 0.06, 0.7], color: '#3b82f6' },
      explodeOffset: yOff(0),
    },
    {
      id: 'cdh-general-conditions',
      label: 'General Conditions (AIA A201)',
      description: 'Standard general conditions of the contract for construction. Defines rights, duties, and responsibilities of Owner, Contractor, and Architect.',
      codeCitation: 'UAP Doc. 302 / AIA A201',
      geometry: { id: 'cdh-general-conditions-geo', type: 'box', position: [0, 0.18, 0], args: [1.0, 0.06, 0.7], color: '#3B6B9C' },
      explodeOffset: yOff(0.3),
    },
    {
      id: 'cdh-supplementary',
      label: 'Supplementary Conditions',
      description: 'Project-specific modifications to General Conditions. Addresses local requirements, insurance, and special clauses.',
      geometry: { id: 'cdh-supplementary-geo', type: 'box', position: [0, 0.3, 0], args: [1.0, 0.06, 0.7], color: '#2F5A85' },
      explodeOffset: yOff(0.6),
    },
    {
      id: 'cdh-special-conditions',
      label: 'Special Conditions',
      description: 'Project-unique administrative and procedural requirements not covered elsewhere.',
      geometry: { id: 'cdh-special-conditions-geo', type: 'box', position: [0, 0.42, 0], args: [1.0, 0.06, 0.7], color: '#4f46e5' },
      explodeOffset: yOff(0.9),
    },
    {
      id: 'cdh-specifications',
      label: 'Technical Specifications',
      description: 'CSI MasterFormat divisions describing materials, products, and workmanship for all trades. Governs quality and substitutions.',
      codeCitation: 'CSI MasterFormat Div 00–49',
      geometry: { id: 'cdh-specifications-geo', type: 'box', position: [0, 0.54, 0], args: [1.0, 0.06, 0.7], color: '#7c3aed' },
      explodeOffset: yOff(1.2),
    },
    {
      id: 'cdh-drawings',
      label: 'Contract Drawings',
      description: 'Architectural, structural, mechanical, electrical, and plumbing drawings. Show dimensions, locations, and configurations. Drawings govern over specs for quantities; specs govern for quality.',
      codeCitation: 'UAP Doc. 208',
      geometry: { id: 'cdh-drawings-geo', type: 'box', position: [0, 0.66, 0], args: [1.0, 0.06, 0.7], color: '#a855f7' },
      explodeOffset: yOff(1.5),
    },
    {
      id: 'cdh-addenda',
      label: 'Addenda',
      description: 'Written modifications issued before bid opening. Become part of the contract documents once contract is executed.',
      geometry: { id: 'cdh-addenda-geo', type: 'box', position: [0, 0.78, 0], args: [1.0, 0.06, 0.7], color: '#c084fc' },
      explodeOffset: yOff(1.8),
    },
    {
      id: 'cdh-change-orders',
      label: 'Change Orders / Modifications',
      description: 'Post-award changes to contract scope, schedule, or cost. Highest priority as most recent agreement of the parties.',
      codeCitation: 'UAP Doc. 303',
      geometry: { id: 'cdh-change-orders-geo', type: 'box', position: [0, 0.9, 0], args: [1.0, 0.06, 0.7], color: '#f97316' },
      explodeOffset: yOff(2.1),
    },
  ],
  camera: { position: [2, 2, 3], fov: 45 },
}
