'use client'

import { AchievementWithProgress, AchievementTier } from '@/types/achievements'

interface AchievementCardProps {
  achievement: AchievementWithProgress
}

const tierColors: Record<AchievementTier, { bg: string; border: string; text: string; gradient: string }> = {
  bronze: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-700',
    gradient: 'from-orange-400 to-orange-600',
  },
  silver: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-700',
    gradient: 'from-gray-400 to-gray-600',
  },
  gold: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  platinum: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    gradient: 'from-blue-400 to-blue-600',
  },
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const colors = tierColors[achievement.tier]
  const isUnlocked = achievement.is_unlocked

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${isUnlocked ? `${colors.bg} ${colors.border} hover:scale-105 hover:shadow-lg` : 'bg-gray-100 border-gray-200 opacity-60'}
      `}
    >
      {/* Locked overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}

      <div className="relative">
        {/* Icon and tier badge */}
        <div className="flex items-start justify-between mb-2">
          <div className={`text-4xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
            {achievement.icon}
          </div>
          {isUnlocked && (
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
              {achievement.tier.toUpperCase()}
            </div>
          )}
        </div>

        {/* Name and description */}
        <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? colors.text : 'text-gray-500'}`}>
          {achievement.name}
        </h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {achievement.description}
        </p>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={isUnlocked ? colors.text : 'text-gray-500'}>
              {isUnlocked ? '✓ Débloqué' : 'En cours'}
            </span>
            <span className="text-gray-500 font-medium">
              {achievement.progress.toLocaleString()} / {achievement.requirement_value.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isUnlocked ? `bg-gradient-to-r ${colors.gradient}` : 'bg-gray-400'
              }`}
              style={{ width: `${Math.min(achievement.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Unlocked date */}
        {isUnlocked && achievement.unlocked_at && (
          <div className="mt-2 text-xs text-gray-500">
            Débloqué le {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR')}
          </div>
        )}
      </div>
    </div>
  )
}
