'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/common/TopBar'
import { Sidebar } from '@/components/common/Sidebar'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function StripeConnectSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [accountStatus, setAccountStatus] = useState<{
    connected: boolean
    onboarding_completed: boolean
    account?: {
      id: string
      email: string
      charges_enabled: boolean
      payouts_enabled: boolean
      details_submitted: boolean
    }
  } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarLocked, setIsSidebarLocked] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  useEffect(() => {
    checkAccountStatus()
    
    // Check for success or refresh parameters
    const success = searchParams.get('success')
    const refresh = searchParams.get('refresh')
    
    if (success === 'true') {
      // Onboarding completed, refresh status
      setTimeout(() => {
        checkAccountStatus()
      }, 2000)
    } else if (refresh === 'true') {
      // User needs to continue onboarding
      handleConnect()
    }
  }, [searchParams])

  const checkAccountStatus = async () => {
    setCheckingStatus(true)
    try {
      const response = await fetch('/api/stripe/connect')
      const data = await response.json()
      setAccountStatus(data)
    } catch (error) {
      console.error('Failed to check account status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url
      } else {
        alert('エラーが発生しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Failed to create Stripe account:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
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

  if (!user) {
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
          <div className="max-w-4xl mx-auto p-6">
            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-[#e0e0e0]">ログインが必要です</h3>
                <p className="text-[#a0a0a0] mb-4">
                  Stripe Connectを設定するにはログインしてください。
                </p>
                <Button onClick={() => router.push('/auth/login')} className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]">
                  ログインページへ
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (checkingStatus) {
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
          <div className="max-w-4xl mx-auto p-6">
            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#a0a0a0]" />
                <p className="text-[#a0a0a0]">アカウント情報を確認中...</p>
              </CardContent>
            </Card>
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
        <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#e0e0e0]">収益受け取り設定</h1>
        <p className="text-[#a0a0a0] mt-2">
          Stripe Connectを使用して、プロダクトの売上から収益を受け取るための銀行口座を設定します。
        </p>
      </div>

      {/* Status Card */}
      <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#e0e0e0]">
            <CreditCard className="w-5 h-5 text-[#a0a0a0]" />
            Stripe Connect ステータス
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountStatus?.connected ? (
            <>
              {/* Connected Account Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">アカウント接続済み</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a0a0a0]">アカウントID:</span>
                    <code className="bg-[#3a3a3a] text-[#e0e0e0] px-2 py-1 rounded text-xs">
                      {accountStatus.account?.id}
                    </code>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#a0a0a0]">メールアドレス:</span>
                    <span className="text-[#e0e0e0]">{accountStatus.account?.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#a0a0a0]">決済受付:</span>
                    {accountStatus.account?.charges_enabled ? (
                      <Badge className="bg-green-100 text-green-800">有効</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">設定中</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#a0a0a0]">振込設定:</span>
                    {accountStatus.account?.payouts_enabled ? (
                      <Badge className="bg-green-100 text-green-800">有効</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">設定中</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions for connected account */}
              {accountStatus.onboarding_completed ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-300 mb-3">
                    すべての設定が完了しました。プロダクトの売上から自動的に収益が振り込まれます。
                  </p>
                  <div className="flex gap-3">
                    <Button size="sm" onClick={checkAccountStatus} className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      ステータスを更新
                    </Button>
                    <a 
                      href="https://dashboard.stripe.com/express/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Stripeダッシュボード
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">設定が未完了です</p>
                      <p className="text-sm text-amber-700 mt-1">
                        銀行口座情報など、必要な情報の入力を完了してください。
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleConnect} disabled={loading} className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      '設定を続ける'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Not connected */
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 text-[#a0a0a0] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#e0e0e0] mb-2">
                Stripe Connectが未設定です
              </h3>
              <p className="text-[#a0a0a0] mb-6 max-w-md mx-auto">
                収益を受け取るには、Stripe Connectで銀行口座を設定する必要があります。
                設定は数分で完了します。
              </p>
              <Button onClick={handleConnect} disabled={loading} size="lg" className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Stripe Connectを設定する
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader>
            <CardTitle className="text-base text-[#e0e0e0]">収益分配について</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>プロダクトの売上の30%があなたの収益となります</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>収益は自動的に登録した銀行口座に振り込まれます</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>振込は週次または月次で行われます</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader>
            <CardTitle className="text-base text-[#e0e0e0]">セキュリティについて</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Stripeの安全な決済システムを使用</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>銀行口座情報は暗号化されて保護されます</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>PCI DSS準拠のセキュリティ基準</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
        </div>
      </main>
    </div>
  )
}