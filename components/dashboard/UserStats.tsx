import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/Card'

interface UserStatsProps {
  userId: string
}

export async function UserStats({ userId }: UserStatsProps) {
  const supabase = await createClient()

  // Get all user activities
  const { data: activities } = await supabase
    .from('activity_snapshots')
    .select('*')
    .eq('user_id', userId)

  // Get user's challenge memberships
  const { data: memberships } = await supabase
    .from('challenge_members')
    .select('*, challenges(*)')
    .eq('user_id', userId)

  // Calculate stats
  const totalDistance = activities?.reduce((sum, act) => sum + Number(act.distance), 0) || 0
  const totalTime = activities?.reduce((sum, act) => sum + Number(act.moving_time), 0) || 0
  const totalElevation = activities?.reduce((sum, act) => sum + Number(act.total_elevation_gain), 0) || 0
  const totalActivities = activities?.length || 0

  // Get this month's stats
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthActivities = activities?.filter(act =>
    new Date(act.start_date) >= startOfMonth
  ) || []

  const monthDistance = monthActivities.reduce((sum, act) => sum + Number(act.distance), 0)
  const monthActivitiesCount = monthActivities.length

  // Get active challenges
  const activeChallenges = memberships?.filter(m => {
    const challenge = m.challenges
    if (!challenge) return false
    const now = new Date()
    return new Date(challenge.start_date) <= now && new Date(challenge.end_date) >= now
  }) || []

  // Calculate positions in active challenges
  let first = 0, second = 0, third = 0

  for (const membership of activeChallenges) {
    const challenge = membership.challenges
    if (!challenge) continue

    // Get all members' activities for this challenge
    const { data: challengeMembers } = await supabase
      .from('challenge_members')
      .select('user_id')
      .eq('challenge_id', challenge.id)

    if (!challengeMembers) continue

    const memberIds = challengeMembers.map(m => m.user_id)

    // Get all activities within challenge period
    const { data: challengeActivities } = await supabase
      .from('activity_snapshots')
      .select('*')
      .in('user_id', memberIds)
      .gte('start_date', challenge.start_date)
      .lte('start_date', challenge.end_date)

    if (!challengeActivities) continue

    // Calculate scores by user
    const scores = new Map<string, number>()
    for (const activity of challengeActivities) {
      const current = scores.get(activity.user_id) || 0
      const value = challenge.metric === 'distance' ? Number(activity.distance) :
                   challenge.metric === 'time' ? Number(activity.moving_time) :
                   challenge.metric === 'elevation' ? Number(activity.total_elevation_gain) :
                   1 // count

      scores.set(activity.user_id, current + value)
    }

    // Sort scores
    const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1])
    const userPosition = sorted.findIndex(([id]) => id === userId) + 1

    if (userPosition === 1) first++
    else if (userPosition === 2) second++
    else if (userPosition === 3) third++
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return km.toFixed(1)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    return hours.toFixed(0)
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Distance */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 transition-all hover:shadow-md cursor-default">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs font-medium text-orange-700">Distance</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-900 mb-1">{formatDistance(totalDistance)}</div>
            <div className="text-xs text-orange-600">kilomètres</div>
            {monthDistance > 0 && (
              <div className="mt-2 text-xs text-orange-700 font-medium">
                +{formatDistance(monthDistance)} km ce mois
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total Activities */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 transition-all hover:shadow-md cursor-default">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-700">Activités</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1">{totalActivities}</div>
            <div className="text-xs text-blue-600">au total</div>
            {monthActivitiesCount > 0 && (
              <div className="mt-2 text-xs text-blue-700 font-medium">
                +{monthActivitiesCount} ce mois
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total Time */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 transition-all hover:shadow-md cursor-default">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-purple-700">Temps</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1">{formatTime(totalTime)}h</div>
            <div className="text-xs text-purple-600">d'effort</div>
            {totalElevation > 0 && (
              <div className="mt-2 text-xs text-purple-700 font-medium">
                {Math.round(totalElevation)}m D+
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Podiums */}
      <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 transition-all hover:shadow-md cursor-default">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <span className="text-lg">{first > 0 ? '🥇' : first + second + third > 0 ? '🏆' : '🎯'}</span>
              </div>
              <span className="text-xs font-medium text-yellow-700">Podiums</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-1">{first + second + third}</div>
            <div className="text-xs text-yellow-600">au total</div>
            {(first > 0 || second > 0 || third > 0) && (
              <div className="mt-2 flex gap-2 text-xs font-medium text-yellow-700">
                {first > 0 && <span>🥇{first}</span>}
                {second > 0 && <span>🥈{second}</span>}
                {third > 0 && <span>🥉{third}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
