import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { StravaConnection } from '@/types'
import { DisconnectStravaButton } from './DisconnectStravaButton'

interface StravaConnectionStatusProps {
  stravaConnection: StravaConnection | null
}

export function StravaConnectionStatus({ stravaConnection }: StravaConnectionStatusProps) {
  if (!stravaConnection) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">Non connecté à Strava</span>
        </div>
        <p className="text-sm text-gray-600">
          Connectez votre compte Strava pour synchroniser automatiquement vos activités.
        </p>
        <Link href="/api/strava/authorize">
          <Button variant="primary">Connecter mon compte Strava</Button>
        </Link>
      </div>
    )
  }

  const athleteName = stravaConnection.athlete_firstname && stravaConnection.athlete_lastname
    ? `${stravaConnection.athlete_firstname} ${stravaConnection.athlete_lastname}`
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">Connecté à Strava</span>
        </div>
        <DisconnectStravaButton />
      </div>

      <div className="flex items-center gap-4">
        {stravaConnection.athlete_profile_image && (
          <img
            src={stravaConnection.athlete_profile_image}
            alt="Strava profile"
            className="w-16 h-16 rounded-full border-2 border-orange-200"
          />
        )}
        <div className="flex-1">
          {athleteName ? (
            <p className="font-semibold text-gray-900">{athleteName}</p>
          ) : (
            <p className="text-sm text-amber-600">
              Reconnectez-vous à Strava pour afficher votre profil
            </p>
          )}
          <p className="text-sm text-gray-600">
            Athlete ID: {stravaConnection.strava_athlete_id}
          </p>
        </div>
      </div>

      {!athleteName && (
        <div className="pt-2 border-t">
          <Link href="/api/strava/authorize">
            <Button variant="secondary" size="sm">
              Reconnecter à Strava
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
