'use client'

import { useState } from 'react'
import { X, Save, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  username: string | null
  account_status: string
  terms_agreed_at: string | null
  last_login_at: string | null
  created_at: string
  is_admin: boolean
  is_developer: boolean
}

interface UserActionModalProps {
  user: User
  type: 'view' | 'edit' | 'status'
  onClose: () => void
  onSuccess: () => void
}

export function UserActionModal({ user, type, onClose, onSuccess }: UserActionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: user.username || '',
    account_status: user.account_status,
    is_admin: user.is_admin,
    is_developer: user.is_developer
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username || null,
          account_status: formData.account_status,
          is_admin: formData.is_admin,
          is_developer: formData.is_developer,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('更新エラー:', error)
        alert('更新に失敗しました')
        return
      }

      // 管理者ログに記録
      await supabase.from('admin_logs').insert({
        action: `user_${type}`,
        target_type: 'user',
        target_id: user.id,
        details: {
          changes: formData,
          original: {
            username: user.username,
            account_status: user.account_status,
            is_admin: user.is_admin,
            is_developer: user.is_developer
          }
        }
      })

      onSuccess()
    } catch (error) {
      console.error('エラー:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getTitle = () => {
    switch (type) {
      case 'view': return 'ユーザー詳細'
      case 'edit': return 'ユーザー編集'
      case 'status': return 'ステータス変更'
      default: return 'ユーザー管理'
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {type === 'view' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ユーザーID</label>
                  <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                  <p className="mt-1 text-sm text-gray-900">{user.username || '未設定'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">アカウント状態</label>
                  <p className="mt-1 text-sm text-gray-900">{user.account_status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">登録日時</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">最終ログイン</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.last_login_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">利用規約同意</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.terms_agreed_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">権限</label>
                  <div className="mt-1 space-x-2">
                    {user.is_admin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        管理者
                      </span>
                    )}
                    {user.is_developer && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        開発者
                      </span>
                    )}
                    {!user.is_admin && !user.is_developer && (
                      <span className="text-gray-500">一般ユーザー</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">アカウントステータス</label>
                <select
                  value={formData.account_status}
                  onChange={(e) => setFormData({ ...formData, account_status: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">有効</option>
                  <option value="inactive">無効</option>
                  <option value="suspended">凍結</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">権限</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_admin}
                      onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">管理者権限</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_developer}
                      onChange={(e) => setFormData({ ...formData, is_developer: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">開発者権限</span>
                  </label>
                </div>
              </div>

              {formData.account_status === 'suspended' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        このユーザーは凍結されます。ログインできなくなります。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  保存
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}