import { ActivitySnapshot } from '@/types'
import { formatDistance, formatDuration, formatElevation } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface RecentActivitiesProps {
  activities: ActivitySnapshot[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>Aucune activité récente</p>
        <p className="text-sm mt-2">
          Synchronisez vos activités Strava pour les voir apparaître ici
        </p>
      </div>
    )
  }

  const getSportEmoji = (sportType: string): string => {
    const emojiMap: Record<string, string> = {
      run: '🏃',
      ride: '🚴',
      hike: '🥾',
      walk: '🚶',
      swim: '🏊',
      other: '⚡',
    }
    return emojiMap[sportType.toLowerCase()] || '⚡'
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getSportEmoji(activity.sport_type)}</span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {activity.sport_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(activity.start_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="font-semibold text-gray-900">
                    {formatDistance(activity.distance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Temps</p>
                  <p className="font-semibold text-gray-900">
                    {formatDuration(activity.moving_time)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dénivelé</p>
                  <p className="font-semibold text-gray-900">
                    {formatElevation(activity.total_elevation_gain)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
