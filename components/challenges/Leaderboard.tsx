import { LeaderboardEntry, MetricType } from '@/types'
import { formatDistance, formatDuration, formatElevation } from '@/lib/utils'
import { getMetricLabel, getMetricUnit } from '@/lib/leaderboard'
import Image from 'next/image'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  metric: string
  currentUserId: string
  stravaConnections?: Array<{ user_id: string; athlete_profile_image?: string | null; athlete_firstname?: string | null; athlete_lastname?: string | null }>
}

export function Leaderboard({ entries, metric, currentUserId, stravaConnections = [] }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>Aucune activité enregistrée pour le moment.</p>
        <p className="text-sm mt-2">
          Synchronisez vos activités Strava pour apparaître dans le classement.
        </p>
      </div>
    )
  }

  const formatScore = (entry: LeaderboardEntry, metric: MetricType): string => {
    switch (metric) {
      case 'distance':
        return formatDistance(entry.total_distance)
      case 'time':
        return formatDuration(entry.total_time)
      case 'elevation':
        return formatElevation(entry.total_elevation)
      case 'count':
        return `${entry.count} activité${entry.count > 1 ? 's' : ''}`
      default:
        return String(entry.score)
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">1</span>
        </div>
      )
    }
    if (rank === 2) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">2</span>
        </div>
      )
    }
    if (rank === 3) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">3</span>
        </div>
      )
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-700 font-semibold">{rank}</span>
      </div>
    )
  }

  const getStravaInfo = (userId: string) => {
    return stravaConnections.find(conn => conn.user_id === userId)
  }

  const maxScore = entries[0]?.score || 1

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isCurrentUser = entry.user_id === currentUserId
        const stravaInfo = getStravaInfo(entry.user_id)
        const progressPercentage = (entry.score / maxScore) * 100

        return (
          <div
            key={entry.user_id}
            className={`
              relative p-4 rounded-xl transition-all duration-300 hover:shadow-lg
              ${isCurrentUser
                ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 shadow-md'
                : 'bg-white border-2 border-gray-100'
              }
              ${entry.rank <= 3 ? 'hover:scale-[1.02]' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                {getRankBadge(entry.rank)}
              </div>

              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {stravaInfo?.athlete_profile_image ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200">
                    <Image
                      src={stravaInfo.athlete_profile_image}
                      alt={entry.full_name || 'Athlète'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                )}
              </div>

              {/* Name and Email */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">
                    {stravaInfo?.athlete_firstname && stravaInfo?.athlete_lastname
                      ? `${stravaInfo.athlete_firstname} ${stravaInfo.athlete_lastname}`
                      : entry.full_name || 'Athlète'}
                  </p>
                  {isCurrentUser && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                      Vous
                    </span>
                  )}
                  {entry.rank <= 3 && (
                    <span className="text-lg">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{entry.email}</p>

                {/* Progress Bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 text-right space-y-1">
                <div className="text-2xl font-bold text-orange-600">
                  {formatScore(entry, metric as MetricType)}
                </div>
                <div className="flex gap-3 text-xs text-gray-600">
                  <div>
                    <div className="font-semibold">{formatDistance(entry.total_distance)}</div>
                    <div className="text-gray-400">distance</div>
                  </div>
                  <div>
                    <div className="font-semibold">{entry.count}</div>
                    <div className="text-gray-400">activités</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
