export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type AchievementCategory = 'distance' | 'activities' | 'challenges' | 'streak'
export type RequirementType = 'total_distance' | 'activity_count' | 'challenge_wins' | 'streak_days'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  requirement_type: RequirementType
  requirement_value: number
  tier: AchievementTier
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string | null
  progress: number
  achievements?: Achievement // Joined data
}

export interface AchievementWithProgress extends Achievement {
  progress: number
  unlocked_at: string | null
  percentage: number
  is_unlocked: boolean
}

export interface UserStats {
  total_distance: number
  activity_count: number
  challenge_wins: number
  current_streak: number
}
