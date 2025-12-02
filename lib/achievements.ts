export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'distance' | 'time' | 'elevation' | 'consistency' | 'competition'
  requirement: number
  unlocked: boolean
  progress?: number
}

export interface UserLevel {
  level: number
  title: string
  minXP: number
  maxXP: number
  currentXP: number
}

export const LEVEL_TITLES = [
  { level: 1, title: 'Débutant', minXP: 0, maxXP: 100 },
  { level: 2, title: 'Amateur', minXP: 100, maxXP: 300 },
  { level: 3, title: 'Régulier', minXP: 300, maxXP: 600 },
  { level: 4, title: 'Passionné', minXP: 600, maxXP: 1000 },
  { level: 5, title: 'Expert', minXP: 1000, maxXP: 1500 },
  { level: 6, title: 'Professionnel', minXP: 1500, maxXP: 2500 },
  { level: 7, title: 'Champion', minXP: 2500, maxXP: 4000 },
  { level: 8, title: 'Légende', minXP: 4000, maxXP: 6000 },
  { level: 9, title: 'Maître', minXP: 6000, maxXP: 10000 },
  { level: 10, title: 'Immortel', minXP: 10000, maxXP: Infinity },
]

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  // Distance achievements (dans les challenges)
  {
    id: 'first_10k',
    title: 'Premier 10K en défi',
    description: 'Parcourir 10 km en une activité pendant un challenge',
    icon: '🏃',
    category: 'distance',
    requirement: 10000,
  },
  {
    id: 'first_half_marathon',
    title: 'Semi-Marathon en défi',
    description: 'Parcourir 21 km en une activité pendant un challenge',
    icon: '🏃‍♂️',
    category: 'distance',
    requirement: 21000,
  },
  {
    id: 'first_marathon',
    title: 'Marathon en défi',
    description: 'Parcourir 42 km en une activité pendant un challenge',
    icon: '🏅',
    category: 'distance',
    requirement: 42000,
  },
  {
    id: 'total_100k',
    title: 'Centurion',
    description: 'Parcourir 100 km dans vos challenges',
    icon: '💯',
    category: 'distance',
    requirement: 100000,
  },
  {
    id: 'total_500k',
    title: 'Ultra Runner',
    description: 'Parcourir 500 km dans vos challenges',
    icon: '🦸',
    category: 'distance',
    requirement: 500000,
  },
  {
    id: 'total_1000k',
    title: 'Marathonien',
    description: 'Parcourir 1000 km dans vos challenges',
    icon: '👑',
    category: 'distance',
    requirement: 1000000,
  },

  // Time achievements (dans les challenges)
  {
    id: 'total_10h',
    title: 'Endurant',
    description: 'Cumuler 10 heures d\'effort dans les challenges',
    icon: '⏱️',
    category: 'time',
    requirement: 36000,
  },
  {
    id: 'total_50h',
    title: 'Marathonien du temps',
    description: 'Cumuler 50 heures d\'effort dans les challenges',
    icon: '⌚',
    category: 'time',
    requirement: 180000,
  },
  {
    id: 'total_100h',
    title: 'Machine infernale',
    description: 'Cumuler 100 heures d\'effort dans les challenges',
    icon: '🤖',
    category: 'time',
    requirement: 360000,
  },

  // Elevation achievements (dans les challenges)
  {
    id: 'total_1000m',
    title: 'Grimpeur',
    description: 'Gravir 1000m de dénivelé dans les challenges',
    icon: '⛰️',
    category: 'elevation',
    requirement: 1000,
  },
  {
    id: 'total_5000m',
    title: 'Alpiniste',
    description: 'Gravir 5000m de dénivelé dans les challenges',
    icon: '🏔️',
    category: 'elevation',
    requirement: 5000,
  },
  {
    id: 'total_everest',
    title: 'Everest',
    description: 'Gravir 8848m dans les challenges',
    icon: '🗻',
    category: 'elevation',
    requirement: 8848,
  },

  // Consistency achievements (participer à des challenges)
  {
    id: 'challenges_3',
    title: 'Participant actif',
    description: 'Participer à 3 challenges',
    icon: '🔥',
    category: 'consistency',
    requirement: 3,
  },
  {
    id: 'challenges_10',
    title: 'Compétiteur régulier',
    description: 'Participer à 10 challenges',
    icon: '🌟',
    category: 'consistency',
    requirement: 10,
  },
  {
    id: 'challenges_25',
    title: 'Vétéran des défis',
    description: 'Participer à 25 challenges',
    icon: '💎',
    category: 'consistency',
    requirement: 25,
  },

  // Competition achievements
  {
    id: 'first_podium',
    title: 'Premier podium',
    description: 'Finir dans le top 3 d\'un challenge',
    icon: '🥉',
    category: 'competition',
    requirement: 1,
  },
  {
    id: 'first_win',
    title: 'Première victoire',
    description: 'Gagner un challenge',
    icon: '🥇',
    category: 'competition',
    requirement: 1,
  },
  {
    id: 'five_wins',
    title: 'Champion',
    description: 'Gagner 5 challenges',
    icon: '🏆',
    category: 'competition',
    requirement: 5,
  },
  {
    id: 'ten_wins',
    title: 'Dominateur',
    description: 'Gagner 10 challenges',
    icon: '👑',
    category: 'competition',
    requirement: 10,
  },
]

interface UserStats {
  totalDistance: number // Dans les challenges
  totalTime: number // Dans les challenges
  totalElevation: number // Dans les challenges
  longestDistance: number // Dans les challenges
  totalChallenges: number // Nombre de challenges participés
  firstPlaceCount: number
  podiumCount: number
}

export function calculateUserLevel(stats: UserStats): UserLevel {
  // Calculate XP basé sur les performances dans les challenges
  const distanceXP = (stats.totalDistance / 1000) * 2 // 2 XP per km
  const timeXP = (stats.totalTime / 3600) * 5 // 5 XP per hour
  const elevationXP = stats.totalElevation * 0.5 // 0.5 XP per meter
  const challengesXP = stats.totalChallenges * 20 // 20 XP per challenge participated
  const winXP = stats.firstPlaceCount * 100 // 100 XP per win
  const podiumXP = stats.podiumCount * 50 // 50 XP per podium

  const totalXP = Math.floor(distanceXP + timeXP + elevationXP + challengesXP + winXP + podiumXP)

  // Find level
  const levelInfo = LEVEL_TITLES.findLast(l => totalXP >= l.minXP) || LEVEL_TITLES[0]

  return {
    level: levelInfo.level,
    title: levelInfo.title,
    minXP: levelInfo.minXP,
    maxXP: levelInfo.maxXP,
    currentXP: totalXP,
  }
}

export function checkAchievements(stats: UserStats): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map(achievement => {
    let progress = 0
    let unlocked = false

    switch (achievement.category) {
      case 'distance':
        if (achievement.id.startsWith('first_')) {
          // Plus longue distance dans une activité de challenge
          progress = stats.longestDistance
        } else {
          // Distance totale dans tous les challenges
          progress = stats.totalDistance
        }
        unlocked = progress >= achievement.requirement
        break

      case 'time':
        // Temps total dans tous les challenges
        progress = stats.totalTime
        unlocked = progress >= achievement.requirement
        break

      case 'elevation':
        // Dénivelé total dans tous les challenges
        progress = stats.totalElevation
        unlocked = progress >= achievement.requirement
        break

      case 'consistency':
        // Nombre de challenges participés
        progress = stats.totalChallenges
        unlocked = progress >= achievement.requirement
        break

      case 'competition':
        if (achievement.id === 'first_podium') {
          progress = stats.podiumCount
        } else {
          progress = stats.firstPlaceCount
        }
        unlocked = progress >= achievement.requirement
        break
    }

    return {
      ...achievement,
      unlocked,
      progress,
    }
  })
}
