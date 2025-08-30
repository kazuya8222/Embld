'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/common/TopBar'
import { Sidebar } from '@/components/common/Sidebar'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RevenueDashboard } from '@/components/dashboard/RevenueDashboard'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

interface Payout {
  id: string
  amount: number
  currency: string
  status: string
  transferred_at: string | null
  created_at: string
  transaction_id: string
}

interface UserStats {
  totalEarnings: number
  pendingPayouts: number
  completedPayouts: number
  productCount: number
}

export default function RevenuePage() {
  const { user } = useAuth()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    productCount: 0
  })
  const [stripeConnected, setStripeConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarLocked, setIsSidebarLocked] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPayouts()
      checkStripeConnection()
    }
  }, [user])

  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/revenue/payouts')
      const data = await response.json()
      
      if (response.ok) {
        setPayouts(data.payouts)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkStripeConnection = async () => {
    try {
      const response = await fetch('/api/stripe/connect')
      const data = await response.json()
      setStripeConnected(data.connected && data.onboarding_completed)
    } catch (error) {
      console.error('Failed to check Stripe connection:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount / 100) // Convert from cents
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">完了</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">保留中</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">失敗</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleMenuToggle = () => {
    const newLockState = !isSidebarLocked
    setIsSidebarLocked(newLockState)
    setIsSidebarOpen(newLockState)
  }

  const handleMenuHover = (isHovering: boolean) => {
    setIsSidebarHovered(isHovering)
    if (!isSidebarLocked) {
      setIsSidebarOpen(isHovering)
    }
  }

  const shouldShowSidebar = isSidebarLocked || isSidebarHovered

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col relative">
        <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} isMenuLocked={isSidebarLocked} />
        
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {shouldShowSidebar && (
            <motion.div
              initial={{ x: -264, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -264, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 h-screen"
              onMouseEnter={() => handleMenuHover(true)}
              onMouseLeave={() => handleMenuHover(false)}
            >
              <Sidebar isLocked={isSidebarLocked} onLockToggle={handleMenuToggle} />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-[#a0a0a0]">Loading...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col relative">
      <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} isMenuLocked={isSidebarLocked} />
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.div
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50 h-screen"
            onMouseEnter={() => handleMenuHover(true)}
            onMouseLeave={() => handleMenuHover(false)}
          >
            <Sidebar isLocked={isSidebarLocked} onLockToggle={handleMenuToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#e0e0e0]">収益管理</h1>
          <p className="text-[#a0a0a0] mt-1">
            プロダクトからの収益とPayoutの状況を確認できます
          </p>
        </div>
        <Link href="/dashboard/settings/stripe">
          <Button 
            className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]"
          >
            <Settings className="w-4 h-4 mr-2" />
            Stripe設定
          </Button>
        </Link>
      </div>

      {/* Stripe Connection Warning */}
      {!stripeConnected && (
        <Card className="border-red-300 bg-red-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-900 font-medium">
                  Stripe Connectの設定が未完了です
                </p>
                <p className="text-red-700 text-sm mt-1">
                  収益を受け取るには銀行口座の登録が必要です。設定を完了してください。
                </p>
                <Link href="/dashboard/settings/stripe" className="mt-2 inline-block">
                  <Button size="sm" className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]">
                    設定を完了する
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#e0e0e0]">総収益</CardTitle>
            <DollarSign className="h-4 w-4 text-[#a0a0a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <p className="text-xs text-[#808080]">
              全期間の合計
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#e0e0e0]">保留中の収益</CardTitle>
            <Clock className="h-4 w-4 text-[#a0a0a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {formatCurrency(stats.pendingPayouts)}
            </div>
            <p className="text-xs text-[#808080]">
              振込待ち
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#e0e0e0]">振込完了</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#a0a0a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#e0e0e0]">
              {formatCurrency(stats.completedPayouts)}
            </div>
            <p className="text-xs text-[#808080]">
              銀行口座へ振込済み
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#e0e0e0]">プロダクト数</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#a0a0a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#e0e0e0]">{stats.productCount}</div>
            <p className="text-xs text-[#808080]">
              収益発生中
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Dashboard */}
      <RevenueDashboard />

      {/* Recent Payouts */}
      <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
        <CardHeader>
          <CardTitle className="text-[#e0e0e0]">最近のPayout</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-[#a0a0a0] mx-auto mb-4" />
              <p className="text-[#a0a0a0]">まだPayoutがありません</p>
              <p className="text-[#808080] text-sm mt-1">
                プロダクトが売れると収益が表示されます
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-[#e0e0e0]">
                      金額
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#e0e0e0]">
                      ステータス
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#e0e0e0]">
                      作成日
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#e0e0e0]">
                      振込日
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {formatCurrency(payout.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="py-3 px-4 text-[#a0a0a0]">
                        {new Date(payout.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="py-3 px-4 text-[#a0a0a0]">
                        {payout.transferred_at ? 
                          new Date(payout.transferred_at).toLocaleDateString('ja-JP') 
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </main>
    </div>
  )
}