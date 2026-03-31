export interface AccessibilityRow {
  elem: string
  old: string
  n: string
  src: string
  detail: string
}

/**
 * Canonical BP 344 accessibility standard changes (2013 → 2024 IRR).
 * Used as the source of truth when updating the article's MDX content
 * via the rows prop on <AccessibilityChangesTable />.
 */
export const ACCESSIBILITY_CHANGES: AccessibilityRow[] = [
  { elem: 'Door — clear level space', old: '1,500 × 1,500 mm', n: '1,800 × 1,800 mm', src: 'C.2.6', detail: 'The turning circle grew. The 2024 IRR aligns the door approach space with the full wheelchair turning diameter of 1,800 mm. The approach alcove in front of every accessible door must be 300 mm deeper than older plans show.' },
  { elem: 'Door — corridor exception', old: '1,200 mm corridor side', n: '1,500 mm corridor side', src: 'C.2.6 exception', detail: 'Where a door opens onto a corridor (not into it), the minimum corridor width on that side was raised from 1,200 mm to 1,500 mm — consistent with the new single-wheelchair corridor standard.' },
  { elem: 'Door closer — interior max force', old: '4.0 kg', n: '2.0 kg', src: 'C.2.4', detail: 'Interior door closers now have a tighter force limit. 4.0 kg is the old value; using it in an answer will be marked wrong.' },
  { elem: 'Door — secondary peephole height', old: '1,100 mm', n: '1,000 mm', src: 'C.2.14', detail: 'Lowered 100 mm to better match wheelchair eye level per updated anthropometric data in the 2024 IRR.' },
  { elem: 'Threshold — maximum height', old: '19 mm', n: '12 mm', src: 'C.3.1', detail: 'Major change. The threshold maximum was lowered by 7 mm. Bevel is still required if threshold exceeds 6 mm. Any threshold between 12 mm and 19 mm that was compliant under the old IRR is now non-compliant.' },
  { elem: 'Switch — height range', old: '920–1,200 mm', n: '900–1,200 mm', src: 'C.4.1', detail: 'Minor correction — the lower bound moved from 920 mm to 900 mm. Small difference but could appear in a pattern-recognition question.' },
  { elem: 'Corridor — single wheelchair + ambulant', old: '1,200 mm', n: '1,500 mm', src: 'C.5.1', detail: 'Most significant corridor change. A 300 mm increase in the minimum corridor width. Older review materials universally state 1,200 mm — this is now wrong.' },
  { elem: 'Corridor — turnabout dimensions', old: '1,500 × 1,500 mm', n: '1,800 × 1,800 mm', src: 'C.5.2', detail: 'Turnabouts must now accommodate the full 1,800 mm turning diameter. The old 1,500 × 1,500 mm standard is superseded.' },
  { elem: 'Toilet cubicle — minimum dimensions', old: '1,700 × 1,800 mm', n: '1,800 × 1,800 mm', src: 'C.6.3.a', detail: 'The cubicle is now a square. The old asymmetric 1,700 × 1,800 mm plan is superseded. Any question or scenario using 1,700 mm as a cubicle dimension is testing the wrong value.' },
  { elem: 'WC centerline from finished wall', old: '750 mm (ambiguous)', n: '450 mm', src: 'C.6.3.d', detail: 'The 2024 IRR explicitly states: WC shall be installed 450 mm from the finished face of the sidewall to the WC centerline. The grab bar outer face to wall is 100 mm (C.6.3.c), and grab bar face to WC CL is 350 mm.' },
  { elem: 'Turning space outside cubicle', old: '2.25 sq.m / min 1,500 mm', n: '1,800 × 1,800 mm', src: 'C.6.3.i', detail: 'Now expressed as a specific square dimension rather than area + minimum. Consistent with the full wheelchair turning space standard throughout the 2024 IRR.' },
  { elem: 'Grab bar — height above toilet seat', old: '280–300 mm (range)', n: '300 mm (exact)', src: 'C.6.3.b', detail: 'The range was tightened to a single value. 280 mm is no longer compliant under the 2024 IRR. Only 300 mm above the seat top.' },
  { elem: 'Grab bar — diameter', old: '38–45 mm', n: '30–40 mm', src: 'A.5.6', detail: 'The diameter range shifted down and narrowed. 45 mm is no longer compliant. The 2024 IRR aligns with international standards for graspability.' },
  { elem: 'Urinal — maximum lip height', old: '480 mm', n: '350–400 mm', src: 'C.6.12', detail: 'Major change. The urinal lip was lowered by 80–130 mm. 480 mm is now non-compliant. This change brings the standard closer to seated wheelchair user reach.' },
  { elem: 'Urinal — clear floor space', old: '750 × 1,200 mm', n: '900 × 900 mm', src: 'C.6.12', detail: 'The clear floor space shape changed from a deep rectangle to a square. The minimum width increased from 750 mm to 900 mm.' },
  { elem: 'Roll-in shower — dimensions', old: '1,500 × 1,500 mm', n: '1,800 × 1,800 mm', src: 'C.6.22', detail: 'Consistent with the full-standard turning space upgrade throughout the 2024 IRR.' },
  { elem: 'Roll-in shower — curb maximum', old: '10 mm', n: '12 mm', src: 'C.6.22', detail: 'Minor increase. The bevel requirement still applies above a certain height.' },
  { elem: 'Vestibule — level area', old: '1,800 × 1,500 mm', n: '1,800 × 1,800 mm', src: 'C.1.4', detail: 'The vestibule width was raised from 1,500 mm to 1,800 mm — consistent with the turning space upgrade throughout the code.' },
  { elem: 'Door-mounted signage size', old: '100 × 100 mm', n: '200 × 200 mm', src: 'A.7.7', detail: 'The ISA symbol size on accessible toilet doors doubled. Any question with 100 × 100 mm as a signage option is testing the old value.' },
  { elem: 'Signage — wall/door mounting height', old: '1,400–1,600 mm range', n: '1,500 mm max (to center)', src: 'A.7.6', detail: 'The 2024 IRR states: maximum height of 1,500 mm from the finished floor to the center of the sign. Expressed as a ceiling, not a range.' },
]
