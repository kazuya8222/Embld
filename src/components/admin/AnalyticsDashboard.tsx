'use client'

import { TrendingUp, Users, FileText, Package, CheckCircle, DollarSign } from 'lucide-react'

interface AnalyticsData {
  userStats: {
    total: number
    active: number
    newThisMonth: number
    premiumUsers: number
  }
  proposalStats: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  productStats: {
    total: number
    development: number
    testing: number
    launched: number
  }
  revenueStats: {
    totalRevenue: number
    totalTransactions: number
  }
  recentProposals: Array<{
    id: string
    title: string
    created_at: string
    status: string
    user_email: string
  }>
  recentProducts: Array<{
    id: string
    title: string
    created_at: string
    status: string
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
      name: '企画書数',
      value: data.proposalStats.total.toLocaleString(),
      change: `${data.proposalStats.pending} 審査中`,
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      name: 'プロダクト数',
      value: data.productStats.total.toLocaleString(),
      change: `${data.productStats.launched} ローンチ済み`,
      icon: Package,
      color: 'bg-green-500'
    },
    {
      name: '総収益',
      value: `¥${data.revenueStats.totalRevenue.toLocaleString()}`,
      change: `${data.revenueStats.totalTransactions} 取引`,
      icon: DollarSign,
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
        {/* 最近の企画書 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">最近の企画書</h3>
          <div className="space-y-3">
            {data.recentProposals.map((proposal) => (
              <div key={proposal.id} className="flex items-start space-x-3 py-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {proposal.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {proposal.user_email} • {formatDate(proposal.created_at)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    proposal.status === '承認済み' ? 'bg-green-100 text-green-800' :
                    proposal.status === '審査中' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近のプロダクト */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">最近のプロダクト</h3>
          <div className="space-y-3">
            {data.recentProducts.map((product) => (
              <div key={product.id} className="flex items-start space-x-3 py-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(product.created_at)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'launched' ? 'bg-green-100 text-green-800' :
                    product.status === 'testing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ステータス別内訳 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">企画書ステータス別内訳</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">{data.proposalStats.pending}</div>
              <div className="text-sm text-yellow-600">審査中</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{data.proposalStats.approved}</div>
              <div className="text-sm text-green-600">承認済み</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">{data.proposalStats.rejected}</div>
              <div className="text-sm text-red-600">却下</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {Math.round((data.proposalStats.approved / data.proposalStats.total) * 100) || 0}%
              </div>
              <div className="text-sm text-blue-600">承認率</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">プロダクトステータス別内訳</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">{data.productStats.development}</div>
              <div className="text-sm text-yellow-600">開発中</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{data.productStats.testing}</div>
              <div className="text-sm text-blue-600">テスト中</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{data.productStats.launched}</div>
              <div className="text-sm text-green-600">ローンチ済み</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {Math.round((data.productStats.launched / data.productStats.total) * 100) || 0}%
              </div>
              <div className="text-sm text-purple-600">ローンチ率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}