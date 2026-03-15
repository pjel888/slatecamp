-- =============================================================================
-- 03_QUIZ_SEED_DATA.sql
-- Clears existing questions, then seeds 34 Architecture questions.
-- Every question has exactly 4 options.
-- =============================================================================

BEGIN;

-- Clear out any existing questions to avoid duplicates or old formats
TRUNCATE TABLE public.questions CASCADE;

INSERT INTO public.questions (topic_id, text, options, correct_option_id, rationale, difficulty) VALUES
-- ------------------------------------------------------------
-- HISTORY OF ARCHITECTURE
-- ------------------------------------------------------------
(
    '00000000-0000-0000-0003-000000000001', 
    'Which Vitruvian principle refers to functional utility or fitness for purpose?', 
    '[{"id": "a", "text": "Firmitas"}, {"id": "b", "text": "Venustas"}, {"id": "c", "text": "Utilitas"}, {"id": "d", "text": "Proportio"}]'::jsonb, 
    'c', 
    'Vitruvius defined Utilitas as the functional performance of a building.', 
    0.30
),
(
    '00000000-0000-0000-0003-000000000005', 
    'What prehistoric monument consists of two upright stones supporting a horizontal slab?', 
    '[{"id": "a", "text": "Menhir"}, {"id": "b", "text": "Dolmen"}, {"id": "c", "text": "Cromlech"}, {"id": "d", "text": "Tumulus"}]'::jsonb, 
    'b', 
    'A Dolmen is a type of single-chamber megalithic tomb.', 
    0.40
),
(
    '00000000-0000-0000-0003-000000000006', 
    'Which architectural element is a hallmark of the West Asiatic Ziggurat?', 
    '[{"id": "a", "text": "Stepped platform"}, {"id": "b", "text": "Pendentive"}, {"id": "c", "text": "Flying buttress"}, {"id": "d", "text": "Corbelled dome"}]'::jsonb, 
    'a', 
    'Ziggurats were massive stepped temple platforms.', 
    0.35
),
(
    '00000000-0000-0000-0003-000000000007', 
    'The "Entasis" in Greek columns was used primarily to correct which optical illusion?', 
    '[{"id": "a", "text": "Leaning"}, {"id": "b", "text": "Apparent thinning at the center"}, {"id": "c", "text": "Excessive height"}, {"id": "d", "text": "Color distortion"}]'::jsonb, 
    'b', 
    'Entasis is a convex curve used to correct the illusion of concavity.', 
    0.45
),
(
    '00000000-0000-0000-0003-000000000009', 
    'What innovation allowed Gothic cathedrals to have thinner walls and larger windows?', 
    '[{"id": "a", "text": "Round arch"}, {"id": "b", "text": "Flying buttress"}, {"id": "c", "text": "Thick masonry"}, {"id": "d", "text": "Coffered ceiling"}]'::jsonb, 
    'b', 
    'They transferred structural loads to external supports.', 
    0.30
),
(
    '00000000-0000-0000-0003-000000000010', 
    'Who designed the dome of the Florence Cathedral, starting the Renaissance?', 
    '[{"id": "a", "text": "Michelangelo"}, {"id": "b", "text": "Brunelleschi"}, {"id": "c", "text": "Bramante"}, {"id": "d", "text": "Alberti"}]'::jsonb, 
    'b', 
    'Filippo Brunelleschi pioneered the Renaissance style with this dome.', 
    0.40
),
(
    '00000000-0000-0000-0003-000000000016', 
    'Which UNESCO church in Iloilo is known for its "Bas Relief" coconut tree facade?', 
    '[{"id": "a", "text": "Paoay"}, {"id": "b", "text": "Miag-ao"}, {"id": "c", "text": "San Agustin"}, {"id": "d", "text": "Santa Maria"}]'::jsonb, 
    'b', 
    'Miag-ao Church features an intricate facade blending Spanish and local motifs.', 
    0.30
),
(
    '00000000-0000-0000-0003-000000000018', 
    'Which National Artist for Architecture designed the CCP "Floating Cathedral"?', 
    '[{"id": "a", "text": "Juan Nakpil"}, {"id": "b", "text": "Leandro Locsin"}, {"id": "c", "text": "Francisco Mañosa"}, {"id": "d", "text": "Pablo Antonio"}]'::jsonb, 
    'b', 
    'Leandro Locsin is famous for his mastery of "floating" architectural forms.', 
    0.25
),

-- ------------------------------------------------------------
-- ARCHITECTURAL PRACTICE & LAWS
-- ------------------------------------------------------------
(
    '00000000-0000-0000-0003-000000000031', 
    'How many years of diversified experience are required before taking the ALE?', 
    '[{"id": "a", "text": "1 year"}, {"id": "b", "text": "2 years"}, {"id": "c", "text": "3 years"}, {"id": "d", "text": "5 years"}]'::jsonb, 
    'b', 
    'Section 13 of RA 9266 requires at least two years of experience.', 
    0.20
),
(
    '00000000-0000-0000-0003-000000000031', 
    'Which organization is the designated IAPOA under RA 9266?', 
    '[{"id": "a", "text": "PIA"}, {"id": "b", "text": "UAP"}, {"id": "c", "text": "PRBoA"}, {"id": "d", "text": "PRC"}]'::jsonb, 
    'b', 
    'The United Architects of the Philippines (UAP) is the designated IAPOA.', 
    0.20
),
(
    '00000000-0000-0000-0003-000000000032', 
    'Accepting a commission from a contractor for a project you supervise violates what?', 
    '[{"id": "a", "text": "Code of Ethical Conduct"}, {"id": "b", "text": "PD 1096"}, {"id": "c", "text": "RA 9184"}, {"id": "d", "text": "Civil Code"}]'::jsonb, 
    'a', 
    'Architects must remain impartial to protect the client and public.', 
    0.25
),
(
    '00000000-0000-0000-0003-000000000035', 
    'Under NBCP Rule VIII, what is the minimum window area for human habitation?', 
    '[{"id": "a", "text": "5%"}, {"id": "b", "text": "10%"}, {"id": "c", "text": "15%"}, {"id": "d", "text": "20%"}]'::jsonb, 
    'b', 
    'Rule VIII mandates 10% of the floor area for natural light.', 
    0.35
),
(
    '00000000-0000-0000-0003-000000000037', 
    'Which law mandates that public buildings must be accessible to PWDs?', 
    '[{"id": "a", "text": "BP 344"}, {"id": "b", "text": "PD 957"}, {"id": "c", "text": "RA 9266"}, {"id": "d", "text": "PD 1096"}]'::jsonb, 
    'a', 
    'Batas Pambansa Blg. 344 is the primary Accessibility Law.', 
    0.20
),
(
    '00000000-0000-0000-0003-000000000039', 
    'A "Prescriptive Specification" is one that describes what?', 
    '[{"id": "a", "text": "The final performance"}, {"id": "b", "text": "Exact materials and methods"}, {"id": "c", "text": "A list of brand names"}, {"id": "d", "text": "The required budget"}]'::jsonb, 
    'b', 
    'Prescriptive specs dictate precisely how the work is to be done.', 
    0.40
),
(
    '00000000-0000-0000-0003-000000000040', 
    'Which document indicates the critical sequence of activities in construction?', 
    '[{"id": "a", "text": "Gantt Chart"}, {"id": "b", "text": "CPM Diagram"}, {"id": "c", "text": "Bill of Quantities"}, {"id": "d", "text": "Shop Drawing"}]'::jsonb, 
    'b', 
    'The Critical Path Method (CPM) identifies the essential sequence of tasks.', 
    0.50
),

-- ------------------------------------------------------------
-- BUILDING UTILITIES
-- ------------------------------------------------------------
(
    '00000000-0000-0000-0003-000000000054', 
    'In high-rises, which system uses a pump to deliver water to an elevated tank?', 
    '[{"id": "a", "text": "Upfeed"}, {"id": "b", "text": "Indirect Downfeed"}, {"id": "c", "text": "Pneumatic System"}, {"id": "d", "text": "Direct Pressure"}]'::jsonb, 
    'b', 
    'The indirect system is standard for tall buildings.', 
    0.50
),
(
    '00000000-0000-0000-0003-000000000054', 
    'What device is used to prevent the backflow of water from a building into the main?', 
    '[{"id": "a", "text": "Gate Valve"}, {"id": "b", "text": "Check Valve"}, {"id": "c", "text": "Globe Valve"}, {"id": "d", "text": "Float Valve"}]'::jsonb, 
    'b', 
    'A check valve allows water flow in only one direction.', 
    0.40
),
(
    '00000000-0000-0000-0003-000000000055', 
    'What is the standard height of a lavatory rim from the finished floor?', 
    '[{"id": "a", "text": "750mm"}, {"id": "b", "text": "800-850mm"}, {"id": "c", "text": "900mm"}, {"id": "d", "text": "600mm"}]'::jsonb, 
    'b', 
    'This is the standard ergonomic height for a residential lavatory.', 
    0.35
),
(
    '00000000-0000-0000-0003-000000000056', 
    'The pipe that carries liquid waste (no fecal matter) from fixtures is called?', 
    '[{"id": "a", "text": "Soil Stack"}, {"id": "b", "text": "Waste Stack"}, {"id": "c", "text": "Vent Stack"}, {"id": "d", "text": "Wet Vent"}]'::jsonb, 
    'b', 
    'Waste stacks carry "gray water" from sinks and showers.', 
    0.30
),
(
    '00000000-0000-0000-0003-000000000058', 
    'In centralized HVAC, the unit that cools the water to be circulated is the?', 
    '[{"id": "a", "text": "Chiller"}, {"id": "b", "text": "AHU"}, {"id": "c", "text": "Cooling Tower"}, {"id": "d", "text": "Condenser"}]'::jsonb, 
    'a', 
    'The chiller is the primary refrigeration component for water.', 
    0.45
),
(
    '00000000-0000-0000-0003-000000000060', 
    'What is the unit used to measure the intensity of illumination on a surface?', 
    '[{"id": "a", "text": "Lumen"}, {"id": "b", "text": "Lux"}, {"id": "c", "text": "Candela"}, {"id": "d", "text": "Watt"}]'::jsonb, 
    'b', 
    'Lux measures lumens per square meter hitting a surface.', 
    0.25
),
(
    '00000000-0000-0000-0003-000000000064', 
    'A Class A fire extinguisher is best used for which type of fuel?', 
    '[{"id": "a", "text": "Flammable liquids"}, {"id": "b", "text": "Wood and paper"}, {"id": "c", "text": "Electrical equipment"}, {"id": "d", "text": "Cooking oils"}]'::jsonb, 
    'b', 
    'Class A is for ordinary combustibles.', 
    0.20
),

-- ------------------------------------------------------------
-- STRUCTURAL DESIGN
-- ------------------------------------------------------------
(
    '00000000-0000-0000-0003-000000000068', 
    'What does "Stress" represent in structural mechanics?', 
    '[{"id": "a", "text": "Strain"}, {"id": "b", "text": "Force per unit area"}, {"id": "c", "text": "Material weight"}, {"id": "d", "text": "Deformation limit"}]'::jsonb, 
    'b', 
    'Stress is the internal resistance to force (F/A).', 
    0.30
),
(
    '00000000-0000-0000-0003-000000000069', 
    'Forces that act on a building due to people and movable equipment are?', 
    '[{"id": "a", "text": "Dead Loads"}, {"id": "b", "text": "Live Loads"}, {"id": "c", "text": "Wind Loads"}, {"id": "d", "text": "Seismic Loads"}]'::jsonb, 
    'b', 
    'Live loads are temporary and variable occupancy loads.', 
    0.15
),
(
    '00000000-0000-0000-0003-000000000072', 
    'In reinforced concrete, steel is added primarily to carry what force?', 
    '[{"id": "a", "text": "Compression"}, {"id": "b", "text": "Tension"}, {"id": "c", "text": "Shear"}, {"id": "d", "text": "Torsion"}]'::jsonb, 
    'b', 
    'Concrete is strong in compression but weak in tension.', 
    0.20
),
(
    '00000000-0000-0000-0003-000000000073', 
    'A reinforced concrete beam designed to fail in a "ductile" manner is?', 
    '[{"id": "a", "text": "Under-reinforced"}, {"id": "b", "text": "Balanced"}, {"id": "c", "text": "Over-reinforced"}, {"id": "d", "text": "Pre-stressed"}]'::jsonb, 
    'a', 
    'Under-reinforced sections yield in the steel first.', 
    0.55
),
(
    '00000000-0000-0000-0003-000000000075', 
    'Which steel section is most common for beams and columns in commercial builds?', 
    '[{"id": "a", "text": "C-Channel"}, {"id": "b", "text": "Wide Flange (W)"}, {"id": "c", "text": "Angle Bar"}, {"id": "d", "text": "Hollow Structural Section (HSS)"}]'::jsonb, 
    'b', 
    'Wide-flange sections offer superior efficiency.', 
    0.30
),
(
    '00000000-0000-0000-0003-000000000076', 
    'What type of weld is most commonly used to join plates at a right angle?', 
    '[{"id": "a", "text": "Butt weld"}, {"id": "b", "text": "Fillet weld"}, {"id": "c", "text": "Groove weld"}, {"id": "d", "text": "Spot weld"}]'::jsonb, 
    'b', 
    'Fillet welds are standard for perpendicular joints.', 
    0.40
),

-- ------------------------------------------------------------
-- MATERIALS & PLANNING
-- ------------------------------------------------------------
(
    '00000000-0000-0000-0003-000000000083', 
    'The "Slump Test" for concrete is performed to measure its?', 
    '[{"id": "a", "text": "Compressive strength"}, {"id": "b", "text": "Workability"}, {"id": "c", "text": "Curing time"}, {"id": "d", "text": "Tensile strength"}]'::jsonb, 
    'b', 
    'The slump test indicates the consistency of wet concrete.', 
    0.35
),
(
    '00000000-0000-0000-0003-000000000084', 
    'What is the standard nominal thickness of a load-bearing CHB?', 
    '[{"id": "a", "text": "100mm"}, {"id": "b", "text": "150mm"}, {"id": "c", "text": "200mm"}, {"id": "d", "text": "250mm"}]'::jsonb, 
    'b', 
    '6-inch (150mm) CHBs are standard for load-bearing walls.', 
    0.20
),
(
    '00000000-0000-0000-0003-000000000086', 
    'Which glass type is required for safety in floor-to-ceiling windows?', 
    '[{"id": "a", "text": "Float glass"}, {"id": "b", "text": "Tempered glass"}, {"id": "c", "text": "Tinted glass"}, {"id": "d", "text": "Frosted glass"}]'::jsonb, 
    'b', 
    'Tempered glass is standard safety glass for low-level glazing.', 
    0.25
),
(
    '00000000-0000-0000-0003-000000000092', 
    'In hotel design, the "Back of House" area includes which of the following?', 
    '[{"id": "a", "text": "Lounge"}, {"id": "b", "text": "Kitchen and Laundry"}, {"id": "c", "text": "Guest Rooms"}, {"id": "d", "text": "Main Lobby"}]'::jsonb, 
    'b', 
    'BOH refers to service areas hidden from guest view.', 
    0.30
),
(
    '00000000-0000-0000-0003-000000000096', 
    'Department of Health (DOH) standards for hospital design focus heavily on?', 
    '[{"id": "a", "text": "Aesthetic facade"}, {"id": "b", "text": "Sterile flow"}, {"id": "c", "text": "Maximum height"}, {"id": "d", "text": "Retail spaces"}]'::jsonb, 
    'b', 
    'Priorities are hygiene and efficient sterile separation.', 
    0.40
),
(
    '00000000-0000-0000-0003-000000000102', 
    'What concept focuses on high-density development near mass transit?', 
    '[{"id": "a", "text": "Urban Sprawl"}, {"id": "b", "text": "TOD (Transit Oriented Development)"}, {"id": "c", "text": "Ribbon Development"}, {"id": "d", "text": "Greenbelt Planning"}]'::jsonb, 
    'b', 
    'TOD clusters development around transport hubs.', 
    0.25
);

COMMIT;