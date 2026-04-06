-- 1. Ensure indexes for routing performance on raw interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_routing 
ON user_interactions (user_id, question_id, is_correct, interaction_timestamp);

-- 2. Create the real-time state cache table
CREATE TABLE IF NOT EXISTS user_question_states (
    user_id           UUID NOT NULL,
    question_id       UUID NOT NULL,
    last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_is_correct   BOOLEAN NOT NULL,
    total_attempts    INTEGER NOT NULL DEFAULT 1,
    total_time_ms     INTEGER NOT NULL DEFAULT 0,
    avg_time_ms       INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, question_id)
);

-- 3. Create a function to upsert state on every interaction
CREATE OR REPLACE FUNCTION update_user_question_state()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_question_states (
        user_id, 
        question_id, 
        last_seen_at, 
        last_is_correct, 
        total_attempts,
        total_time_ms,
        avg_time_ms
    )
    VALUES (
        NEW.user_id, 
        NEW.question_id, 
        NEW.interaction_timestamp, 
        NEW.is_correct, 
        1,
        COALESCE(NEW.time_spent_ms, 0),
        COALESCE(NEW.time_spent_ms, 0)
    )
    ON CONFLICT (user_id, question_id) DO UPDATE SET
        last_seen_at = EXCLUDED.last_seen_at,
        last_is_correct = EXCLUDED.last_is_correct,
        total_attempts = user_question_states.total_attempts + 1,
        total_time_ms = user_question_states.total_time_ms + COALESCE(NEW.time_spent_ms, 0),
        avg_time_ms = (user_question_states.total_time_ms + COALESCE(NEW.time_spent_ms, 0)) / (user_question_states.total_attempts + 1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach the trigger to the user_interactions table
DROP TRIGGER IF EXISTS trg_update_user_question_state ON user_interactions;
CREATE TRIGGER trg_update_user_question_state
AFTER INSERT ON user_interactions
FOR EACH ROW
EXECUTE FUNCTION update_user_question_state();