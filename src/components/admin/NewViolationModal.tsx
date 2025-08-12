'use client'

import { useState } from 'react'
import { X, Save, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NewViolationModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function NewViolationModal({ onClose, onSuccess }: NewViolationModalProps) {
  const [loading, setLoading] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    violation_type: 'spam',
    description: '',
    related_content_type: '',
    related_content_id: '',
    action_taken: 'warning',
    admin_notes: ''
  })

  const supabase = createClient()

  const searchUser = async () => {
    if (!searchEmail.trim()) return

    setLoading(true)
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('email', searchEmail)
        .single()

      if (error) {
        alert('ユーザーが見つかりませんでした')
        return
      }

      setSelectedUser(user)
    } catch (error) {
      console.error('Error searching user:', error)
      alert('ユーザー検索でエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) {
      alert('ユーザーを選択してください')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('user_violations').insert({
        user_id: selectedUser.id,
        violation_type: formData.violation_type,
        description: formData.description,
        related_content_type: formData.related_content_type || null,
        related_content_id: formData.related_content_id || null,
        action_taken: formData.action_taken,
        admin_notes: formData.admin_notes || null,
        resolved_at: new Date().toISOString()
      })

      if (error) {
        console.error('Error creating violation:', error)
        alert('違反記録の作成に失敗しました')
        return
      }

      // ユーザーのステータスを更新（必要に応じて）
      if (formData.action_taken === 'temporary_suspension' || formData.action_taken === 'permanent_ban') {
        await supabase
          .from('users')
          .update({ account_status: 'suspended' })
          .eq('id', selectedUser.id)
      }

      // 管理者ログに記録
      await supabase.from('admin_logs').insert({
        action: 'violation_created',
        target_type: 'user',
        target_id: selectedUser.id,
        details: {
          violation: formData,
          user_email: selectedUser.email
        }
      })

      onSuccess()
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">新しい違反記録を作成</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ユーザー検索 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">対象ユーザー</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="ユーザーのメールアドレスを入力"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={searchUser}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Search className="w-4 h-4 mr-2" />
                  検索
                </button>
              </div>
              
              {selectedUser && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">
                        {selectedUser.username || '未設定'} ({selectedUser.email})
                      </p>
                      <p className="text-sm text-green-700">ID: {selectedUser.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 違反情報 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">違反情報</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">違反タイプ</label>
                <select
                  value={formData.violation_type}
                  onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="spam">スパム</option>
                  <option value="inappropriate_content">不適切なコンテンツ</option>
                  <option value="harassment">ハラスメント</option>
                  <option value="copyright">著作権侵害</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">違反内容の詳細</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="違反の詳細を記述してください"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">関連コンテンツタイプ（任意）</label>
                  <select
                    value={formData.related_content_type}
                    onChange={(e) => setFormData({ ...formData, related_content_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="idea">アイデア</option>
                    <option value="comment">コメント</option>
                    <option value="user_profile">ユーザープロフィール</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">関連コンテンツID（任意）</label>
                  <input
                    type="text"
                    value={formData.related_content_id}
                    onChange={(e) => setFormData({ ...formData, related_content_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="UUID"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 対応アクション */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">対応アクション</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">実施するアクション</label>
                <select
                  value={formData.action_taken}
                  onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="warning">警告</option>
                  <option value="content_removal">コンテンツ削除</option>
                  <option value="temporary_suspension">一時停止</option>
                  <option value="permanent_ban">永久BAN</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">管理者メモ（任意）</label>
                <textarea
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="内部用のメモを記載してください"
                />
              </div>
            </div>
          </div>

          {(formData.action_taken === 'temporary_suspension' || formData.action_taken === 'permanent_ban') && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>注意:</strong> このアクションにより、ユーザーのアカウントが凍結されます。
                    {formData.action_taken === 'permanent_ban' && ' 永久BANは取り消しが困難です。'}
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
              disabled={loading || !selectedUser}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              違反記録を作成
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}