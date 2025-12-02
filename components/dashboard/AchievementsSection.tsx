import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { checkAchievements, calculateUserLevel, ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements'

interface AchievementsSectionProps {
  userId: string
}

export async function AchievementsSection({ userId }: AchievementsSectionProps) {
  const supabase = await createClient()

  // Get user's challenge memberships
  const { data: memberships } = await supabase
    .from('challenge_members')
    .select('*, challenges(*)')
    .eq('user_id', userId)

  // Get all challenges the user is part of
  const challengeIds = memberships?.map(m => m.challenge_id) || []
  const totalChallenges = challengeIds.length

  // Get all activities but only those within challenge periods
  let challengeActivities: any[] = []
  let longestDistance = 0

  for (const membership of memberships || []) {
    const challenge = membership.challenges
    if (!challenge) continue

    // Get activities within this challenge's period
    const { data: activities } = await supabase
      .from('activity_snapshots')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', challenge.start_date)
      .lte('start_date', challenge.end_date)

    if (activities) {
      challengeActivities.push(...activities)
      // Track longest distance in any single activity within challenges
      const maxInChallenge = activities.reduce((max, act) => Math.max(max, Number(act.distance)), 0)
      longestDistance = Math.max(longestDistance, maxInChallenge)
    }
  }

  // Calculate stats only from challenge activities
  const totalDistance = challengeActivities.reduce((sum, act) => sum + Number(act.distance), 0)
  const totalTime = challengeActivities.reduce((sum, act) => sum + Number(act.moving_time), 0)
  const totalElevation = challengeActivities.reduce((sum, act) => sum + Number(act.total_elevation_gain), 0)

  // Calculate competition stats
  let firstPlaceCount = 0
  let podiumCount = 0

  for (const membership of memberships || []) {
    const challenge = membership.challenges
    if (!challenge) continue

    const now = new Date()
    const isActive = new Date(challenge.start_date) <= now && new Date(challenge.end_date) >= now
    if (isActive) continue // Skip active challenges

    // Get all members
    const { data: challengeMembers } = await supabase
      .from('challenge_members')
      .select('user_id')
      .eq('challenge_id', challenge.id)

    if (!challengeMembers || challengeMembers.length <= 1) continue

    const memberIds = challengeMembers.map(m => m.user_id)

    // Get all activities
    const { data: challengeActivities } = await supabase
      .from('activity_snapshots')
      .select('*')
      .in('user_id', memberIds)
      .gte('start_date', challenge.start_date)
      .lte('start_date', challenge.end_date)

    if (!challengeActivities) continue

    // Calculate scores
    const scores = new Map<string, number>()
    for (const activity of challengeActivities) {
      const current = scores.get(activity.user_id) || 0
      const value = challenge.metric === 'distance' ? Number(activity.distance) :
                   challenge.metric === 'time' ? Number(activity.moving_time) :
                   challenge.metric === 'elevation' ? Number(activity.total_elevation_gain) :
                   1 // count

      scores.set(activity.user_id, current + value)
    }

    const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1])
    const userPosition = sorted.findIndex(([id]) => id === userId) + 1

    if (userPosition === 1) firstPlaceCount++
    if (userPosition <= 3 && userPosition > 0) podiumCount++
  }

  const userStats = {
    totalDistance,
    totalTime,
    totalElevation,
    longestDistance,
    totalChallenges,
    firstPlaceCount,
    podiumCount,
  }

  const userLevel = calculateUserLevel(userStats)
  const achievements = checkAchievements(userStats)

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  const progressToNextLevel = userLevel.maxXP === Infinity
    ? 100
    : ((userLevel.currentXP - userLevel.minXP) / (userLevel.maxXP - userLevel.minXP)) * 100

  return (
    <div className="space-y-6">
      {/* User Level */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">{userLevel.level}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{userLevel.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {userLevel.currentXP} XP
                {userLevel.maxXP !== Infinity && ` / ${userLevel.maxXP} XP`}
              </p>
              {userLevel.maxXP !== Infinity && (
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-1000"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
              )}
              {userLevel.maxXP !== Infinity && (
                <p className="text-xs text-gray-500 mt-1">
                  {userLevel.maxXP - userLevel.currentXP} XP pour le niveau suivant
                </p>
              )}
            </div>
            <div className="text-5xl">
              {userLevel.level >= 9 ? '👑' : userLevel.level >= 7 ? '🏆' : userLevel.level >= 5 ? '⭐' : userLevel.level >= 3 ? '🎯' : '🌱'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trophées ({unlockedAchievements.length}/{ACHIEVEMENT_DEFINITIONS.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Unlocked achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                <span>✅</span> Débloqués ({unlockedAchievements.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {unlockedAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 text-center hover:scale-105 transition-transform"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="font-semibold text-sm text-gray-900">{achievement.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <span>🔒</span> À débloquer ({lockedAchievements.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {lockedAchievements.slice(0, 8).map(achievement => {
                  const progressPercent = achievement.progress
                    ? (achievement.progress / achievement.requirement) * 100
                    : 0

                  return (
                    <div
                      key={achievement.id}
                      className="p-4 rounded-lg bg-gray-100 border-2 border-gray-200 text-center opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div className="text-4xl mb-2 grayscale">{achievement.icon}</div>
                      <div className="font-semibold text-sm text-gray-700">{achievement.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{achievement.description}</div>
                      {achievement.progress !== undefined && achievement.progress > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-300 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(progressPercent)}%
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
