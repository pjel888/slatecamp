-- ============================================================
-- Design Problems — Area C Practice Library
-- Migration: 20260326_design_problems
-- ============================================================

CREATE TABLE IF NOT EXISTS public.design_problems (
  problem_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  building_type     TEXT NOT NULL,
  difficulty        INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  time_limit_minutes INTEGER DEFAULT 180,
  brief             TEXT NOT NULL,
  program           JSONB NOT NULL,
  site_data         JSONB NOT NULL,
  code_references   TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.design_problem_sessions (
  session_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id              UUID REFERENCES public.design_problems(problem_id),
  started_at              TIMESTAMPTZ DEFAULT now(),
  completed_at            TIMESTAMPTZ,
  time_elapsed_seconds    INTEGER,
  self_assessment_score   INTEGER CHECK (self_assessment_score BETWEEN 1 AND 5),
  checklist_completion    JSONB DEFAULT '{}'::jsonb
);

-- RLS
ALTER TABLE public.design_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_problem_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "design_problems_public_read"
  ON public.design_problems FOR SELECT
  USING (true);

CREATE POLICY "design_problem_sessions_own"
  ON public.design_problem_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Seed data ────────────────────────────────────────────────

INSERT INTO public.design_problems (title, building_type, difficulty, time_limit_minutes, brief, program, site_data, code_references)
VALUES
  (
    'Single-Family Residence',
    'Residential',
    1,
    60,
    'Design a single-family residence on a 300 sqm lot in a residential subdivision. The design must respond to prevailing winds and solar orientation. Prioritize natural ventilation and daylighting in living areas.',
    '{"spaces": [{"name": "Living/Dining", "area_sqm": 30}, {"name": "Kitchen", "area_sqm": 12}, {"name": "Master Bedroom", "area_sqm": 18}, {"name": "Bedroom 2", "area_sqm": 14}, {"name": "Toilet & Bath", "area_sqm": 5}, {"name": "Garage", "area_sqm": 16}, {"name": "Service Area", "area_sqm": 8}], "total_gfa_sqm": 103}',
    '{"lot_area_sqm": 300, "frontage_m": 12, "depth_m": 25, "setbacks": {"front_m": 3, "rear_m": 2, "sides_m": 1.5}, "max_lot_coverage_pct": 60, "max_floors": 2, "topography": "flat", "road_facing": "east"}',
    ARRAY['PD 1096 (NBC)', 'BP 220', 'BP 344']
  ),
  (
    '3-Storey Commercial Building',
    'Commercial',
    2,
    120,
    'Design a 3-storey commercial building along a national road. Ground floor is retail, upper floors are office leasable space. Provide adequate parking per NBCP requirements.',
    '{"spaces": [{"name": "Retail (GF)", "area_sqm": 200}, {"name": "Office Floor 1", "area_sqm": 180}, {"name": "Office Floor 2", "area_sqm": 180}, {"name": "Parking", "slots": 8}, {"name": "Lobby/Circulation", "area_sqm": 40}, {"name": "Toilets per floor", "area_sqm": 12}], "total_gfa_sqm": 660}',
    '{"lot_area_sqm": 600, "frontage_m": 20, "depth_m": 30, "setbacks": {"front_m": 6, "rear_m": 3, "sides_m": 2}, "max_lot_coverage_pct": 70, "max_floors": 3, "topography": "flat", "road_facing": "south", "road_width_m": 12}',
    ARRAY['PD 1096 (NBC)', 'BP 344', 'RAMO 2021']
  ),
  (
    'Small Elementary School — 6 Classrooms',
    'Educational',
    3,
    150,
    'Design a small elementary school on a 2,000 sqm lot with 6 standard classrooms, administration wing, library, and multi-purpose hall. Comply with DepEd Design Guidelines and BP 344.',
    '{"spaces": [{"name": "Standard Classroom", "area_sqm": 56, "qty": 6}, {"name": "Principal Office", "area_sqm": 18}, {"name": "Faculty Room", "area_sqm": 30}, {"name": "Library", "area_sqm": 60}, {"name": "Multi-Purpose Hall", "area_sqm": 150}, {"name": "Canteen", "area_sqm": 50}, {"name": "Comfort Rooms (boys)", "area_sqm": 20}, {"name": "Comfort Rooms (girls)", "area_sqm": 20}], "total_gfa_sqm": 682}',
    '{"lot_area_sqm": 2000, "frontage_m": 40, "depth_m": 50, "setbacks": {"front_m": 6, "rear_m": 3, "sides_m": 3}, "max_lot_coverage_pct": 50, "max_floors": 2, "topography": "gently_sloping", "road_facing": "west"}',
    ARRAY['PD 1096 (NBC)', 'BP 344', 'DepEd Design Guidelines', 'PD 603']
  ),
  (
    '5-Storey Office Building — Urban Lot',
    'Office',
    4,
    180,
    'Design a 5-storey office building on a constrained urban lot. The building must include a basement parking level, lobby with reception, open-plan office floors, and a rooftop mechanical penthouse. Comply with NBCP fire exit and accessibility requirements.',
    '{"spaces": [{"name": "Basement Parking", "slots": 20}, {"name": "Lobby/Reception (GF)", "area_sqm": 80}, {"name": "Office Floor", "area_sqm": 400, "qty": 4}, {"name": "Penthouse/Mech", "area_sqm": 80}, {"name": "Toilets per floor", "area_sqm": 20}, {"name": "Core (elevators/stairs)", "area_sqm": 30}], "total_gfa_sqm": 1830}',
    '{"lot_area_sqm": 800, "frontage_m": 20, "depth_m": 40, "setbacks": {"front_m": 0, "rear_m": 3, "sides_m": 0}, "max_lot_coverage_pct": 80, "max_floors": 5, "topography": "flat", "road_facing": "north", "road_width_m": 15, "adjacent_buildings": true}',
    ARRAY['PD 1096 (NBC)', 'BP 344', 'RA 9514 (Fire Code)', 'RAMO 2021']
  ),
  (
    'Mixed-Use Residential + Retail',
    'Mixed-Use',
    5,
    180,
    'Design a mixed-use development with ground-floor retail, 3 floors of residential apartments (8 units per floor), roof deck amenity area, and basement parking. Address podium-tower transition, unit privacy, and retail activation of the street edge.',
    '{"spaces": [{"name": "Basement Parking", "slots": 30}, {"name": "Retail Units (GF)", "area_sqm": 300, "qty": 6}, {"name": "Studio Unit (40 sqm)", "qty": 8, "per_floor": true, "floors": 3}, {"name": "1BR Unit (55 sqm)", "qty": 16, "total": true}, {"name": "Lobby/Mail/Amenity GF", "area_sqm": 60}, {"name": "Roof Deck Amenity", "area_sqm": 120}, {"name": "Corridors/Stairs/Elevators per floor", "area_sqm": 50}], "total_gfa_sqm": 2780}',
    '{"lot_area_sqm": 1200, "frontage_m": 30, "depth_m": 40, "setbacks": {"front_m": 0, "rear_m": 3, "sides_m": 2}, "max_lot_coverage_pct": 75, "max_floors": 5, "topography": "flat", "road_facing": "south", "road_width_m": 12, "corner_lot": false}',
    ARRAY['PD 1096 (NBC)', 'BP 344', 'RA 9514 (Fire Code)', 'PD 957', 'HLURB Guidelines']
  );
