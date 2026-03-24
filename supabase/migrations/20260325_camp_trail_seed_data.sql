-- ============================================================
-- Migration: Camp Trail Seed Data
-- Date: 2026-03-25
-- Purpose: Populate camp_trails, trail_days, and trail_steps
--          with 22 trails including full day/step structure for
--          the 8-Week Standard (flagship) and ALE Starter trails.
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 1: TIME-GATED PROGRAMS (6 trails)
-- ============================================================

-- 1a. 2-Week Intensive
INSERT INTO public.camp_trails (
  discipline_id, name, slug, description, trail_type, intensity,
  duration_days, daily_time_estimate_minutes, is_published, is_featured,
  is_free, subjects_covered, recommended_min_score, recommended_max_score
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '2-Week Intensive',
  '2-week-intensive',
  'Final sprint. Heavy daily load for imminent exams. Strong baseline needed.',
  'time_gated', 'intensive',
  14, 180, true, false,
  false,
  ARRAY['Building Laws','Fire & Life Safety','Structural Design','Materials & Methods','MEPF Utilities','History & Theory','Planning','Professional Practice'],
  60.0, 100.0
) ON CONFLICT (slug) DO NOTHING;

-- 1b. 4-Week Accelerated
INSERT INTO public.camp_trails (
  discipline_id, name, slug, description, trail_type, intensity,
  duration_days, daily_time_estimate_minutes, is_published, is_featured,
  is_free, subjects_covered, recommended_min_score, recommended_max_score
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '4-Week Accelerated',
  '4-week-accelerated',
  'Solid foundation with targeted gap closure for mid-range timelines.',
  'time_gated', 'accelerated',
  28, 120, true, false,
  false,
  ARRAY['Building Laws','Fire & Life Safety','Structural Design','Materials & Methods','MEPF Utilities','History & Theory','Planning','Professional Practice'],
  45.0, 75.0
) ON CONFLICT (slug) DO NOTHING;

-- 1c. 8-Week Standard Trail (FLAGSHIP -- fully seeded below)
INSERT INTO public.camp_trails (
  discipline_id, name, slug, description, trail_type, intensity,
  duration_days, daily_time_estimate_minutes, is_published, is_featured,
  is_free, subjects_covered, recommended_min_score, recommended_max_score
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '8-Week Standard Trail',
  '8-week-standard',
  'The foundation-to-mastery path. Balanced coverage across all 8 ALE subjects with progressive difficulty.',
  'time_gated', 'standard',
  56, 90, true, true,
  false,
  ARRAY['Building Laws','Fire & Life Safety','Structural Design','Materials & Methods','MEPF Utilities','History & Theory','Planning','Professional Practice'],
  30.0, 70.0
) ON CONFLICT (slug) DO NOTHING;

-- 1d. 12-Week Comprehensive
INSERT INTO public.camp_trails (
  discipline_id, name, slug, description, trail_type, intensity,
  duration_days, daily_time_estimate_minutes, is_published, is_featured,
  is_free, subjects_covered, recommended_min_score, recommended_max_score
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '12-Week Comprehensive',
  '12-week-comprehensive',
  'Full syllabus rebuild for scores below 50%. Deep coverage of every subject.',
  'time_gated', 'comprehensive',
  84, 90, true, false,
  false,
  ARRAY['Building Laws','Fire & Life Safety','Structural Design','Materials & Methods','MEPF Utilities','History & Theory','Planning','Professional Practice'],
  0.0, 50.0
) ON CONFLICT (slug) DO NOTHING;

-- 1e. 6-Month Undergraduate
INSERT INTO public.camp_trails (
  discipline_id, name, slug, description, trail_type, intensity,
  duration_days, daily_time_estimate_minutes, is_published, is_featured,
  is_free, subjects_covered, recommended_min_score, recommended_max_score
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '6-Month Undergraduate',
  '6-month-undergraduate',
  'Long-horizon program for architecture students. Low daily load, steady coverage.',
  'time_gated', 'undergraduate',
  180, 45, true, false,
  false,
  ARRAY['Building Laws','Fire & Life Safety','Structural Design','Materials & Methods','MEPF Utilities','History & Theory','Planning','Professional Practice'],
  0.0, 40.0
) ON CONFLICT (slug) DO NOTHING;

-- 1f. ALE Starter Trail (FREE, fully seeded below)
INSERT INTO public.camp_trails (
  discipline_id, name, slug, description, trail_type, intensity,
  duration_days, daily_time_estimate_minutes, is_published, is_featured,
  is_free, subjects_covered, recommended_min_score, recommended_max_score
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'ALE Starter Trail',
  'ale-starter',
  'Free 28-day program covering highest-frequency content across all 8 subjects. Genuine improvement, no paywall.',
  'time_gated', 'standard',
  28, 60, true, true,
  true,
  ARRAY['Building Laws','Fire & Life Safety','Structural Design','Materials & Methods','MEPF Utilities','History & Theory','Planning','Professional Practice'],
  0.0, 100.0
) ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SECTION 2: SUBJECT MASTERY PATHS (8 trails)
-- ============================================================

INSERT INTO public.camp_trails (
  discipline_id, name, slug, description, trail_type, intensity,
  duration_days, daily_time_estimate_minutes, is_published, is_featured,
  is_free, subjects_covered
) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'History of Architecture', 'subject-history',
   'Deep dive into architectural history from ancient civilizations through modern Filipino architecture.',
   'subject_mastery', NULL, 14, 60, true, false, false,
   ARRAY['History & Theory']),

  ('a0000000-0000-0000-0000-000000000001',
   'Theory of Architecture', 'subject-theory',
   'Principles of design, form, space, and order. Theoretical foundations for the ALE exam.',
   'subject_mastery', NULL, 14, 60, true, false, false,
   ARRAY['History & Theory']),

  ('a0000000-0000-0000-0000-000000000001',
   'Theory & Principles of Planning', 'subject-planning',
   'Site analysis, zoning, land use, circulation systems, and urban design principles.',
   'subject_mastery', NULL, 14, 60, true, false, false,
   ARRAY['Planning']),

  ('a0000000-0000-0000-0000-000000000001',
   'Architectural Practice & Jurisprudence', 'subject-practice',
   'RA 9266 provisions, contracts, professional ethics, and project management essentials.',
   'subject_mastery', NULL, 14, 60, true, false, false,
   ARRAY['Professional Practice']),

  ('a0000000-0000-0000-0000-000000000001',
   'Structural Design', 'subject-structural',
   'Load analysis, seismic design, beam and column sizing, and NSCP 2015 provisions.',
   'subject_mastery', NULL, 14, 60, true, false, false,
   ARRAY['Structural Design']),

  ('a0000000-0000-0000-0000-000000000001',
   'Building Materials & Construction', 'subject-materials',
   'Concrete, steel, timber, masonry, and modern composites. Properties, grades, and applications.',
   'subject_mastery', NULL, 14, 60, true, false, false,
   ARRAY['Materials & Methods']),

  ('a0000000-0000-0000-0000-000000000001',
   'Building Utilities / MEPF', 'subject-utilities',
   'Mechanical, electrical, plumbing, and fire protection systems. Sizing, codes, and integration.',
   'subject_mastery', NULL, 14, 60, true, false, false,
   ARRAY['MEPF Utilities']),

  ('a0000000-0000-0000-0000-000000000001',
   'Architectural Design & Site Planning', 'subject-design',
   'Design methodology, site planning principles, building codes, and spatial programming.',
   'subject_mastery', NULL, 14, 60, true, false, false,
   ARRAY['Building Laws'])
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SECTION 3: CODE DEEP-DIVES (8 trails)
-- ============================================================

INSERT INTO public.camp_trails (
  discipline_id, name, slug, description, trail_type, intensity,
  duration_days, daily_time_estimate_minutes, is_published, is_featured,
  is_free, subjects_covered
) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'PD 1096 -- National Building Code', 'code-pd1096',
   'Complete walkthrough of PD 1096: occupancy classifications, fire zones, setbacks, parking, light and ventilation.',
   'code_deep_dive', NULL, 14, 60, true, false, false,
   ARRAY['Building Laws','Fire & Life Safety']),

  ('a0000000-0000-0000-0000-000000000001',
   'RA 9514 -- Revised Fire Code', 'code-ra9514',
   'Fire safety requirements, travel distances, exit provisions, sprinkler systems, and fire alarm standards.',
   'code_deep_dive', NULL, 14, 60, true, false, false,
   ARRAY['Fire & Life Safety']),

  ('a0000000-0000-0000-0000-000000000001',
   'BP 344 -- Accessibility Law', 'code-bp344',
   'Accessibility standards for buildings: ramps, signage, restrooms, parking, and universal design provisions.',
   'code_deep_dive', NULL, 14, 60, true, false, false,
   ARRAY['Building Laws']),

  ('a0000000-0000-0000-0000-000000000001',
   'NSCP 2015 -- National Structural Code', 'code-nscp2015',
   'Structural design provisions: seismic zones, wind loads, concrete design, steel connections, and load combinations.',
   'code_deep_dive', NULL, 14, 60, true, false, false,
   ARRAY['Structural Design']),

  ('a0000000-0000-0000-0000-000000000001',
   'RA 9266 -- Architecture Act', 'code-ra9266',
   'The Architecture Act of 2004: scope of practice, licensure requirements, professional ethics, and board regulations.',
   'code_deep_dive', NULL, 14, 60, true, false, false,
   ARRAY['Professional Practice']),

  ('a0000000-0000-0000-0000-000000000001',
   'PEC -- Philippine Electrical Code', 'code-pec',
   'Electrical system design: load calculations, wiring methods, grounding, overcurrent protection, and panel sizing.',
   'code_deep_dive', NULL, 14, 60, true, false, false,
   ARRAY['MEPF Utilities']),

  ('a0000000-0000-0000-0000-000000000001',
   'National Plumbing Code', 'code-plumbing',
   'Plumbing design: fixture units, drainage, venting, water supply sizing, and sanitary system requirements.',
   'code_deep_dive', NULL, 14, 60, true, false, false,
   ARRAY['MEPF Utilities']),

  ('a0000000-0000-0000-0000-000000000001',
   'PD 957 / BP 220 -- Housing Standards', 'code-housing',
   'Subdivision and housing standards: lot sizes, open spaces, road widths, and socialized housing provisions.',
   'code_deep_dive', NULL, 14, 60, true, false, false,
   ARRAY['Planning','Building Laws'])
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SECTION 4: 8-WEEK STANDARD TRAIL -- FULL DAY & STEP SEEDING
-- ============================================================

DO $$
DECLARE
  v_trail_id uuid;
  v_day_id uuid;
BEGIN

  -- Look up the trail we just inserted
  SELECT trail_id INTO v_trail_id
    FROM public.camp_trails WHERE slug = '8-week-standard';

  IF v_trail_id IS NULL THEN
    RAISE EXCEPTION '8-week-standard trail not found';
  END IF;

  -- --------------------------------------------------------
  -- WEEK 1-2: FOUNDATIONS -- Building Laws & Accessibility
  -- --------------------------------------------------------

  -- Day 1: Building Laws -- PD 1096 Occupancy Classifications
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 1, 'PD 1096: Occupancy Classifications', 'Learn the building occupancy types and their requirements under the National Building Code.', 90, 'Building Laws', '#1B3FC4', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: PD 1096 Occupancy Classifications', 'Read about the 10 occupancy groups and their fire-resistive requirements.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Recall Quiz', 'Identify occupancy types from building descriptions.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Classify Sample Buildings', 'Practice classifying buildings into PD 1096 occupancy groups.', 15, true, 'guided')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 2: Building Laws -- PD 1096 Fire Zones
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 2, 'PD 1096: Fire Zones & Resistive Ratings', 'Understand fire zone classifications and required fire-resistive ratings.', 90, 'Building Laws', '#1B3FC4', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: Fire Zones & Construction Types', 'Study the fire zone map and construction type requirements.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Recall Quiz', 'Match fire zones to allowed construction types.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Fire Zone Determination Exercise', 'Determine fire zones for given site locations and building uses.', 15, true, 'guided')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 3: Building Laws -- PD 1096 Setbacks & Yards
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 3, 'PD 1096: Setbacks, Yards & Courts', 'Required setbacks, yard dimensions, and court specifications.', 90, 'Building Laws', '#1B3FC4', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: Setbacks, Yards & Courts', 'Study minimum setback requirements by building type and location.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Application Quiz', 'Calculate required setbacks for given lot conditions.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Reinforce occupancy, fire zones, and setback concepts.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 4: Building Laws -- PD 1096 Parking & Loading
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 4, 'PD 1096: Parking & Loading Requirements', 'Off-street parking ratios, loading berth requirements, and driveway standards.', 90, 'Building Laws', '#1B3FC4', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: Parking & Loading Standards', 'Review parking slot calculations and loading berth minimums.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Application Quiz', 'Compute parking requirements for various occupancy types.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Parking Layout Exercise', 'Sketch a compliant parking layout for a sample commercial building.', 15, true, 'guided')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 5: Building Laws -- BP 344 Accessibility
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 5, 'BP 344: Accessibility Standards', 'Ramps, signage, restrooms, and universal design under the Accessibility Law.', 90, 'Building Laws', '#1B3FC4', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: BP 344 Accessibility Provisions', 'Study ramp slopes, doorway widths, and signage requirements.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Recall Quiz', 'Identify accessibility violations in floor plan scenarios.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 6: Building Laws -- PD 1096 Light & Ventilation
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 6, 'PD 1096: Light & Ventilation', 'Natural light requirements, window-to-floor ratios, and ventilation standards.', 90, 'Building Laws', '#1B3FC4', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: Light & Ventilation Standards', 'Review window area ratios and mechanical ventilation triggers.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Application Quiz', 'Calculate window-to-floor area ratios and ventilation compliance.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Reinforce parking, accessibility, and light/ventilation concepts.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 7: REST DAY
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 7, 'Rest Day', 'Take a break. Let the material consolidate.', 0, NULL, NULL, true, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- Day 8: Fire & Life Safety -- RA 9514 Travel Distances
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 8, 'RA 9514: Travel Distances & Exit Access', 'Maximum travel distances, dead-end corridors, and exit access requirements.', 90, 'Fire & Life Safety', '#E63329', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: Travel Distance Standards', 'Study maximum travel distances by occupancy and sprinkler status.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Fire & Life Safety -- Recall Quiz', 'Determine compliant travel distances for various building scenarios.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Travel Distance Measurement Exercise', 'Trace egress paths on floor plans and verify compliance.', 15, true, 'guided')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 9: Fire & Life Safety -- RA 9514 Fire Exits
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 9, 'RA 9514: Fire Exits & Stairways', 'Exit width calculations, stair dimensions, and number of required exits.', 90, 'Fire & Life Safety', '#E63329', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: Fire Exit Requirements', 'Review stairway widths, exit door swing direction, and minimum exits.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Fire & Life Safety -- Application Quiz', 'Calculate required exit widths and stair count for given occupant loads.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Consolidate fire safety travel distances and exit provisions.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 10: Fire & Life Safety -- Sprinkler Systems
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 10, 'RA 9514: Sprinkler & Suppression Systems', 'Automatic sprinkler requirements, standpipe systems, and suppression alternatives.', 90, 'Fire & Life Safety', '#E63329', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: Sprinkler Systems', 'Study sprinkler head types, spacing, and when systems are mandatory.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Fire & Life Safety -- Recall Quiz', 'Identify which buildings require automatic sprinklers.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Sprinkler Layout Planning', 'Design a basic sprinkler coverage plan for a sample floor.', 15, true, 'guided')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 11: Fire & Life Safety -- Fire Alarm & Detection
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 11, 'RA 9514: Fire Alarm & Detection', 'Fire alarm systems, smoke detectors, notification appliances, and inspection requirements.', 90, 'Fire & Life Safety', '#E63329', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: Alarm & Detection Systems', 'Review detector placement, alarm notification, and central station monitoring.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Fire & Life Safety -- Recall Quiz', 'Match detector types to appropriate building locations.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 12: Fire & Life Safety -- Fire Safety Inspection & Permits
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 12, 'RA 9514: Inspection & Fire Safety Permits', 'Fire Safety Evaluation Clearance, FSIC requirements, and inspection protocols.', 90, 'Fire & Life Safety', '#E63329', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: Permits & Inspection Process', 'Study FSIC application, inspection checklists, and compliance certificates.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Fire & Life Safety -- Application Quiz', 'Determine FSIC requirements for sample building permits.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Reinforce sprinkler, alarm, and inspection concepts.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 13: Week 1-2 Comprehensive Review
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 13, 'Week 1-2 Comprehensive Review', 'Mixed review covering Building Laws and Fire & Life Safety.', 50, 'Building Laws', '#1B3FC4', false, false, 'Foundations')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 1, 'review', 'Week 1-2 Comprehensive Review', 'Review all Building Laws and Fire & Life Safety topics from weeks 1-2.', 15, 30)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 2, 'quiz', 'Mixed-Subject Practice', 'Interleaved questions spanning all topics covered so far.', 10, 20)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 14: REST DAY + Phase Transition
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 14, 'Rest Day', 'Rest and transition. Next phase: Gap Targeting with Structural Design & Materials.', 0, NULL, NULL, true, true, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- --------------------------------------------------------
  -- WEEK 3-4: GAP TARGETING -- Structural & Materials
  -- --------------------------------------------------------

  -- Day 15: Structural Design -- Seismic Zones
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 15, 'Structural: Seismic Zones & Earthquake Forces', 'Philippine seismic zone map, near-source factors, and base shear calculations.', 90, 'Structural Design', '#E8853A', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Seismic Zones & Forces', 'Study the PH seismic zone map and earthquake force parameters.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Application Quiz', 'Compute base shear and seismic zone factors for sample structures.', 10, 20, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Seismic Force Calculation Lab', 'Step-by-step base shear computation for a 5-story building.', 15, true, 'faded')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 16: Structural Design -- Load Types & Combinations
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 16, 'Structural: Load Types & Combinations', 'Dead loads, live loads, wind loads, and NSCP load combination formulas.', 90, 'Structural Design', '#E8853A', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Load Types & Combinations', 'Review dead, live, wind, and seismic loads with NSCP combination formulas.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Recall Quiz', 'Identify load types and apply correct combination factors.', 10, 20, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 17: Structural Design -- Beam Design Basics
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 17, 'Structural: Beam Design Fundamentals', 'Flexural analysis, moment diagrams, and reinforced concrete beam sizing.', 90, 'Structural Design', '#E8853A', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Beam Design Fundamentals', 'Study flexural analysis concepts and RC beam sizing procedures.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Application Quiz', 'Size reinforced concrete beams for given loading conditions.', 10, 20, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Reinforce seismic zones, load combinations, and beam design.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 18: Structural Design -- Column Design
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 18, 'Structural: Column Design & Axial Loads', 'Tied and spiral columns, axial load capacity, and slenderness effects.', 90, 'Structural Design', '#E8853A', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Column Design', 'Review column types, interaction diagrams, and reinforcement detailing.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Application Quiz', 'Determine column capacity and reinforcement ratios for sample conditions.', 10, 20, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Column Sizing Lab', 'Size a column for a given tributary area and floor loads.', 15, true, 'faded')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 19: Structural Design -- Truss Analysis
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 19, 'Structural: Truss Analysis & Member Forces', 'Method of joints, method of sections, and common truss configurations.', 90, 'Structural Design', '#E8853A', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Truss Analysis Methods', 'Study method of joints and sections for determining member forces.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Application Quiz', 'Solve for member forces in common truss configurations.', 10, 20, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 20: Structural Design -- Foundation Design
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 20, 'Structural: Foundation Types & Bearing Capacity', 'Spread footings, pile foundations, soil bearing capacity, and settlement.', 90, 'Structural Design', '#E8853A', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Foundation Types', 'Review spread footings, piles, and soil bearing capacity calculations.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Application Quiz', 'Size footings for given column loads and soil bearing capacities.', 10, 20, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Consolidate column design, truss analysis, and foundation concepts.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 21: REST DAY
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 21, 'Rest Day', 'Recover and prepare for Materials & Methods.', 0, NULL, NULL, true, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- Day 22: Materials & Methods -- Concrete Mixes & Properties
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 22, 'Materials: Concrete Mixes & Properties', 'Mix proportions, compressive strength, slump testing, and curing methods.', 90, 'Materials & Methods', '#1B7A3C', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Concrete Properties', 'Study mix design ratios, slump values, and curing requirements.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Methods -- Recall Quiz', 'Match concrete mixes to their applications and strength requirements.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Concrete Mix Proportioning', 'Compute a concrete mix design for a given target strength.', 15, true, 'faded')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 23: Materials & Methods -- Steel Properties & Connections
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 23, 'Materials: Steel Properties & Connections', 'Steel grades, yield strength, weld types, and bolt specifications.', 90, 'Materials & Methods', '#1B7A3C', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Steel & Connections', 'Review steel grades, structural shapes, weld symbols, and bolt types.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Methods -- Recall Quiz', 'Identify steel grades, connection types, and weld specifications.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 24: Materials & Methods -- Timber Grades & Construction
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 24, 'Materials: Timber Grades & Wood Construction', 'Philippine timber species, grading systems, and wood framing methods.', 90, 'Materials & Methods', '#1B7A3C', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Timber & Wood Construction', 'Study PH timber species groups, stress grades, and framing techniques.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Methods -- Application Quiz', 'Determine appropriate timber grades and sizes for structural members.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Reinforce concrete, steel, and timber material properties.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 25: Materials & Methods -- Masonry Types & Applications
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 25, 'Materials: Masonry Types & Wall Systems', 'CHB, clay bricks, stone masonry, mortar types, and wall construction.', 90, 'Materials & Methods', '#1B7A3C', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Masonry & Wall Systems', 'Review masonry unit types, mortar classifications, and wall bonding patterns.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Methods -- Recall Quiz', 'Match masonry types to their load-bearing and finish applications.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Wall System Comparison', 'Compare CHB, clay brick, and dry-stack systems for a sample project.', 15, true, 'faded')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 26: Materials & Methods -- Finishing Materials & Waterproofing
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 26, 'Materials: Finishing & Waterproofing', 'Paints, sealants, roofing materials, waterproofing membranes, and insulation.', 90, 'Materials & Methods', '#1B7A3C', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Finishing & Waterproofing', 'Study paint systems, roofing assemblies, and waterproofing methods.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Methods -- Application Quiz', 'Select appropriate finishes and waterproofing for given conditions.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 27: Week 3-4 Comprehensive Review
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 27, 'Week 3-4 Comprehensive Review', 'Mixed review covering Structural Design and Materials & Methods.', 50, 'Structural Design', '#E8853A', false, false, 'Gap Targeting')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 1, 'review', 'Week 3-4 Comprehensive Review', 'Review all Structural Design and Materials & Methods topics from weeks 3-4.', 15, 30)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 2, 'quiz', 'Mixed-Subject Practice', 'Interleaved questions spanning structural and materials topics.', 10, 20)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 28: REST DAY + Phase Transition
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 28, 'Rest Day', 'Rest and transition. Next phase: Application with MEPF, History, and Planning.', 0, NULL, NULL, true, true, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- --------------------------------------------------------
  -- WEEK 5-6: APPLICATION -- MEPF, History, Planning, Practice
  -- --------------------------------------------------------

  -- Day 29: MEPF -- Fixture Unit Calculations
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 29, 'MEPF: Plumbing Fixture Units', 'Water supply fixture units, drainage fixture units, and pipe sizing.', 90, 'MEPF Utilities', '#534AB7', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'MEPF Utilities: Fixture Unit Calculations', 'Study WSFU/DFU tables and pipe diameter selection.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'MEPF Utilities -- Application Quiz', 'Calculate total fixture units and size supply/drainage pipes.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Pipe Sizing Exercise', 'Size the plumbing system for a sample 3-story residential building.', 15, true, 'sandbox')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 30: MEPF -- Electrical Load Calculations
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 30, 'MEPF: Electrical Load Calculations', 'Demand factors, branch circuits, feeder sizing, and panel schedules.', 90, 'MEPF Utilities', '#534AB7', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'MEPF Utilities: Electrical Load Calculations', 'Review PEC demand factors, circuit breaker sizing, and voltage drop limits.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'MEPF Utilities -- Application Quiz', 'Compute branch circuit loads and select appropriate wire sizes.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 31: MEPF -- HVAC Sizing & Systems
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 31, 'MEPF: HVAC Systems & Sizing', 'Cooling load estimation, equipment selection, duct sizing, and ventilation rates.', 90, 'MEPF Utilities', '#534AB7', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'MEPF Utilities: HVAC Systems', 'Study cooling load methods, equipment types, and duct sizing.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'MEPF Utilities -- Recall Quiz', 'Match HVAC system types to building applications and climate zones.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Reinforce plumbing, electrical, and HVAC concepts.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 32: MEPF -- Plumbing Drainage & Venting
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 32, 'MEPF: Drainage & Venting Systems', 'Sanitary drainage, storm drainage, vent sizing, and septic systems.', 90, 'MEPF Utilities', '#534AB7', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'MEPF Utilities: Drainage & Venting', 'Review drainage pipe sizing, vent stack requirements, and septic design.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'MEPF Utilities -- Application Quiz', 'Size drainage and vent pipes for a sample building layout.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Drainage System Layout', 'Design a sanitary drainage layout for a 2-story commercial space.', 15, true, 'sandbox')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 33: History & Theory -- Greek & Roman Architecture
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 33, 'History: Greek & Roman Architecture', 'Classical orders, temple typologies, Roman concrete, and civic architecture.', 90, 'History & Theory', '#F5A623', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'History & Theory: Greek & Roman Architecture', 'Study the Doric, Ionic, and Corinthian orders plus Roman construction innovations.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'History & Theory -- Recall Quiz', 'Identify classical orders and match structures to their periods.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 34: History & Theory -- Gothic, Renaissance & Baroque
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 34, 'History: Gothic, Renaissance & Baroque', 'Pointed arches, flying buttresses, Renaissance proportion, and Baroque drama.', 90, 'History & Theory', '#F5A623', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'History & Theory: Gothic to Baroque', 'Study structural innovations from Gothic through Baroque periods.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'History & Theory -- Recall Quiz', 'Identify architectural elements and match to period movements.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 35: REST DAY
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 35, 'Rest Day', 'Midweek recovery before Planning and Practice.', 0, NULL, NULL, true, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- Day 36: Planning -- Site Analysis & Zoning
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 36, 'Planning: Site Analysis & Zoning', 'Site inventory, CLUP zoning ordinances, land use classification, and constraints mapping.', 90, 'Planning', '#6B9B37', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Planning: Site Analysis & Zoning', 'Study site analysis methodology and Philippine zoning frameworks.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Planning -- Recall Quiz', 'Identify zoning classifications and site constraints from descriptions.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Site Analysis Checklist', 'Create a site analysis report for a sample lot.', 15, true, 'sandbox')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 37: Planning -- Land Use & Circulation
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 37, 'Planning: Land Use & Circulation Systems', 'Mixed-use development, vehicular and pedestrian circulation, and spatial hierarchy.', 90, 'Planning', '#6B9B37', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Planning: Land Use & Circulation', 'Review land use compatibility, road hierarchy, and pedestrian systems.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Planning -- Application Quiz', 'Evaluate site plans for land use conflicts and circulation issues.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 38: Planning -- Environmental Planning & Green Design
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 38, 'Planning: Environmental Planning & Sustainability', 'Climate-responsive design, BERDE green rating, and environmental impact.', 90, 'Planning', '#6B9B37', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Planning: Environmental Planning', 'Study tropical design strategies, green building standards, and EIS requirements.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Planning -- Recall Quiz', 'Match sustainable strategies to climate zones and building types.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Consolidate site analysis, circulation, and environmental planning.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 39: Planning -- Housing & Subdivision Standards
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 39, 'Planning: Housing & Subdivision Standards', 'PD 957 subdivision rules, BP 220 socialized housing, and open space requirements.', 90, 'Planning', '#6B9B37', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Planning: PD 957 & BP 220 Standards', 'Study subdivision lot sizes, road widths, and socialized housing provisions.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Planning -- Application Quiz', 'Verify subdivision layouts against PD 957 and BP 220 requirements.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 40: Professional Practice -- RA 9266 & Ethics
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 40, 'Practice: RA 9266 & Professional Ethics', 'Scope of practice, licensure requirements, code of ethics, and board regulations.', 90, 'Professional Practice', '#4A7B9D', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Professional Practice: RA 9266 Provisions', 'Study the Architecture Act: scope, licensure, CPD, and ethical guidelines.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Professional Practice -- Recall Quiz', 'Identify ethical violations and licensure requirements from case scenarios.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Ethics Case Analysis', 'Analyze real-world ethical dilemmas using the UAP Code of Ethics.', 15, true, 'sandbox')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 41: Week 5-6 Comprehensive Review
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 41, 'Week 5-6 Comprehensive Review', 'Mixed review covering MEPF, History, Planning, and Professional Practice.', 50, 'MEPF Utilities', '#534AB7', false, false, 'Application')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 1, 'review', 'Week 5-6 Comprehensive Review', 'Review all MEPF, History, Planning, and Practice topics from weeks 5-6.', 15, 30)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 2, 'quiz', 'Mixed-Subject Practice', 'Interleaved questions spanning weeks 5-6 material.', 10, 20)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 42: REST DAY + Phase Transition
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 42, 'Rest Day', 'Rest and transition. Final phase: Integration with mixed practice.', 0, NULL, NULL, true, true, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- --------------------------------------------------------
  -- WEEK 7-8: INTEGRATION -- Mixed Practice
  -- --------------------------------------------------------

  -- Day 43: Mixed -- Building Laws + History
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 43, 'Integration: Building Laws + History', 'Interleaved practice combining code provisions with architectural history.', 90, 'Building Laws', '#1B3FC4', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: PD 1096 Review Highlights', 'Quick review of the most-tested PD 1096 provisions.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Mixed Practice -- Building Laws & History', 'Interleaved questions from both subjects.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Cross-Subject Connections', 'Explore how historical building codes influenced modern PD 1096.', 15, true, 'sandbox')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 44: Mixed -- Fire Safety + MEPF
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 44, 'Integration: Fire Safety + MEPF', 'Fire protection systems integrated with mechanical and electrical provisions.', 90, 'Fire & Life Safety', '#E63329', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: Integrated Building Systems', 'Study how fire protection, electrical, and mechanical systems interact.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Mixed Practice -- Fire Safety & MEPF', 'Interleaved questions connecting fire and MEPF systems.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 45: Mixed -- Structural + Materials
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 45, 'Integration: Structural + Materials', 'Structural system selection driven by material properties and availability.', 90, 'Structural Design', '#E8853A', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Material Selection for Structures', 'Review how material choice affects structural system design.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Mixed Practice -- Structural & Materials', 'Interleaved questions on structural systems and material properties.', 10, 20, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Consolidate integration topics from days 43-45.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 46: Mixed -- Planning + Professional Practice
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 46, 'Integration: Planning + Practice', 'Urban planning principles integrated with professional practice requirements.', 90, 'Planning', '#6B9B37', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Planning: Practice-Informed Site Development', 'Review how professional obligations shape site planning decisions.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Mixed Practice -- Planning & Practice', 'Interleaved questions on planning and professional practice.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 47: Mixed -- Filipino Architecture + Modern Design
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 47, 'Integration: Filipino & Modern Architecture', 'Philippine vernacular architecture, tropical modernism, and contemporary Filipino design.', 90, 'History & Theory', '#F5A623', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'History & Theory: Filipino Architecture', 'Study bahay kubo, bahay na bato, Art Deco Manila, and tropical modernism.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'History & Theory -- Application Quiz', 'Identify Filipino architectural elements and their historical context.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 48: Mixed -- All Codes Integration
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 48, 'Integration: All Codes Cross-Reference', 'Cross-referencing PD 1096, RA 9514, BP 344, NSCP, and PEC provisions.', 90, 'Building Laws', '#1B3FC4', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: Code Cross-Reference Guide', 'Study how major codes interact for a single building project.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Mixed Practice -- Multi-Code Application', 'Apply multiple code provisions to a single building scenario.', 10, 20, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Past 3 Days', 'Consolidate integration topics from days 46-48.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 49: REST DAY
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 49, 'Rest Day', 'Final rest before the intensive review sprint.', 0, NULL, NULL, true, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- Day 50: Intensive Mixed -- Building Laws & Fire Safety Deep Review
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 50, 'Intensive: Building Laws & Fire Safety', 'Application-level questions on PD 1096, BP 344, and RA 9514 combined.', 90, 'Building Laws', '#1B3FC4', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: High-Yield Topics Review', 'Focus on the most frequently tested provisions across all building codes.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, difficulty_min, difficulty_max)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Advanced Application', 'High-difficulty scenario questions combining multiple code provisions.', 10, 20, 'morning', 0.5, 1.0)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, is_optional, lab_phase)
      VALUES (v_day_id, 3, 'lab', 'Code Compliance Audit', 'Audit a sample building design for multi-code compliance.', 15, true, 'sandbox')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 51: Intensive Mixed -- Structural & MEPF
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 51, 'Intensive: Structural & MEPF Systems', 'Application-level structural calculations and MEPF system integration.', 90, 'Structural Design', '#E8853A', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Key Formulas & Methods', 'Quick reference review of critical structural design formulas.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy, difficulty_min, difficulty_max)
      VALUES (v_day_id, 2, 'quiz', 'Structural & MEPF -- Advanced Application', 'Computation-heavy questions on structural and MEPF systems.', 10, 20, 'morning', true, 0.5, 1.0)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Days 50-51', 'Reinforce advanced application concepts.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 52: Intensive Mixed -- Materials & Planning
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 52, 'Intensive: Materials & Planning', 'Advanced material selection scenarios and site planning under constraints.', 90, 'Materials & Methods', '#1B7A3C', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Decision Matrix', 'Review material selection criteria for tropical climate conditions.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, difficulty_min, difficulty_max)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Planning -- Advanced Application', 'Scenario questions combining material selection with site planning.', 10, 20, 'morning', 0.5, 1.0)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 53: Intensive Mixed -- History & Professional Practice
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 53, 'Intensive: History & Professional Practice', 'Advanced history identification and professional practice scenarios.', 90, 'History & Theory', '#F5A623', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Professional Practice: Contracts & Project Management', 'Review contract types, project delivery methods, and fee structures.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, difficulty_min, difficulty_max)
      VALUES (v_day_id, 2, 'quiz', 'History & Practice -- Advanced Application', 'Scenario questions on historical identification and practice management.', 10, 20, 'morning', 0.5, 1.0)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 54: Intensive Mixed -- Full Spectrum Review
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 54, 'Intensive: Full Spectrum Exam Simulation', 'Exam-weight distribution across all 8 subjects. Timed practice.', 90, 'Professional Practice', '#4A7B9D', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'All Subjects: Exam Strategy & Time Management', 'Review exam format, section weights, and time allocation strategies.', 15, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, difficulty_min, difficulty_max)
      VALUES (v_day_id, 2, 'quiz', 'Full Spectrum -- Exam Simulation', 'Weighted questions across all 8 subjects simulating exam distribution.', 10, 20, 'morning', 0.3, 1.0)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 3, 'review', 'Review: Days 52-54', 'Final intensive review consolidation.', 5, 10)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 55: Full Review Day
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 55, 'Week 7-8 Comprehensive Review', 'Final comprehensive review across all 8 subjects before trail completion.', 50, 'Building Laws', '#1B3FC4', false, false, 'Integration')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 1, 'review', 'Week 7-8 Comprehensive Review', 'Final mixed review covering all integration topics and weak areas.', 15, 30)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 2, 'quiz', 'Mixed-Subject Practice', 'Final interleaved quiz across all 8 ALE subjects.', 10, 20)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 56: Final Integration + Phase Transition (Complete)
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day, is_phase_transition, phase_name)
    VALUES (v_trail_id, 56, 'Trail Complete: Final Integration', 'Celebrate your journey. Review your growth and identify any remaining areas for independent study.', 50, 'Professional Practice', '#4A7B9D', false, true, 'Complete')
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 1, 'review', 'Final Readiness Assessment', 'Comprehensive assessment to measure your growth across all subjects.', 15, 30)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, difficulty_min, difficulty_max)
      VALUES (v_day_id, 2, 'quiz', 'Final Exam Simulation', 'Full-weight exam simulation with ALE-proportioned subject distribution.', 10, 20, 0.3, 1.0)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

END $$;


-- ============================================================
-- SECTION 5: ALE STARTER TRAIL -- 28 DAYS FULLY SEEDED
-- ============================================================

DO $$
DECLARE
  v_trail_id uuid;
  v_day_id uuid;
BEGIN

  SELECT trail_id INTO v_trail_id
    FROM public.camp_trails WHERE slug = 'ale-starter';

  IF v_trail_id IS NULL THEN
    RAISE EXCEPTION 'ale-starter trail not found';
  END IF;

  -- --------------------------------------------------------
  -- Week 1: Building Laws & Fire Safety (Days 1-7)
  -- --------------------------------------------------------

  -- Day 1: Building Laws -- PD 1096 Occupancy
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 1, 'Building Laws: Occupancy Classifications', 'High-frequency topic: PD 1096 occupancy groups and their requirements.', 60, 'Building Laws', '#1B3FC4', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: PD 1096 Occupancy Groups', 'Overview of the 10 occupancy classifications.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Starter Quiz', 'Identify occupancy types from building descriptions.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 2: Building Laws -- Fire Zones & Setbacks
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 2, 'Building Laws: Fire Zones & Setbacks', 'Key provisions on fire zone mapping and required building setbacks.', 60, 'Building Laws', '#1B3FC4', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: Fire Zones & Setbacks', 'Fire zone classifications and minimum setback distances.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Starter Quiz', 'Determine setbacks and fire zones for sample lots.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 3: Building Laws -- BP 344 Accessibility
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 3, 'Building Laws: Accessibility (BP 344)', 'Ramp slopes, door widths, and accessible restroom requirements.', 60, 'Building Laws', '#1B3FC4', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Building Laws: BP 344 Key Provisions', 'Essential accessibility dimensions and requirements.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Building Laws -- Starter Quiz', 'Identify accessibility violations in floor plan scenarios.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 4: Fire & Life Safety -- Travel Distances & Exits
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 4, 'Fire Safety: Travel Distances & Exits', 'RA 9514 travel distance limits and exit width calculations.', 60, 'Fire & Life Safety', '#E63329', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: Exits & Travel Distances', 'Maximum travel distances and exit door requirements.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Fire Safety -- Starter Quiz', 'Calculate required exits and check travel distance compliance.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 5: Fire & Life Safety -- Sprinklers & Alarms
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 5, 'Fire Safety: Sprinklers & Alarm Systems', 'When sprinklers are required and fire alarm system basics.', 60, 'Fire & Life Safety', '#E63329', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: Sprinkler & Alarm Basics', 'Overview of automatic fire suppression and detection.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Fire Safety -- Starter Quiz', 'Determine sprinkler and alarm requirements for various buildings.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 6: Fire & Life Safety -- Permits & Inspection
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 6, 'Fire Safety: FSIC & Inspection', 'Fire Safety Inspection Certificates and compliance procedures.', 60, 'Fire & Life Safety', '#E63329', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Fire & Life Safety: FSIC Process', 'FSIC application process and inspection requirements.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Fire Safety -- Starter Quiz', 'Match FSIC requirements to building scenarios.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 7: Rest Day
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 7, 'Rest Day', 'Review week 1 notes and prepare for Structural Design.', 0, NULL, NULL, true)
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- --------------------------------------------------------
  -- Week 2: Structural Design & Materials (Days 8-14)
  -- --------------------------------------------------------

  -- Day 8: Structural -- Seismic Zones
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 8, 'Structural: Seismic Zones', 'Philippine seismic zone map and earthquake force basics.', 60, 'Structural Design', '#E8853A', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Seismic Zones Overview', 'Philippine seismic zone classifications and key parameters.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Starter Quiz', 'Identify seismic zones and basic earthquake force concepts.', 10, 25, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 9: Structural -- Load Types
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 9, 'Structural: Load Types & Combinations', 'Dead loads, live loads, and NSCP load combination formulas.', 60, 'Structural Design', '#E8853A', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Load Types', 'Overview of structural loads and basic combination formulas.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Starter Quiz', 'Identify load types and apply basic combination factors.', 10, 25, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 10: Structural -- Beam & Column Basics
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 10, 'Structural: Beam & Column Essentials', 'Key concepts in beam flexure and column axial capacity.', 60, 'Structural Design', '#E8853A', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Structural Design: Beams & Columns', 'Fundamental concepts of beam and column behavior.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time, is_computation_heavy)
      VALUES (v_day_id, 2, 'quiz', 'Structural Design -- Starter Quiz', 'Basic beam sizing and column capacity questions.', 10, 25, 'morning', true)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 11: Materials -- Concrete
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 11, 'Materials: Concrete Properties', 'Concrete mix proportions, compressive strength, and curing.', 60, 'Materials & Methods', '#1B7A3C', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Concrete Basics', 'Mix ratios, slump test, and curing methods overview.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Methods -- Starter Quiz', 'Match concrete mixes to applications.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 12: Materials -- Steel & Timber
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 12, 'Materials: Steel & Timber', 'Steel grades, structural shapes, timber species, and stress grades.', 60, 'Materials & Methods', '#1B7A3C', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Steel & Timber Basics', 'Common steel grades, shapes, and PH timber species groups.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Methods -- Starter Quiz', 'Identify steel and timber properties for given applications.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 13: Materials -- Masonry & Finishes
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 13, 'Materials: Masonry & Finishes', 'CHB, clay bricks, mortar types, and common finishing materials.', 60, 'Materials & Methods', '#1B7A3C', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Materials & Methods: Masonry & Finishes', 'Masonry units, mortar classifications, and finish types.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Materials & Methods -- Starter Quiz', 'Match masonry and finish types to their applications.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 14: Rest Day
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 14, 'Rest Day', 'Review week 2 notes and prepare for MEPF & History.', 0, NULL, NULL, true)
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- --------------------------------------------------------
  -- Week 3: MEPF & History (Days 15-21)
  -- --------------------------------------------------------

  -- Day 15: MEPF -- Plumbing Fixture Units
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 15, 'MEPF: Plumbing Basics', 'Fixture unit calculations and pipe sizing fundamentals.', 60, 'MEPF Utilities', '#534AB7', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'MEPF Utilities: Plumbing Fixture Units', 'Fixture unit tables and basic pipe sizing.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'MEPF Utilities -- Starter Quiz', 'Calculate fixture units for sample building layouts.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 16: MEPF -- Electrical Basics
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 16, 'MEPF: Electrical Load Basics', 'Branch circuits, demand factors, and basic load calculations.', 60, 'MEPF Utilities', '#534AB7', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'MEPF Utilities: Electrical Load Basics', 'PEC demand factors and circuit breaker sizing overview.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'MEPF Utilities -- Starter Quiz', 'Determine circuit sizes and wire gauges for basic loads.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 17: MEPF -- HVAC & Drainage
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 17, 'MEPF: HVAC & Drainage Overview', 'Cooling system types and sanitary drainage basics.', 60, 'MEPF Utilities', '#534AB7', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'MEPF Utilities: HVAC & Drainage', 'HVAC system types and drainage pipe sizing basics.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'MEPF Utilities -- Starter Quiz', 'Match HVAC systems to building types and size drainage pipes.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 18: History -- Greek & Roman
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 18, 'History: Greek & Roman Architecture', 'Classical orders, temple types, and Roman engineering feats.', 60, 'History & Theory', '#F5A623', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'History & Theory: Classical Architecture', 'Doric, Ionic, Corinthian orders and Roman innovations.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'History & Theory -- Starter Quiz', 'Identify classical orders and match structures to periods.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 19: History -- Gothic to Baroque
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 19, 'History: Medieval to Baroque', 'Gothic, Renaissance, and Baroque architectural movements.', 60, 'History & Theory', '#F5A623', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'History & Theory: Gothic to Baroque', 'Flying buttresses, Renaissance proportion, and Baroque drama.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'History & Theory -- Starter Quiz', 'Match architectural elements to their historical periods.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 20: History -- Filipino Architecture
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 20, 'History: Filipino Architecture', 'Bahay kubo, bahay na bato, and modern Filipino design.', 60, 'History & Theory', '#F5A623', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'History & Theory: Filipino Architecture', 'Vernacular, colonial, Art Deco, and tropical modernism.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'History & Theory -- Starter Quiz', 'Identify Filipino architectural styles and their historical context.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 21: Rest Day
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 21, 'Rest Day', 'Review week 3 notes and prepare for Planning & Practice.', 0, NULL, NULL, true)
    ON CONFLICT (trail_id, day_number) DO NOTHING;

  -- --------------------------------------------------------
  -- Week 4: Planning & Professional Practice (Days 22-28)
  -- --------------------------------------------------------

  -- Day 22: Planning -- Site Analysis
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 22, 'Planning: Site Analysis Basics', 'Site inventory, zoning, and constraints identification.', 60, 'Planning', '#6B9B37', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Planning: Site Analysis Fundamentals', 'Site analysis methodology and zoning basics.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Planning -- Starter Quiz', 'Identify zoning classifications and site constraints.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 23: Planning -- Land Use & Circulation
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 23, 'Planning: Land Use & Circulation', 'Land use compatibility and vehicular/pedestrian circulation.', 60, 'Planning', '#6B9B37', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Planning: Land Use & Circulation', 'Mixed-use principles and road hierarchy systems.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Planning -- Starter Quiz', 'Evaluate land use plans for compatibility and circulation issues.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 24: Planning -- Housing Standards
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 24, 'Planning: PD 957 & BP 220', 'Subdivision lot sizes, road widths, and socialized housing.', 60, 'Planning', '#6B9B37', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Planning: Housing Standards Overview', 'PD 957 and BP 220 key provisions.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Planning -- Starter Quiz', 'Verify subdivision layouts against housing standards.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 25: Professional Practice -- RA 9266
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 25, 'Practice: RA 9266 Essentials', 'Scope of practice, licensure, and professional ethics.', 60, 'Professional Practice', '#4A7B9D', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Professional Practice: RA 9266 Key Provisions', 'Architecture Act scope, licensure, and CPD requirements.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Professional Practice -- Starter Quiz', 'Identify ethical violations and licensure requirements.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 26: Professional Practice -- Contracts & Project Management
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 26, 'Practice: Contracts & Management', 'Contract types, project delivery methods, and fee structures.', 60, 'Professional Practice', '#4A7B9D', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'Professional Practice: Contracts & Fees', 'Contract forms, delivery methods, and fee computation.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'Professional Practice -- Starter Quiz', 'Match contract types to project scenarios.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 27: Mixed Review -- All Subjects
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 27, 'ALE Starter: Final Review', 'Mixed review across all 8 subjects covered in the starter trail.', 60, 'Building Laws', '#1B3FC4', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, estimated_minutes, preferred_time)
      VALUES (v_day_id, 1, 'wiki', 'All Subjects: High-Frequency Topics Review', 'Quick summary of the most-tested topics across all subjects.', 20, 'evening')
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes, preferred_time)
      VALUES (v_day_id, 2, 'quiz', 'ALE Starter -- Final Mixed Quiz', 'Mixed questions spanning all 8 ALE subjects.', 10, 25, 'morning')
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

  -- Day 28: Trail Complete
  INSERT INTO public.trail_days (trail_id, day_number, title, description, estimated_minutes, subject_focus, subject_color, is_rest_day)
    VALUES (v_trail_id, 28, 'ALE Starter: Complete', 'You have completed the ALE Starter Trail. Consider enrolling in a full study program.', 60, 'Professional Practice', '#4A7B9D', false)
    ON CONFLICT (trail_id, day_number) DO NOTHING
    RETURNING day_id INTO v_day_id;
  IF v_day_id IS NOT NULL THEN
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 1, 'review', 'Starter Trail Final Assessment', 'Comprehensive assessment across all subjects.', 15, 30)
      ON CONFLICT (day_id, step_order) DO NOTHING;
    INSERT INTO public.trail_steps (day_id, step_order, step_type, title, description, question_count, estimated_minutes)
      VALUES (v_day_id, 2, 'quiz', 'ALE Starter -- Graduation Quiz', 'Celebrate completion with a final mixed-subject quiz.', 10, 20)
      ON CONFLICT (day_id, step_order) DO NOTHING;
  END IF;

END $$;


-- ============================================================
-- SECTION 6: UPDATE total_steps COUNTS
-- ============================================================

UPDATE public.camp_trails ct
SET total_steps = (
  SELECT COUNT(ts.step_id)
  FROM public.trail_steps ts
  JOIN public.trail_days td ON td.day_id = ts.day_id
  WHERE td.trail_id = ct.trail_id
)
WHERE ct.slug IN (
  '8-week-standard',
  'ale-starter'
);

-- For trails without seeded steps, set a reasonable estimate
UPDATE public.camp_trails SET total_steps = 84  WHERE slug = '2-week-intensive'    AND total_steps = 0;
UPDATE public.camp_trails SET total_steps = 140 WHERE slug = '4-week-accelerated'  AND total_steps = 0;
UPDATE public.camp_trails SET total_steps = 420 WHERE slug = '12-week-comprehensive' AND total_steps = 0;
UPDATE public.camp_trails SET total_steps = 540 WHERE slug = '6-month-undergraduate' AND total_steps = 0;

-- Subject mastery paths: ~14 days x 3 steps avg = ~42
UPDATE public.camp_trails SET total_steps = 42 WHERE trail_type = 'subject_mastery' AND total_steps = 0;

-- Code deep-dives: ~14 days x 3 steps avg = ~42
UPDATE public.camp_trails SET total_steps = 42 WHERE trail_type = 'code_deep_dive' AND total_steps = 0;


-- ============================================================
-- SECTION 7: VERIFICATION QUERIES (as comments)
-- ============================================================

-- Verify trail counts:
-- SELECT trail_type, COUNT(*) FROM camp_trails GROUP BY trail_type;
-- Expected: time_gated=6, subject_mastery=8, code_deep_dive=8

-- Verify 8-week-standard days:
-- SELECT COUNT(*) FROM trail_days td JOIN camp_trails ct ON ct.trail_id = td.trail_id WHERE ct.slug = '8-week-standard';
-- Expected: 56

-- Verify 8-week-standard steps:
-- SELECT COUNT(*) FROM trail_steps ts JOIN trail_days td ON td.day_id = ts.day_id JOIN camp_trails ct ON ct.trail_id = td.trail_id WHERE ct.slug = '8-week-standard';

-- Verify ale-starter days:
-- SELECT COUNT(*) FROM trail_days td JOIN camp_trails ct ON ct.trail_id = td.trail_id WHERE ct.slug = 'ale-starter';
-- Expected: 28

-- Verify all trails published:
-- SELECT slug, is_published FROM camp_trails WHERE is_published = false;
-- Expected: 0 rows

COMMIT;
