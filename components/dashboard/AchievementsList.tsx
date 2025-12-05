'use client'

import { useEffect, useState } from 'react'
import { AchievementWithProgress } from '@/types/achievements'
import { AchievementCard } from './AchievementCard'
import { createClient } from '@/lib/supabase/client'

interface AchievementsListProps {
  userId: string
}

export function AchievementsList({ userId }: AchievementsListProps) {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    async function fetchAchievements() {
      const supabase = createClient()

      // Fetch all achievements with user progress
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('tier', { ascending: true })
        .order('requirement_value', { ascending: true })

      if (!achievementsData) {
        setLoading(false)
        return
      }

      // Fetch user's achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)

      // Merge data
      const merged: AchievementWithProgress[] = achievementsData.map((achievement) => {
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

      setAchievements(merged)
      setLoading(false)
    }

    fetchAchievements()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const categories = [
    { id: 'all', label: 'Tous', icon: '🏆' },
    { id: 'distance', label: 'Distance', icon: '📏' },
    { id: 'activities', label: 'Activités', icon: '🏃' },
    { id: 'challenges', label: 'Défis', icon: '🎯' },
    { id: 'streak', label: 'Régularité', icon: '🔥' },
  ]

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory)

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length
  const totalCount = achievements.length

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Succès</h2>
          <p className="text-sm text-gray-600 mt-1">
            {unlockedCount} / {totalCount} débloqués
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </div>
          <div className="text-xs text-gray-500">Complétion</div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
              transition-all duration-200 flex-shrink-0
              ${
                selectedCategory === category.id
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Achievements grid */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun succès dans cette catégorie
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  )
}
