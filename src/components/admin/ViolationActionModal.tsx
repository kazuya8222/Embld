'use client'

import { X } from 'lucide-react'

interface Violation {
  id: string
  violation_type: string
  description: string
  related_content_id: string | null
  related_content_type: string | null
  action_taken: string
  admin_notes: string | null
  resolved_at: string | null
  created_at: string
  user_id: string
  user: {
    id: string
    username: string | null
    email: string
  }
  created_by_user: {
    id: string
    username: string | null
    email: string
  } | null
}

interface ViolationActionModalProps {
  violation: Violation
  type: 'view' | 'edit'
  onClose: () => void
  onSuccess: () => void
}

export function ViolationActionModal({ violation, type, onClose, onSuccess }: ViolationActionModalProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getViolationTypeText = (type: string) => {
    switch (type) {
      case 'spam': return 'スパム'
      case 'inappropriate_content': return '不適切なコンテンツ'
      case 'harassment': return 'ハラスメント'
      case 'copyright': return '著作権侵害'
      case 'other': return 'その他'
      default: return type
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'warning': return '警告'
      case 'content_removal': return 'コンテンツ削除'
      case 'temporary_suspension': return '一時停止'
      case 'permanent_ban': return '永久BAN'
      default: return action
    }
  }

  const getContentTypeText = (type: string | null) => {
    switch (type) {
      case 'idea': return 'アイデア'
      case 'comment': return 'コメント'
      case 'user_profile': return 'ユーザープロフィール'
      default: return type || '不明'
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">違反詳細</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">基本情報</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">違反ID</label>
                <p className="mt-1 text-sm text-gray-900">{violation.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">違反タイプ</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {getViolationTypeText(violation.violation_type)}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">処理日時</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(violation.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">解決日時</label>
                <p className="mt-1 text-sm text-gray-900">
                  {violation.resolved_at ? formatDate(violation.resolved_at) : '未解決'}
                </p>
              </div>
            </div>
          </div>

          {/* 違反ユーザー情報 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">違反ユーザー</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                  <p className="mt-1 text-sm text-gray-900">{violation.user.username || '未設定'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                  <p className="mt-1 text-sm text-gray-900">{violation.user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ユーザーID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{violation.user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 違反内容 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">違反内容</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">詳細説明</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{violation.description}</p>
                </div>
              </div>
              
              {violation.related_content_type && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">関連コンテンツタイプ</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getContentTypeText(violation.related_content_type)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">関連コンテンツID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {violation.related_content_id || '未設定'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 対応アクション */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">対応アクション</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">実施したアクション</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    violation.action_taken === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    violation.action_taken === 'content_removal' ? 'bg-orange-100 text-orange-800' :
                    violation.action_taken === 'temporary_suspension' ? 'bg-red-100 text-red-800' :
                    violation.action_taken === 'permanent_ban' ? 'bg-red-200 text-red-900' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getActionText(violation.action_taken)}
                  </span>
                </p>
              </div>
              
              {violation.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">管理者メモ</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-900">{violation.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 処理者情報 */}
          {violation.created_by_user && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">処理者情報</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">処理者名</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {violation.created_by_user.username || '未設定'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <p className="mt-1 text-sm text-gray-900">{violation.created_by_user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}