'use client'

import { useState, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  Download,
  Filter
} from 'lucide-react'

interface RevenueData {
  date: string
  revenue: number
  payout_amount: number
  transaction_count: number
}

interface Totals {
  totalRevenue: number
  totalPayout: number
  totalTransactions: number
  averageRevenue: number
}

export function RevenueDashboard({ productId }: { productId?: string }) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [data, setData] = useState<RevenueData[]>([])
  const [totals, setTotals] = useState<Totals>({
    totalRevenue: 0,
    totalPayout: 0,
    totalTransactions: 0,
    averageRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [period, productId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        period,
        ...(productId && { product_id: productId })
      })
      
      const response = await fetch(`/api/revenue/analytics?${params}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result.analytics)
        setTotals(result.totals)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(value / 100) // Convert from cents
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    switch (period) {
      case 'day':
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
      case 'week':
        return `W${getWeekNumber(date)}`
      case 'month':
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })
      case 'year':
        return date.getFullYear().toString()
      default:
        return dateStr
    }
  }

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const exportCSV = () => {
    const headers = ['Date', 'Revenue (JPY)', 'Payout (JPY)', 'Transactions']
    const rows = data.map(item => [
      item.date,
      (item.revenue / 100).toString(),
      (item.payout_amount / 100).toString(),
      item.transaction_count.toString()
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#e0e0e0]">収益ダッシュボード</h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'year'] as const).map(p => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
                className={period === p ? 
                  'bg-[#e0e0e0] text-[#1a1a1a] hover:bg-[#d0d0d0]' : 
                  'border-[#4a4a4a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#e0e0e0]'
                }
              >
                {p === 'day' ? '日別' : 
                 p === 'week' ? '週別' : 
                 p === 'month' ? '月別' : '年別'}
              </Button>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportCSV}
            className="border-[#4a4a4a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#e0e0e0]"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV出力
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#e0e0e0]">総収益</CardTitle>
            <DollarSign className="h-4 w-4 text-[#a0a0a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#e0e0e0]">{formatCurrency(totals.totalRevenue)}</div>
            <p className="text-xs text-[#808080]">
              全期間の合計
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#e0e0e0]">あなたの収益</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#a0a0a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(totals.totalPayout)}
            </div>
            <p className="text-xs text-[#808080]">
              30%の収益分配
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#e0e0e0]">取引数</CardTitle>
            <ShoppingCart className="h-4 w-4 text-[#a0a0a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#e0e0e0]">{totals.totalTransactions}</div>
            <p className="text-xs text-[#808080]">
              総取引回数
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#e0e0e0]">平均収益</CardTitle>
            <Calendar className="h-4 w-4 text-[#a0a0a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#e0e0e0]">{formatCurrency(totals.averageRevenue)}</div>
            <p className="text-xs text-[#808080]">
              期間あたり平均
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
        <CardHeader>
          <CardTitle className="text-[#e0e0e0]">収益推移</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis 
                tickFormatter={(value) => `¥${(value / 100).toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `日付: ${formatDate(label)}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="総収益"
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey="payout_amount" 
                name="あなたの収益"
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorPayout)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Volume Chart */}
      <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
        <CardHeader>
          <CardTitle className="text-[#e0e0e0]">取引数推移</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `日付: ${formatDate(label)}`}
              />
              <Bar 
                dataKey="transaction_count" 
                name="取引数"
                fill="#8b5cf6" 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}