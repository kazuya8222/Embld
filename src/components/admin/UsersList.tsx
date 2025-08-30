'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserStatusBadge } from './UserStatusBadge'

interface User {
  id: string
  email: string
  account_status: string
  last_login_at: string | null
  created_at: string
  is_admin: boolean
  subscription_plan: string
  subscription_status: string
  credits_balance: number
}

interface UsersListProps {
  users: User[]
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export function UsersList({ users, currentPage, totalPages, searchParams }: UsersListProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.status || '')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editingPermission, setEditingPermission] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [updatingPermission, setUpdatingPermission] = useState<string | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    params.delete('page') // リセット
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    params.delete('page') // リセット
    setStatusFilter(status)
    router.push(`/admin/users?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const updateUserStatus = async (userId: string, newStatus: string) => {
    setUpdatingStatus(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ account_status: newStatus })
        .eq('id', userId)

      if (!error) {
        router.refresh()
      } else {
        console.error('Error updating user status:', error)
        alert('ステータスの更新に失敗しました')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました')
    } finally {
      setUpdatingStatus(null)
      setEditingUser(null)
    }
  }

  const updateUserPermission = async (userId: string, isAdmin: boolean) => {
    setUpdatingPermission(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: isAdmin })
        .eq('id', userId)

      if (!error) {
        router.refresh()
      } else {
        console.error('Error updating user permission:', error)
        alert('権限の更新に失敗しました')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました')
    } finally {
      setUpdatingPermission(null)
      setEditingPermission(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="メールアドレスで検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            検索
          </button>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全てのステータス</option>
              <option value="active">有効</option>
              <option value="inactive">無効</option>
              <option value="suspended">凍結</option>
            </select>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  権限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サブスクリプション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  クレジット
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {editingUser === user.id ? (
                        <select
                          value={user.account_status}
                          onChange={(e) => updateUserStatus(user.id, e.target.value)}
                          disabled={updatingStatus === user.id}
                          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">有効</option>
                          <option value="inactive">無効</option>
                          <option value="suspended">凍結</option>
                        </select>
                      ) : (
                        <>
                          <UserStatusBadge status={user.account_status} />
                          <button
                            onClick={() => setEditingUser(user.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="ステータスを編集"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {editingPermission === user.id ? (
                        <select
                          value={user.is_admin ? 'admin' : 'user'}
                          onChange={(e) => updateUserPermission(user.id, e.target.value === 'admin')}
                          disabled={updatingPermission === user.id}
                          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="user">一般ユーザー</option>
                          <option value="admin">管理者</option>
                        </select>
                      ) : (
                        <>
                          {user.is_admin ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              管理者
                            </span>
                          ) : (
                            <span className="text-gray-500">一般ユーザー</span>
                          )}
                          <button
                            onClick={() => setEditingPermission(user.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="権限を編集"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-sm font-medium">{user.subscription_plan}</div>
                    <div className="text-xs text-gray-500">{user.subscription_status}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.credits_balance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                ページ {currentPage} / {totalPages}
              </div>
              <div className="flex space-x-1">
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    前へ
                  </button>
                )}
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    次へ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}