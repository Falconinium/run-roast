-- Create achievements table to define all possible achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Emoji or icon identifier
  category TEXT NOT NULL, -- 'distance', 'activities', 'challenges', 'streak'
  requirement_type TEXT NOT NULL, -- 'total_distance', 'activity_count', 'challenge_wins', 'streak_days'
  requirement_value INTEGER NOT NULL, -- The threshold to unlock
  tier TEXT NOT NULL DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table to track unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0, -- Current progress towards the achievement
  UNIQUE(user_id, achievement_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (read-only for all authenticated users)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert predefined achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, tier) VALUES
-- Distance achievements
('Premier pas', 'Parcourez votre premier kilomètre', '🏃', 'distance', 'total_distance', 1000, 'bronze'),
('Coureur régulier', 'Parcourez 10 km au total', '🏃‍♂️', 'distance', 'total_distance', 10000, 'bronze'),
('Semi-marathonien', 'Parcourez 21 km au total', '🎽', 'distance', 'total_distance', 21000, 'silver'),
('Marathonien', 'Parcourez 42 km au total', '🏅', 'distance', 'total_distance', 42000, 'silver'),
('Ultra coureur', 'Parcourez 100 km au total', '⚡', 'distance', 'total_distance', 100000, 'gold'),
('Légende', 'Parcourez 500 km au total', '👑', 'distance', 'total_distance', 500000, 'platinum'),

-- Activity count achievements
('Débutant', 'Complétez votre première activité', '🌱', 'activities', 'activity_count', 1, 'bronze'),
('Motivé', 'Complétez 10 activités', '💪', 'activities', 'activity_count', 10, 'bronze'),
('Assidu', 'Complétez 50 activités', '🔥', 'activities', 'activity_count', 50, 'silver'),
('Accro du sport', 'Complétez 100 activités', '⭐', 'activities', 'activity_count', 100, 'gold'),
('Athlète olympique', 'Complétez 500 activités', '🥇', 'activities', 'activity_count', 500, 'platinum'),

-- Challenge achievements
('Compétiteur', 'Gagnez votre premier défi', '🏆', 'challenges', 'challenge_wins', 1, 'bronze'),
('Champion', 'Gagnez 5 défis', '🎯', 'challenges', 'challenge_wins', 5, 'silver'),
('Domination', 'Gagnez 10 défis', '👊', 'challenges', 'challenge_wins', 10, 'gold'),
('Invincible', 'Gagnez 25 défis', '💎', 'challenges', 'challenge_wins', 25, 'platinum'),

-- Streak achievements
('Bonne habitude', 'Faites du sport 3 jours de suite', '📅', 'streak', 'streak_days', 3, 'bronze'),
('Discipline', 'Faites du sport 7 jours de suite', '🔄', 'streak', 'streak_days', 7, 'silver'),
('Détermination', 'Faites du sport 14 jours de suite', '💯', 'streak', 'streak_days', 14, 'gold'),
('Machine', 'Faites du sport 30 jours de suite', '🤖', 'streak', 'streak_days', 30, 'platinum')
ON CONFLICT DO NOTHING;

-- Function to calculate user statistics
CREATE OR REPLACE FUNCTION calculate_user_stats(p_user_id UUID)
RETURNS TABLE(
  total_distance BIGINT,
  activity_count BIGINT,
  challenge_wins BIGINT,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH activity_stats AS (
    SELECT
      COALESCE(SUM(distance), 0)::BIGINT as total_dist,
      COUNT(*)::BIGINT as act_count
    FROM activity_snapshots
    WHERE user_id = p_user_id
  ),
  challenge_stats AS (
    SELECT COUNT(DISTINCT c.id)::BIGINT as wins
    FROM challenges c
    JOIN challenge_members cm ON c.id = cm.challenge_id
    WHERE c.end_date < NOW()
    AND cm.user_id = p_user_id
    AND (
      SELECT COUNT(*) FROM challenge_members WHERE challenge_id = c.id
    ) > 1
    AND cm.user_id = (
      SELECT cm_winner.user_id
      FROM challenge_members cm_winner
      WHERE cm_winner.challenge_id = c.id
      ORDER BY (
        SELECT COALESCE(
          CASE c.metric
            WHEN 'distance' THEN SUM(a.distance)
            WHEN 'time' THEN SUM(a.moving_time)
            WHEN 'elevation' THEN SUM(a.total_elevation_gain)
            ELSE COUNT(*)::NUMERIC
          END,
          0
        )
        FROM activity_snapshots a
        WHERE a.user_id = cm_winner.user_id
        AND a.start_date >= c.start_date
        AND a.start_date <= c.end_date
      ) DESC
      LIMIT 1
    )
  ),
  streak_calc AS (
    SELECT COALESCE(MAX(streak_length), 0)::INTEGER as streak
    FROM (
      SELECT
        date_series,
        ROW_NUMBER() OVER (ORDER BY date_series) -
        ROW_NUMBER() OVER (PARTITION BY has_activity ORDER BY date_series) as streak_group,
        has_activity
      FROM (
        SELECT
          date_series::DATE,
          EXISTS(
            SELECT 1
            FROM activity_snapshots a
            WHERE a.user_id = p_user_id
            AND a.start_date::DATE = date_series::DATE
          ) as has_activity
        FROM generate_series(
          NOW() - INTERVAL '30 days',
          NOW(),
          INTERVAL '1 day'
        ) date_series
      ) daily_activities
    ) streaks
    WHERE has_activity = true
    GROUP BY streak_group
  )
  SELECT
    a.total_dist,
    a.act_count,
    COALESCE(c.wins, 0),
    COALESCE(s.streak, 0)
  FROM activity_stats a
  CROSS JOIN challenge_stats c
  CROSS JOIN streak_calc s;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user achievements
CREATE OR REPLACE FUNCTION update_user_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_stats RECORD;
  v_achievement RECORD;
  v_progress INTEGER;
BEGIN
  -- Get user statistics
  SELECT * INTO v_stats FROM calculate_user_stats(p_user_id);

  -- Loop through all achievements
  FOR v_achievement IN SELECT * FROM achievements LOOP
    -- Calculate progress based on requirement type
    CASE v_achievement.requirement_type
      WHEN 'total_distance' THEN
        v_progress := v_stats.total_distance;
      WHEN 'activity_count' THEN
        v_progress := v_stats.activity_count;
      WHEN 'challenge_wins' THEN
        v_progress := v_stats.challenge_wins;
      WHEN 'streak_days' THEN
        v_progress := v_stats.current_streak;
      ELSE
        v_progress := 0;
    END CASE;

    -- Insert or update user achievement
    INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
    VALUES (
      p_user_id,
      v_achievement.id,
      v_progress,
      CASE
        WHEN v_progress >= v_achievement.requirement_value THEN NOW()
        ELSE NULL
      END
    )
    ON CONFLICT (user_id, achievement_id)
    DO UPDATE SET
      progress = v_progress,
      unlocked_at = CASE
        WHEN v_progress >= v_achievement.requirement_value AND user_achievements.unlocked_at IS NULL
        THEN NOW()
        ELSE user_achievements.unlocked_at
      END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
