'use client'

import { TrendingUp, Users, Lightbulb, CheckCircle, Clock } from 'lucide-react'

interface AnalyticsData {
  userStats: {
    total: number
    active: number
    newThisMonth: number
    activeThisMonth: number
  }
  ideaStats: {
    total: number
    open: number
    inDevelopment: number
    completed: number
  }
  categoryStats: Record<string, number>
  monthlyUsers: Array<{ month: string; count: number }>
  monthlyIdeas: Array<{ month: string; count: number }>
  recentActivities: Array<{
    id: string
    title: string
    created_at: string
    users: { username: string | null; email: string }
  }>
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const statCards = [
    {
      name: '総ユーザー数',
      value: data.userStats.total.toLocaleString(),
      change: `+${data.userStats.newThisMonth} 今月`,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'アクティブユーザー',
      value: data.userStats.active.toLocaleString(),
      change: `${data.userStats.activeThisMonth} 今月活動`,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      name: '総アイデア数',
      value: data.ideaStats.total.toLocaleString(),
      change: `${data.ideaStats.open} 公開中`,
      icon: Lightbulb,
      color: 'bg-yellow-500'
    },
    {
      name: '開発・完了済み',
      value: (data.ideaStats.inDevelopment + data.ideaStats.completed).toLocaleString(),
      change: `${data.ideaStats.completed} 完了`,
      icon: CheckCircle,
      color: 'bg-purple-500'
    }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* 統計カード */}
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
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* カテゴリ別統計 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">カテゴリ別アイデア数</h3>
          <div className="space-y-3">
            {Object.entries(data.categoryStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([category, count]) => {
                const percentage = (count / data.ideaStats.total) * 100
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {category}
                        </span>
                        <span className="text-sm text-gray-500">{count}件</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* 最近のアクティビティ */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">最近のアイデア投稿</h3>
          <div className="space-y-3">
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 py-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.users.username || '未設定'} • {formatDate(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 月別トレンド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">月別ユーザー登録数</h3>
          <div className="space-y-2">
            {data.monthlyUsers.slice(-6).map((item) => (
              <div key={item.month} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">{item.month}</span>
                <span className="text-sm font-medium text-gray-900">{item.count}人</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">月別アイデア投稿数</h3>
          <div className="space-y-2">
            {data.monthlyIdeas.slice(-6).map((item) => (
              <div key={item.month} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">{item.month}</span>
                <span className="text-sm font-medium text-gray-900">{item.count}件</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ステータス別内訳 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">アイデアステータス別内訳</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{data.ideaStats.open}</div>
            <div className="text-sm text-gray-600">公開中</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{data.ideaStats.inDevelopment}</div>
            <div className="text-sm text-blue-600">開発中</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{data.ideaStats.completed}</div>
            <div className="text-sm text-green-600">完了</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-900">
              {Math.round((data.ideaStats.completed / data.ideaStats.total) * 100) || 0}%
            </div>
            <div className="text-sm text-yellow-600">完了率</div>
          </div>
        </div>
      </div>
    </div>
  )
}