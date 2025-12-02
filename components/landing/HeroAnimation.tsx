'use client'

import { useEffect, useState } from 'react'

export function HeroAnimation() {
  const [activeIndex, setActiveIndex] = useState(0)

  const leaderboardData = [
    { name: 'Sarah', distance: 45.2, avatar: '👩🏻‍🦰', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Mike', distance: 42.8, avatar: '👨🏽', color: 'from-gray-300 to-gray-400' },
    { name: 'Julia', distance: 38.5, avatar: '👱🏻‍♀️', color: 'from-orange-400 to-orange-600' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Animated podium */}
      <div className="relative w-full max-w-md">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-10 w-40 h-40 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse delay-500"></div>

        {/* Leaderboard card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">🏆 Challenge du mois</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold animate-pulse">
              Live
            </span>
          </div>

          {/* Podium */}
          <div className="space-y-4">
            {leaderboardData.map((person, index) => (
              <div
                key={person.name}
                className={`
                  relative flex items-center gap-4 p-4 rounded-xl transition-all duration-500
                  ${activeIndex === index ? 'bg-gradient-to-r from-orange-50 to-orange-100 scale-105' : 'bg-gray-50'}
                  ${activeIndex === index ? 'shadow-lg' : ''}
                `}
              >
                {/* Position badge */}
                <div className="absolute -left-2 -top-2">
                  {index === 0 && (
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      bg-gradient-to-br ${person.color} text-white font-bold text-sm shadow-lg
                      ${activeIndex === index ? 'animate-bounce' : ''}
                    `}>
                      1
                    </div>
                  )}
                  {index === 1 && (
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      bg-gradient-to-br ${person.color} text-white font-bold text-sm shadow-lg
                    `}>
                      2
                    </div>
                  )}
                  {index === 2 && (
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      bg-gradient-to-br ${person.color} text-white font-bold text-sm shadow-lg
                    `}>
                      3
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  bg-white shadow-md transition-transform
                  ${activeIndex === index ? 'scale-110' : ''}
                `}>
                  {person.avatar}
                </div>

                {/* Name and distance */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{person.name}</div>
                  <div className="text-sm text-gray-600">{person.distance} km</div>
                </div>

                {/* Progress bar */}
                <div className="w-24">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`
                        h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full
                        transition-all duration-1000
                      `}
                      style={{
                        width: `${(person.distance / leaderboardData[0].distance) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Medal for top 3 */}
                <div className="text-2xl">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </div>
              </div>
            ))}
          </div>

          {/* Stats footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-xs text-gray-600">Participants</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">126</div>
              <div className="text-xs text-gray-600">km total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">7j</div>
              <div className="text-xs text-gray-600">Restants</div>
            </div>
          </div>
        </div>

        {/* Floating activity cards */}
        <div className="absolute -right-8 top-20 animate-float">
          <div className="bg-white rounded-lg shadow-lg p-3 w-32 border border-orange-100">
            <div className="text-xs font-semibold text-gray-700">🏃 Nouvelle activité</div>
            <div className="text-lg font-bold text-orange-600">+5.2 km</div>
          </div>
        </div>

        <div className="absolute -left-8 bottom-20 animate-float-delayed">
          <div className="bg-white rounded-lg shadow-lg p-3 w-32 border border-blue-100">
            <div className="text-xs font-semibold text-gray-700">⏱️ Temps</div>
            <div className="text-lg font-bold text-blue-600">32:15</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  )
}
