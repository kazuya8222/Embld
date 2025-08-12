'use client'

import { useState } from 'react'
import { X, Save, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Idea {
  id: string
  title: string
  category: string
  tags: string[] | null
  status: string
  approval_status: string
  created_at: string
  updated_at: string
  admin_notes: string | null
  users: {
    id: string
    username: string | null
    email: string
  }
  wants: { count: number }[]
  comments: { count: number }[]
}

interface IdeaActionModalProps {
  idea: Idea
  type: 'view' | 'edit' | 'approve'
  onClose: () => void
  onSuccess: () => void
}

export function IdeaActionModal({ idea, type, onClose, onSuccess }: IdeaActionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: idea.title,
    category: idea.category,
    status: idea.status,
    approval_status: idea.approval_status,
    admin_notes: idea.admin_notes || ''
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (type === 'edit') {
        updateData.title = formData.title
        updateData.category = formData.category
        updateData.status = formData.status
        updateData.admin_notes = formData.admin_notes
      } else if (type === 'approve') {
        updateData.approval_status = formData.approval_status
        updateData.admin_notes = formData.admin_notes
        if (formData.approval_status !== 'pending') {
          updateData.reviewed_at = new Date().toISOString()
        }
      }

      const { error } = await supabase
        .from('ideas')
        .update(updateData)
        .eq('id', idea.id)

      if (error) {
        console.error('更新エラー:', error)
        alert('更新に失敗しました')
        return
      }

      // 管理者ログに記録
      await supabase.from('admin_logs').insert({
        action: `idea_${type}`,
        target_type: 'idea',
        target_id: idea.id,
        details: {
          changes: formData,
          original: {
            title: idea.title,
            category: idea.category,
            status: idea.status,
            approval_status: idea.approval_status,
            admin_notes: idea.admin_notes
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

  const handleApprove = () => {
    setFormData({ ...formData, approval_status: 'approved' })
  }

  const handleReject = () => {
    setFormData({ ...formData, approval_status: 'rejected' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getTitle = () => {
    switch (type) {
      case 'view': return 'アイデア詳細'
      case 'edit': return 'アイデア編集'
      case 'approve': return 'アイデア承認'
      default: return 'アイデア管理'
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
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
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">アイデアID</label>
                  <p className="mt-1 text-sm text-gray-900">{idea.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">投稿者</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {idea.users.username || '未設定'} ({idea.users.email})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">タイトル</label>
                  <p className="mt-1 text-sm text-gray-900">{idea.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
                  <p className="mt-1 text-sm text-gray-900">{idea.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ステータス</label>
                  <p className="mt-1 text-sm text-gray-900">{idea.status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">承認状態</label>
                  <p className="mt-1 text-sm text-gray-900">{idea.approval_status}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">投稿日時</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(idea.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">更新日時</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(idea.updated_at)}</p>
                </div>
              </div>
              
              {idea.tags && idea.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ほしい数</label>
                  <p className="mt-1 text-sm text-gray-900">{idea.wants?.[0]?.count || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">コメント数</label>
                  <p className="mt-1 text-sm text-gray-900">{idea.comments?.[0]?.count || 0}</p>
                </div>
              </div>

              {idea.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">運営メモ</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {idea.admin_notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {type === 'approve' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-blue-900">承認操作</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        このアイデアを承認または却下してください
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleApprove}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                          formData.approval_status === 'approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        承認
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                          formData.approval_status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        却下
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {type === 'edit' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">タイトル</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">ステータス</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">下書き</option>
                      <option value="open">公開中</option>
                      <option value="in_development">開発中</option>
                      <option value="completed">完了</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">運営メモ</label>
                <textarea
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="運営用のメモを入力してください（ユーザーには表示されません）"
                />
              </div>

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