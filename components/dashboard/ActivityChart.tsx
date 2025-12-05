'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'

interface ActivityChartProps {
  userId: string
}

export function ActivityChart({ userId }: ActivityChartProps) {
  const [chartData, setChartData] = useState<Array<{ date: string; distance: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Calculate the date range for the last 30 days in local timezone
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29) // -29 to include today as day 30

      const { data: activities } = await supabase
        .from('activity_snapshots')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', thirtyDaysAgo.toISOString())
        .order('start_date', { ascending: true })

      if (!activities) {
        setLoading(false)
        return
      }

      // Group by day
      const grouped = new Map<string, number>()

      // Fill all days in the last 30 days using local timezone
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - (29 - i))
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const key = `${year}-${month}-${day}`
        grouped.set(key, 0)
      }

      // Add activities
      for (const activity of activities) {
        // Parse date string directly to avoid timezone issues
        // activity.start_date is in ISO format: "YYYY-MM-DDTHH:mm:ss.sssZ"
        const dateStr = activity.start_date.split('T')[0] // Get just "YYYY-MM-DD"
        const key = dateStr

        // Only add activity if it's within our 30-day range
        if (grouped.has(key)) {
          const current = grouped.get(key) || 0
          const distance = Number(activity.distance) / 1000 // Convert to km
          grouped.set(key, current + distance)
        }
      }

      // Convert to chart format
      const data = Array.from(grouped.entries()).map(([date, distance]) => {
        // Parse YYYY-MM-DD without timezone conversion
        const [year, month, day] = date.split('-').map(Number)
        return {
          date: `${day}/${month}`,
          distance: Number(distance.toFixed(1)),
        }
      })

      setChartData(data)
      setLoading(false)
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Pas encore de données
      </div>
    )
  }

  const totalDistance = chartData.reduce((sum, d) => sum + d.distance, 0)
  const avgDistance = totalDistance / chartData.filter(d => d.distance > 0).length || 0

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-xs text-gray-600">Total 30j</div>
          <div className="text-2xl font-bold text-orange-600">{totalDistance.toFixed(1)} km</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-gray-600">Moyenne/sortie</div>
          <div className="text-2xl font-bold text-blue-600">{avgDistance.toFixed(1)} km</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            interval={4}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}km`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value) => [`${value} km`, 'Distance']}
          />
          <Area
            type="monotone"
            dataKey="distance"
            stroke="#ea580c"
            strokeWidth={2}
            fill="url(#colorDistance)"
            dot={{ fill: '#ea580c', r: 3 }}
            activeDot={{ r: 5, fill: '#ea580c' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
