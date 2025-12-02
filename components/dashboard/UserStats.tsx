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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Distance */}
      <Card className="group hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatDistance(totalDistance)} km</div>
          <div className="text-sm text-gray-600">Distance totale</div>
          <div className="mt-2 text-xs text-green-600 font-semibold">
            +{formatDistance(monthDistance)} km ce mois
          </div>
        </CardContent>
      </Card>

      {/* Total Activities */}
      <Card className="group hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalActivities}</div>
          <div className="text-sm text-gray-600">Activités totales</div>
          <div className="mt-2 text-xs text-green-600 font-semibold">
            +{monthActivitiesCount} ce mois
          </div>
        </CardContent>
      </Card>

      {/* Total Time */}
      <Card className="group hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatTime(totalTime)}h</div>
          <div className="text-sm text-gray-600">Temps total</div>
          <div className="mt-2 text-xs text-gray-500">
            {totalElevation > 0 && `${Math.round(totalElevation)}m D+`}
          </div>
        </CardContent>
      </Card>

      {/* Podiums */}
      <Card className="group hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{first > 0 ? '🥇' : first + second + third > 0 ? '🏆' : '🎯'}</span>
            <div className="text-2xl font-bold text-gray-900">{first + second + third}</div>
          </div>
          <div className="text-sm text-gray-600">Podiums</div>
          <div className="mt-2 flex gap-2 text-xs">
            {first > 0 && <span>🥇 {first}</span>}
            {second > 0 && <span>🥈 {second}</span>}
            {third > 0 && <span>🥉 {third}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
