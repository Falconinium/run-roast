import { Challenge, ActivitySnapshot, Profile, LeaderboardEntry, MetricType } from '@/types'

interface MemberWithProfile {
  user_id: string
  profiles: Profile
}

/**
 * Calcule le leaderboard d'un défi
 * Cette fonction prend en compte les activités de tous les participants
 * et les classe selon la métrique choisie (distance, temps, élévation, nombre)
 *
 * @param challenge - Le défi concerné
 * @param members - Liste des membres avec leurs profils
 * @param activities - Liste des activités filtrées (bon sport, bonnes dates)
 * @returns Tableau de LeaderboardEntry trié par score décroissant
 */
export function calculateLeaderboard(
  challenge: Challenge,
  members: MemberWithProfile[],
  activities: ActivitySnapshot[]
): LeaderboardEntry[] {
  const metric = challenge.metric as MetricType

  // Créer un Map pour accumuler les stats par utilisateur
  const userStats = new Map<string, {
    user_id: string
    profile: Profile
    total_distance: number
    total_time: number
    total_elevation: number
    count: number
  }>()

  // Initialiser les stats pour tous les membres
  members.forEach((member) => {
    userStats.set(member.user_id, {
      user_id: member.user_id,
      profile: member.profiles,
      total_distance: 0,
      total_time: 0,
      total_elevation: 0,
      count: 0,
    })
  })

  // Filtrer les activités qui correspondent au défi
  const challengeStart = new Date(challenge.start_date)
  const challengeEnd = new Date(challenge.end_date)

  const validActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.start_date)
    const isInDateRange = activityDate >= challengeStart && activityDate <= challengeEnd
    const isSameSport = normalizeActivityType(activity.sport_type) === challenge.sport
    return isInDateRange && isSameSport
  })

  // Accumuler les statistiques pour chaque utilisateur
  validActivities.forEach((activity) => {
    const stats = userStats.get(activity.user_id)
    if (stats) {
      stats.total_distance += Number(activity.distance)
      stats.total_time += Number(activity.moving_time)
      stats.total_elevation += Number(activity.total_elevation_gain)
      stats.count += 1
    }
  })

  // Calculer le score selon la métrique choisie
  const entries: LeaderboardEntry[] = Array.from(userStats.values()).map((stats) => {
    let score = 0

    switch (metric) {
      case 'distance':
        score = stats.total_distance
        break
      case 'time':
        score = stats.total_time
        break
      case 'elevation':
        score = stats.total_elevation
        break
      case 'count':
        score = stats.count
        break
      default:
        score = 0
    }

    return {
      user_id: stats.user_id,
      full_name: stats.profile.full_name,
      email: stats.profile.email,
      total_distance: stats.total_distance,
      total_time: stats.total_time,
      total_elevation: stats.total_elevation,
      count: stats.count,
      score,
      rank: 0, // Sera calculé après le tri
    }
  })

  // Trier par score décroissant
  entries.sort((a, b) => b.score - a.score)

  // Attribuer les rangs
  entries.forEach((entry, index) => {
    entry.rank = index + 1
  })

  return entries
}

/**
 * Normalise le type d'activité pour correspondre à nos sports
 * @param activityType - Type d'activité depuis Strava
 * @returns Type de sport normalisé
 */
function normalizeActivityType(activityType: string): string {
  const normalized = activityType.toLowerCase()

  if (normalized.includes('run')) return 'run'
  if (normalized.includes('ride') || normalized.includes('bike')) return 'ride'
  if (normalized.includes('hike')) return 'hike'
  if (normalized.includes('walk')) return 'walk'
  if (normalized.includes('swim')) return 'swim'

  return 'other'
}

/**
 * Obtient le libellé de la métrique selon son type
 * @param metric - Type de métrique
 * @returns Libellé en français
 */
export function getMetricLabel(metric: MetricType): string {
  const labels: Record<MetricType, string> = {
    distance: 'Distance',
    time: 'Temps',
    elevation: 'Dénivelé',
    count: 'Nombre d\'activités',
  }
  return labels[metric]
}

/**
 * Obtient l'unité de la métrique
 * @param metric - Type de métrique
 * @returns Unité (km, h, m, activités)
 */
export function getMetricUnit(metric: MetricType): string {
  const units: Record<MetricType, string> = {
    distance: 'km',
    time: 'h',
    elevation: 'm',
    count: 'activités',
  }
  return units[metric]
}
