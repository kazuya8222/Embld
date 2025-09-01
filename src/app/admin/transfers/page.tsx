'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { DollarSign, Send, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
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

interface WithdrawalRequest {
  id: string
  user_id: string
  amount: number
  status: string
  requested_at: string
  processed_at: string | null
  rejection_reason: string | null
  users: {
    id: string
    email: string
    stripe_account_id: string
  }
}

export default function AdminTransfersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [transferAmount, setTransferAmount] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [description, setDescription] = useState('')
  const [processing, setProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user?.email === 'pontas0523@gmail.com') {
      fetchUsers()
      fetchWithdrawalRequests()
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

  const fetchWithdrawalRequests = async () => {
    try {
      const response = await fetch('/api/admin/withdrawal-requests')
      if (response.ok) {
        const data = await response.json()
        setWithdrawalRequests(data.requests)
      }
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error)
      toast.error('出金リクエストの取得に失敗しました')
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

  const handleWithdrawalAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/withdrawal-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(
          action === 'approve' 
            ? '出金リクエストを承認しました' 
            : '出金リクエストを却下しました'
        )
        setRejectionReason('')
        await fetchWithdrawalRequests()
        await fetchUsers()
      } else {
        toast.error(data.error || '処理に失敗しました')
      }
    } catch (error) {
      console.error('Withdrawal action error:', error)
      toast.error('処理中にエラーが発生しました')
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">アクセス権限がありません</h2>
          <p className="text-gray-600">この機能は管理者のみアクセス可能です</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">出金管理</h1>
        <p className="text-gray-600 mt-2">ユーザーへの収益分配と出金リクエスト管理</p>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            出金リクエスト
            {withdrawalRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge variant="destructive">
                {withdrawalRequests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">
            ユーザー管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>出金リクエスト一覧</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">出金リクエストはありません</h3>
                  <p className="text-gray-500">新しいリクエストが届くとここに表示されます</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ユーザー</TableHead>
                        <TableHead>金額</TableHead>
                        <TableHead>リクエスト日時</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawalRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.users.email}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(request.amount)}
                          </TableCell>
                          <TableCell>
                            {new Date(request.requested_at).toLocaleString('ja-JP')}
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Clock className="w-3 h-3 mr-1" />
                                承認待ち
                              </Badge>
                            )}
                            {request.status === 'completed' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                完了
                              </Badge>
                            )}
                            {request.status === 'rejected' && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                                <XCircle className="w-3 h-3 mr-1" />
                                却下
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleWithdrawalAction(request.id, 'approve')}
                                  disabled={processing}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  承認
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={processing}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      却下
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>リクエストを却下</DialogTitle>
                                      <DialogDescription>
                                        却下理由を入力してください
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid gap-2">
                                        <Label htmlFor="reason">却下理由</Label>
                                        <Input
                                          id="reason"
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          placeholder="残高不足など"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        onClick={() => handleWithdrawalAction(request.id, 'reject')}
                                        disabled={processing || !rejectionReason}
                                        variant="destructive"
                                      >
                                        却下する
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                            {request.status === 'rejected' && request.rejection_reason && (
                              <div className="text-sm text-gray-500">
                                理由: {request.rejection_reason}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ユーザー一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>メールアドレス</TableHead>
                      <TableHead>Stripe残高</TableHead>
                      <TableHead>累計支払額</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          {user.stripe_balance !== null ? formatCurrency(user.stripe_balance) : '-'}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(user.total_paid)}
                        </TableCell>
                        <TableCell>
                          {user.stripe_onboarding_completed ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
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
                                >
                                  <Send className="w-4 h-4 mr-1" />
                                  送金
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>収益送金</DialogTitle>
                                  <DialogDescription>
                                    {selectedUser?.email}への送金（70%が送金されます）
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="amount">総収益額（円）</Label>
                                    <Input
                                      id="amount"
                                      type="number"
                                      value={transferAmount}
                                      onChange={(e) => setTransferAmount(e.target.value)}
                                      placeholder="10000"
                                    />
                                    {transferAmount && (
                                      <p className="text-sm text-gray-500">
                                        送金額: ¥{Math.floor(parseInt(transferAmount) * 0.7)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="description">説明（任意）</Label>
                                    <Input
                                      id="description"
                                      value={description}
                                      onChange={(e) => setDescription(e.target.value)}
                                      placeholder="2024年1月売上分"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={handleTransfer}
                                    disabled={!transferAmount || processing}
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
                                  >
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    出金
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>銀行口座への出金</DialogTitle>
                                    <DialogDescription>
                                      {selectedUser?.email}の残高を銀行口座へ出金
                                      <br />
                                      現在の残高: {formatCurrency(selectedUser?.stripe_balance || 0)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="payout-amount">出金額（円、空欄で全額）</Label>
                                      <Input
                                        id="payout-amount"
                                        type="number"
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        placeholder="空欄で全額出金"
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="payout-description">説明（任意）</Label>
                                      <Input
                                        id="payout-description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="定期出金"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={handlePayout}
                                      disabled={processing}
                                      className="bg-green-600 hover:bg-green-700"
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}