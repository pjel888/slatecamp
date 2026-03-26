-- Add recommendation_type column to blindspot_queues
-- Routes: 'quiz' (default), '3d_lab' (for spatial learning when node has 3D lab linked and mastery is red)

ALTER TABLE public.blindspot_queues
ADD COLUMN recommendation_type TEXT DEFAULT 'quiz';

-- Add comment for clarity
COMMENT ON COLUMN public.blindspot_queues.recommendation_type IS
'Recommendation type: quiz (standard blindspot quiz) or 3d_lab (route to 3D spatial learning first)';
