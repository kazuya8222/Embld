'use client'

import { Users, Lightbulb, Clock, CheckCircle, Package } from 'lucide-react'

interface StatsProps {
  stats: {
    totalUsers: number
    totalProposals: number
    totalProducts: number
    pendingProposals: number
    activeUsers: number
  }
}

export function DashboardStats({ stats }: StatsProps) {
  const statCards = [
    {
      name: '総ユーザー数',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'アクティブユーザー',
      value: stats.activeUsers.toLocaleString(),
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      name: '企画書数',
      value: stats.totalProposals.toLocaleString(),
      icon: Lightbulb,
      color: 'bg-yellow-500'
    },
    {
      name: 'プロダクト数',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg border p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}