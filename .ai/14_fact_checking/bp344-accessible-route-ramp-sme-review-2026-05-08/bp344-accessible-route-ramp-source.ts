import type { SourceGateStatus, SourceTruthRule } from '@/features/3d-lab/types/templates'

export const BP344_RAMP_SOURCE_SHA256 = '63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953'

export const BP344_RAMP_REQUIRED_SOURCE_RULE_FIELDS = [
  'source_rule_id',
  'source_card_id',
  'source_candidate_id',
  'source_sha256',
  'document_path',
  'page_locator',
  'section_locator',
  'exact_quote',
  'normalized_rule',
  'classification',
  'compliance_scope',
  'human_review_status',
  'fail_closed_when_source_missing',
] as const satisfies readonly (keyof SourceTruthRule)[]

export const BP344_RAMP_SOURCE_RULES = [
  {
    "source_rule_id": "bp344_ramp_clear_width_min",
    "source_card_id": "sc-bp344-ramp-slope-width-2024-p2",
    "page_locator": "2",
    "section_locator": "Appendix A, Minimum Requirements for Accessibility, A.1 Accessible Ramps",
    "exact_quote": "Accessible ramps shall have the following facilities and features: 1. Minimum clear width of 1200 mm 2. Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases depending on the length to be covered. Maximum Slope Maximum Length Maximum Rise Interval for Landing 1:20 \u2013 \u2013 15m 1:15 10.50m 700mm 10m",
    "normalized_rule": "Accessible ramp minimum clear width is 1200 mm.",
    "value": "clear_width_min_mm=1200",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_ramp_general_slope_max",
    "source_card_id": "sc-bp344-ramp-slope-width-2024-p2",
    "page_locator": "2",
    "section_locator": "Appendix A, Minimum Requirements for Accessibility, A.1 Accessible Ramps",
    "exact_quote": "Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases depending on the length to be covered.",
    "normalized_rule": "General accessible ramp gradient must not be steeper than 1:20.",
    "value": "max_general_slope_ratio=1:20",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_ramp_special_slope_review",
    "source_card_id": "sc-bp344-ramp-slope-width-2024-p2",
    "page_locator": "2",
    "section_locator": "Appendix A, Minimum Requirements for Accessibility, A.1 Accessible Ramps",
    "exact_quote": "Maximum Slope Maximum Length Maximum Rise Interval for Landing 1:20 \u2013 \u2013 15m 1:15 10.50m 700mm 10m",
    "normalized_rule": "Special 1:15 slope row requires maximum length 10.50 m and maximum rise 700 mm; runtime status should be REVIEW_SPECIAL_CASE unless policy is human-approved.",
    "value": "special_slope_ratio=1:15; special_max_length_m=10.50; special_max_rise_mm=700; landing_interval_m=10",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core_special_case",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_ramp_landing_length_min",
    "source_card_id": "sc-bp344-ramp-landing-handrail-edge-2024-p2",
    "page_locator": "2",
    "section_locator": "Appendix A, A.1 Accessible Ramps",
    "exact_quote": "Accessible ramps with a total length longer than 10.50m shall be provided with intermediate landings with a minimum length of 1800 mm... Level area not less than 1800 mm at the upper end and lower end of any ramp.",
    "normalized_rule": "Intermediate landings and terminal level areas use minimum 1800 mm length/depth.",
    "value": "intermediate_landing_length_min_mm=1800; terminal_level_area_min_mm=1800",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_ramp_handrail_heights",
    "source_card_id": "sc-bp344-ramp-landing-handrail-edge-2024-p2;sc-bp344-handrails-general-2024-p7",
    "page_locator": "2;7",
    "section_locator": "Appendix A, A.1 Accessible Ramps; Appendix A, A.5 Handrails and Grab Bars",
    "exact_quote": "Handrails on both sides of the ramp at 700 mm and 900 mm from the finished floor of the ramp to the top of the handrails... Handrails shall be installed at 900 mm and 700 mm above ramps and stairs.",
    "normalized_rule": "Ramps require both-side handrails at 700 mm and 900 mm where applicable.",
    "value": "handrail_low_mm=700; handrail_high_mm=900",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_ramp_handrail_trigger_and_grip",
    "source_card_id": "sc-bp344-handrails-general-2024-p7",
    "page_locator": "7",
    "section_locator": "Appendix A, A.5 Handrails and Grab Bars",
    "exact_quote": "Handrails shall be required for accessible ramps for changes in grade higher than 170 mm... Railings for protection shall be installed at a height of 1100 mm minimum... Handrails and grab bars that require full grip shall have a round cross-section with a diameter of 1 3/16\u201d (30 mm) to 1 37/64\u201d (40 mm).",
    "normalized_rule": "Accessible ramps with grade change >170 mm require handrails; protective railing minimum 1100 mm; full-grip handrail/grab bar diameter 30\u201340 mm.",
    "value": "handrail_rise_trigger_mm=170; protective_railing_min_mm=1100; grip_diameter_min_mm=30; grip_diameter_max_mm=40",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_ramp_raised_edge_min",
    "source_card_id": "sc-bp344-ramp-landing-handrail-edge-2024-p2",
    "page_locator": "2",
    "section_locator": "Appendix A, A.1 Accessible Ramps",
    "exact_quote": "Raised edge on both sides of the ramp with a minimum height of 100 mm.",
    "normalized_rule": "Raised edges on both sides of ramp are minimum 100 mm high.",
    "value": "raised_edge_min_mm=100",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_ramp_tactile_warning",
    "source_card_id": "sc-bp344-ramp-tactile-traffic-2024-p3",
    "page_locator": "3",
    "section_locator": "Appendix A, A.1 Accessible Ramps",
    "exact_quote": "Ramps shall be provided with tactile warning strips at the head, foot, and landings. The warning tactile blocks shall have a depth of 600 mm and shall be installed: 1. 300 mm from the head and foot of the ramp and, 2. at the center of each landing.",
    "normalized_rule": "Ramp tactile warning blocks are 600 mm deep, 300 mm from head/foot, and centered at landings.",
    "value": "tactile_depth_mm=600; tactile_offset_from_head_foot_mm=300",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_ramp_vehicular_traffic_railing",
    "source_card_id": "sc-bp344-ramp-tactile-traffic-2024-p3",
    "page_locator": "3",
    "section_locator": "Appendix A, A.1 Accessible Ramps",
    "exact_quote": "Any ramp with a rise greater than 200 mm and leads down towards an area where vehicular traffic is possible, shall have a railing across the full width of its lower end, not less than 1800 mm from the foot of the ramp.",
    "normalized_rule": "Vehicular-risk downward ramps with rise >200 mm need a lower-end railing at least 1800 mm from ramp foot.",
    "value": "traffic_rise_trigger_mm=200; lower_railing_distance_from_foot_mm=1800",
    "classification": "code-mandated",
    "compliance_scope": "ramp_core",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_route_door_clear_width",
    "source_card_id": "sc-bp344-doors-clear-level-hardware-2024-p31-p33",
    "page_locator": "31-32",
    "section_locator": "Appendix C, C.2 Doors",
    "exact_quote": "All doors shall have a minimum clear width of 900 mm... For double-leaf doors, the minimum clear width shall be 1800 mm.",
    "normalized_rule": "Doors minimum clear width 900 mm; double-leaf doors minimum clear width 1800 mm.",
    "value": "door_clear_width_min_mm=900; double_leaf_clear_width_min_mm=1800",
    "classification": "code-mandated",
    "compliance_scope": "route_context",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_route_door_clear_level_space",
    "source_card_id": "sc-bp344-doors-clear-level-hardware-2024-p31-p33",
    "page_locator": "32",
    "section_locator": "Appendix C, C.2 Doors",
    "exact_quote": "A minimum clear level space of 1800 mm x 1800 mm shall be provided before and extending beyond a door; EXCEPTION: where a door shall open onto but not into a corridor, the required clear, level space on the corridor side of the door may be a minimum of 1500 mm corridor width.",
    "normalized_rule": "Door clear level space is 1800 mm x 1800 mm, with a corridor-side exception of 1500 mm corridor width.",
    "value": "door_clear_level_space_mm=1800x1800; corridor_exception_width_mm=1500",
    "classification": "code-mandated",
    "compliance_scope": "route_context",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_route_door_hardware_height",
    "source_card_id": "sc-bp344-doors-clear-level-hardware-2024-p31-p33",
    "page_locator": "33",
    "section_locator": "Appendix C, C.2 Doors",
    "exact_quote": "Door handles, pulls, latches and lever type locksets (doorknob) shall be at 900 mm (centered) above floor finish level.",
    "normalized_rule": "Door hardware is centered at 900 mm above finished floor level.",
    "value": "hardware_center_height_mm=900",
    "classification": "code-mandated",
    "compliance_scope": "route_context",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_route_corridor_clear_width",
    "source_card_id": "sc-bp344-corridors-turnabout-2024-p35",
    "page_locator": "35",
    "section_locator": "Appendix C, C.5 Corridors",
    "exact_quote": "Corridors shall have minimum clear width of 1500 mm to allow a wheelchair user and a person without disabilities to pass.",
    "normalized_rule": "Accessible corridors have minimum clear width of 1500 mm.",
    "value": "corridor_clear_width_min_mm=1500",
    "classification": "code-mandated",
    "compliance_scope": "route_context",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  },
  {
    "source_rule_id": "bp344_route_turnabout_space",
    "source_card_id": "sc-bp344-corridors-turnabout-2024-p35",
    "page_locator": "35",
    "section_locator": "Appendix C, C.5 Corridors",
    "exact_quote": "Turnabout spaces shall be provided for wheelchairs to turn around; these spaces shall have a minimum dimension of 1800 mm x 1800 mm and shall be spaced at a maximum of 12000 mm. Turnabout spaces shall also be provided at or within 3500 mm of every dead-end corridor.",
    "normalized_rule": "Wheelchair turnabout spaces are minimum 1800 mm x 1800 mm, spaced at maximum 12000 mm, and within 3500 mm of every dead-end corridor.",
    "value": "turnabout_space_mm=1800x1800; turnabout_spacing_max_mm=12000; turnabout_dead_end_distance_mm=3500",
    "classification": "code-mandated",
    "compliance_scope": "route_context",
    "source_candidate_id": "src_candidate_bp_344_accessibility_01",
    "source_sha256": "63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953",
    "document_path": "vitruvius-connection/001_Raw-Source-Layer/001-Laws/BP-344/2024 Revised Implementing Rules and Regulations Batas Pambansa Blg. 344 _ National Council on Disability Affairs.pdf",
    "human_review_status": "AI_EXTRACTED_LOCAL_RAW_SOURCE_PENDING_HUMAN_APPROVAL",
    "fail_closed_when_source_missing": true
  }
] as const satisfies readonly SourceTruthRule[]

const HUMAN_APPROVED_STATUS = 'HUMAN_APPROVED'

export interface Bp344RampSourceGateStatus {
  status: SourceGateStatus
  canShowSourceBackedCompliance: boolean
  pendingCount: number
  missingMetadataCount: number
}

const hasCompleteSourceMetadata = (rule: SourceTruthRule): boolean =>
  BP344_RAMP_REQUIRED_SOURCE_RULE_FIELDS.every((field) => Boolean(rule[field]))

export const getBp344RampSourceGateStatus = (
  rules: readonly SourceTruthRule[] = BP344_RAMP_SOURCE_RULES,
): Bp344RampSourceGateStatus => {
  const missingMetadataCount = rules.filter((rule) => !hasCompleteSourceMetadata(rule)).length
  const pendingCount = rules.filter((rule) => rule.human_review_status !== HUMAN_APPROVED_STATUS).length

  if (missingMetadataCount > 0) {
    return {
      status: 'SOURCE_INCOMPLETE',
      canShowSourceBackedCompliance: false,
      pendingCount,
      missingMetadataCount,
    }
  }

  if (pendingCount > 0) {
    return {
      status: 'SOURCE_PENDING',
      canShowSourceBackedCompliance: false,
      pendingCount,
      missingMetadataCount,
    }
  }

  return {
    status: 'SOURCE_READY',
    canShowSourceBackedCompliance: true,
    pendingCount,
    missingMetadataCount,
  }
}

export const BP344_RAMP_SOURCE_RULE_BY_ID: ReadonlyMap<string, SourceTruthRule> = new Map(
  BP344_RAMP_SOURCE_RULES.map((rule) => [rule.source_rule_id, rule]),
)
