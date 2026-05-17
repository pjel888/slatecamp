-- ============================================================================
-- SCHEMA HARDENING MIGRATION
-- Part B of Testing UX Overhaul
-- Applied: 2026-03-19
-- ============================================================================

-- B1: profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('undergrad', 'reviewee', 'professional', 'instructor')) DEFAULT 'reviewee',
  discipline_id UUID REFERENCES disciplines(discipline_id),
  target_exam_date DATE,
  school_or_institution TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- B2: user_mastery_history table
CREATE TABLE IF NOT EXISTS user_mastery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL,
  mastery_weight NUMERIC(5,4) NOT NULL,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  session_id UUID REFERENCES quiz_sessions(session_id),
  snapshot_reason TEXT CHECK (snapshot_reason IN ('session_complete', 'daily_snapshot', 'manual')) DEFAULT 'session_complete',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mastery_history_user_topic
  ON user_mastery_history(user_id, topic_id, created_at DESC);

ALTER TABLE user_mastery_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mastery history" ON user_mastery_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mastery history" ON user_mastery_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- B3: Add updated_at to user_node_mastery
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TRIGGER user_node_mastery_updated_at
  BEFORE UPDATE ON user_node_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- B4: Readiness score snapshot trigger on session complete
CREATE OR REPLACE FUNCTION snapshot_readiness_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO readiness_score_snapshots (user_id, score, sub_scores, computed_at)
    SELECT
      NEW.user_id,
      ugs.global_readiness_score,
      '{}'::jsonb,
      NOW()
    FROM user_global_stats ugs
    WHERE ugs.user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_snapshot_readiness ON quiz_sessions;
CREATE TRIGGER trg_snapshot_readiness
  AFTER UPDATE ON quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION snapshot_readiness_on_session_complete();

-- B5: analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_path TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_name_time
  ON analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_events_user
  ON analytics_events(user_id, created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own events" ON analytics_events FOR SELECT USING (auth.uid() = user_id);

-- Missing RLS policies
CREATE POLICY "Users can delete own quiz sessions" ON quiz_sessions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own interactions" ON user_interactions FOR UPDATE USING (auth.uid() = user_id);
