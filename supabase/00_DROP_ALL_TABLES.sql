-- Drop tables in dependency order to avoid constraint errors
DROP TABLE IF EXISTS public.user_interactions         CASCADE;
DROP TABLE IF EXISTS public.quiz_sessions             CASCADE;
DROP TABLE IF EXISTS public.user_node_mastery         CASCADE;
DROP TABLE IF EXISTS public.readiness_score_snapshots CASCADE;
DROP TABLE IF EXISTS public.user_global_stats         CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions        CASCADE;
DROP TABLE IF EXISTS public.notes                     CASCADE;
DROP TABLE IF EXISTS public.note_folders              CASCADE;
DROP TABLE IF EXISTS public.wiki_article_taxonomy     CASCADE;
DROP TABLE IF EXISTS public.wiki_articles             CASCADE;
DROP TABLE IF EXISTS public.spatial_hotspots          CASCADE;
DROP TABLE IF EXISTS public.questions                 CASCADE;
DROP TABLE IF EXISTS public.taxonomy_tree             CASCADE;
DROP TABLE IF EXISTS public.models_3d                 CASCADE;
DROP TABLE IF EXISTS public.disciplines               CASCADE;

-- Optional: Drop the custom types if you want a completely fresh start
DROP TYPE IF EXISTS public.session_status    CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.subscription_tier CASCADE;
DROP TYPE IF EXISTS public.test_mode         CASCADE;

-- Optional: Drop the update function
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;