'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, DollarSign, Flame } from 'lucide-react'

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: string
  color: string
}

function MetricCard({ icon, label, value, trend, color }: MetricCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  
  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setAnimatedValue(value)
          clearInterval(timer)
        } else {
          setAnimatedValue(Math.floor(current))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    }
  }, [value])
  
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
          {icon}
        </div>
        {trend && (
          <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm opacity-90">{label}</p>
        <p className="text-3xl font-bold">
          {typeof value === 'number' ? animatedValue.toLocaleString() : value}
        </p>
      </div>
    </div>
  )
}

interface TrendingMetricsProps {
  totalIdeas: number
  totalWants: number
  activeUsers: number
  estimatedRevenue: number
}

export function TrendingMetrics({ totalIdeas, totalWants, activeUsers, estimatedRevenue }: TrendingMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard
        icon={<Flame className="w-6 h-6" />}
        label="投稿されたアイデア"
        value={totalIdeas}
        trend="+12%"
        color="from-orange-500 to-red-500"
      />
      <MetricCard
        icon={<Users className="w-6 h-6" />}
        label="アクティブユーザー"
        value={activeUsers}
        trend="+25%"
        color="from-blue-500 to-purple-500"
      />
      <MetricCard
        icon={<TrendingUp className="w-6 h-6" />}
        label="総ほしい数"
        value={totalWants}
        trend="+18%"
        color="from-green-500 to-teal-500"
      />
      <MetricCard
        icon={<DollarSign className="w-6 h-6" />}
        label="推定市場価値"
        value={`¥${estimatedRevenue.toLocaleString()}`}
        trend="+30%"
        color="from-purple-500 to-pink-500"
      />
    </div>
  )
}