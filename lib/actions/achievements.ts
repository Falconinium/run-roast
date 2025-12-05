'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Updates user achievements by calculating progress from their activities
 * Should be called after Strava sync or when activities are updated
 */
export async function updateUserAchievements(userId: string) {
  const supabase = await createClient()

  try {
    // Call the database function to update achievements
    const { error } = await supabase.rpc('update_user_achievements', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error updating achievements:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating achievements:', error)
    return { success: false, error: 'Failed to update achievements' }
  }
}

/**
 * Fetches all achievements with user progress
 */
export async function getUserAchievements(userId: string) {
  const supabase = await createClient()

  try {
    // Fetch all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('tier', { ascending: true })
      .order('requirement_value', { ascending: true })

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      return { success: false, error: achievementsError.message, data: null }
    }

    // Fetch user's progress
    const { data: userAchievements, error: userError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)

    if (userError) {
      console.error('Error fetching user achievements:', userError)
      return { success: false, error: userError.message, data: null }
    }

    // Merge data
    const merged = achievements.map((achievement) => {
      const userAchievement = userAchievements?.find(
        (ua) => ua.achievement_id === achievement.id
      )

      const progress = userAchievement?.progress || 0
      const percentage = (progress / achievement.requirement_value) * 100

      return {
        ...achievement,
        progress,
        percentage,
        is_unlocked: !!userAchievement?.unlocked_at,
        unlocked_at: userAchievement?.unlocked_at || null,
      }
    })

    return { success: true, data: merged }
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return { success: false, error: 'Failed to fetch achievements', data: null }
  }
}

/**
 * Checks for newly unlocked achievements and returns them
 */
export async function checkNewAchievements(userId: string) {
  const supabase = await createClient()

  try {
    // Get achievements unlocked in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId)
      .gte('unlocked_at', fiveMinutesAgo)
      .not('unlocked_at', 'is', null)

    if (error) {
      console.error('Error checking new achievements:', error)
      return { success: false, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error checking new achievements:', error)
    return { success: false, data: [] }
  }
}
