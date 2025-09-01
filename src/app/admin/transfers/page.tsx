'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/components/auth/AuthProvider'
import { DollarSign, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  stripe_account_id: string
  stripe_onboarding_completed: boolean
  total_paid: number
  stripe_balance: number | null
  pending_amount: number
  created_at: string
}

export default function AdminTransfersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [transferAmount, setTransferAmount] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [description, setDescription] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user?.email === 'pontas0523@gmail.com') {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/transfer')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!selectedUser || !transferAmount) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseInt(transferAmount) * 100, // Convert to cents
          description
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(`¥${parseInt(transferAmount) * 0.7}を${selectedUser.email}に送金しました`)
        setTransferAmount('')
        setDescription('')
        setSelectedUser(null)
        await fetchUsers() // Refresh data
      } else {
        toast.error(data.error || '送金に失敗しました')
      }
    } catch (error) {
      console.error('Transfer error:', error)
      toast.error('送金処理中にエラーが発生しました')
    } finally {
      setProcessing(false)
    }
  }

  const handlePayout = async () => {
    if (!selectedUser) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: payoutAmount ? parseInt(payoutAmount) : null, // null means full balance
          description
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(`${selectedUser.email}の出金処理を開始しました`)
        setPayoutAmount('')
        setDescription('')
        setSelectedUser(null)
        await fetchUsers() // Refresh data
      } else {
        toast.error(data.error || '出金処理に失敗しました')
      }
    } catch (error) {
      console.error('Payout error:', error)
      toast.error('出金処理中にエラーが発生しました')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount / 100)
  }

  if (user?.email !== 'pontas0523@gmail.com') {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-[#e0e0e0]">管理者権限が必要です</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <p className="text-[#a0a0a0]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e0e0e0]">Admin - 送金管理</h1>
          <p className="text-[#a0a0a0] mt-1">ユーザーへの収益分配と出金管理</p>
        </div>

        <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
          <CardHeader>
            <CardTitle className="text-[#e0e0e0]">ユーザー一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#e0e0e0]">メールアドレス</TableHead>
                  <TableHead className="text-[#e0e0e0]">Stripe残高</TableHead>
                  <TableHead className="text-[#e0e0e0]">累計支払額</TableHead>
                  <TableHead className="text-[#e0e0e0]">ステータス</TableHead>
                  <TableHead className="text-[#e0e0e0]">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-[#e0e0e0]">{user.email}</TableCell>
                    <TableCell className="text-[#e0e0e0]">
                      {user.stripe_balance !== null ? formatCurrency(user.stripe_balance) : '-'}
                    </TableCell>
                    <TableCell className="text-[#e0e0e0]">
                      {formatCurrency(user.total_paid)}
                    </TableCell>
                    <TableCell>
                      {user.stripe_onboarding_completed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          完了
                        </Badge>
                      ) : (
                        <Badge variant="secondary">未完了</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedUser(user)}
                              className="bg-[#0066cc] text-white hover:bg-[#0052a3]"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              送金
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                            <DialogHeader>
                              <DialogTitle className="text-[#e0e0e0]">収益送金</DialogTitle>
                              <DialogDescription className="text-[#a0a0a0]">
                                {selectedUser?.email}への送金（70%が送金されます）
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-[#e0e0e0]">総収益額（円）</Label>
                                <Input
                                  type="number"
                                  value={transferAmount}
                                  onChange={(e) => setTransferAmount(e.target.value)}
                                  placeholder="10000"
                                  className="bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0]"
                                />
                                {transferAmount && (
                                  <p className="text-sm text-[#a0a0a0] mt-1">
                                    送金額: ¥{Math.floor(parseInt(transferAmount) * 0.7)}
                                  </p>
                                )}
                              </div>
                              <div>
                                <Label className="text-[#e0e0e0]">説明（任意）</Label>
                                <Input
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  placeholder="2024年1月売上分"
                                  className="bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0]"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleTransfer}
                                disabled={!transferAmount || processing}
                                className="bg-[#0066cc] text-white hover:bg-[#0052a3]"
                              >
                                {processing ? '処理中...' : '送金実行'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {user.stripe_balance && user.stripe_balance > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                                className="border-[#3a3a3a] text-[#e0e0e0] hover:bg-[#3a3a3a]"
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                出金
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#2a2a2a] border-[#3a3a3a]">
                              <DialogHeader>
                                <DialogTitle className="text-[#e0e0e0]">銀行口座への出金</DialogTitle>
                                <DialogDescription className="text-[#a0a0a0]">
                                  {selectedUser?.email}の残高を銀行口座へ出金
                                  <br />
                                  現在の残高: {formatCurrency(selectedUser?.stripe_balance || 0)}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-[#e0e0e0]">出金額（円、空欄で全額）</Label>
                                  <Input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    placeholder="空欄で全額出金"
                                    className="bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0]"
                                  />
                                </div>
                                <div>
                                  <Label className="text-[#e0e0e0]">説明（任意）</Label>
                                  <Input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="定期出金"
                                    className="bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0]"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={handlePayout}
                                  disabled={processing}
                                  className="bg-green-600 text-white hover:bg-green-700"
                                >
                                  {processing ? '処理中...' : '出金実行'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}