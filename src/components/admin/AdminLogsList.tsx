'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Eye, Activity, User, Lightbulb, Shield, Settings } from 'lucide-react'

interface AdminLog {
  id: string
  action: string
  target_type: string | null
  target_id: string | null
  details: any
  created_at: string
  admin_user_id: string
  admin_user: {
    id: string
    username: string | null
    email: string
  }
}

interface AdminLogsListProps {
  logs: AdminLog[]
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export function AdminLogsList({ logs, currentPage, totalPages, searchParams }: AdminLogsListProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [actionFilter, setActionFilter] = useState(searchParams.action || '')
  const [targetTypeFilter, setTargetTypeFilter] = useState(searchParams.target_type || '')
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null)

  const handleActionFilter = (action: string) => {
    const params = new URLSearchParams(urlSearchParams)
    if (action) {
      params.set('action', action)
    } else {
      params.delete('action')
    }
    params.delete('page')
    setActionFilter(action)
    router.push(`/admin/logs?${params.toString()}`)
  }

  const handleTargetTypeFilter = (targetType: string) => {
    const params = new URLSearchParams(urlSearchParams)
    if (targetType) {
      params.set('target_type', targetType)
    } else {
      params.delete('target_type')
    }
    params.delete('page')
    setTargetTypeFilter(targetType)
    router.push(`/admin/logs?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams)
    params.set('page', page.toString())
    router.push(`/admin/logs?${params.toString()}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      'user_view': 'ユーザー詳細表示',
      'user_edit': 'ユーザー編集',
      'user_status': 'ユーザーステータス変更',
      'idea_view': 'アイデア詳細表示',
      'idea_edit': 'アイデア編集',
      'idea_approve': 'アイデア承認',
      'violation_created': '違反記録作成',
      'grant_admin': '管理者権限付与',
      'settings_update': '設定更新'
    }
    return actionMap[action] || action
  }

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return <User className="w-4 h-4 text-blue-600" />
    if (action.includes('idea')) return <Lightbulb className="w-4 h-4 text-yellow-600" />
    if (action.includes('violation')) return <Shield className="w-4 h-4 text-red-600" />
    if (action.includes('settings') || action.includes('admin')) return <Settings className="w-4 h-4 text-purple-600" />
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('user')) return 'bg-blue-100 text-blue-800'
    if (action.includes('idea')) return 'bg-yellow-100 text-yellow-800'
    if (action.includes('violation')) return 'bg-red-100 text-red-800'
    if (action.includes('settings') || action.includes('admin')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getTargetTypeText = (targetType: string | null) => {
    switch (targetType) {
      case 'user': return 'ユーザー'
      case 'idea': return 'アイデア'
      case 'violation': return '違反'
      case 'category': return 'カテゴリ'
      case 'tag': return 'タグ'
      default: return targetType || 'システム'
    }
  }

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => handleActionFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全てのアクション</option>
            <option value="user_view">ユーザー詳細表示</option>
            <option value="user_edit">ユーザー編集</option>
            <option value="user_status">ユーザーステータス変更</option>
            <option value="idea_view">アイデア詳細表示</option>
            <option value="idea_edit">アイデア編集</option>
            <option value="idea_approve">アイデア承認</option>
            <option value="violation_created">違反記録作成</option>
            <option value="grant_admin">管理者権限付与</option>
            <option value="settings_update">設定更新</option>
          </select>
          
          <select
            value={targetTypeFilter}
            onChange={(e) => handleTargetTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全てのターゲット</option>
            <option value="user">ユーザー</option>
            <option value="idea">アイデア</option>
            <option value="violation">違反</option>
            <option value="category">カテゴリ</option>
            <option value="tag">タグ</option>
          </select>
        </div>
      </div>

      {/* ログ一覧 */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  実行者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  対象
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  実行日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionText(log.action)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log.admin_user.username || '未設定'}
                      </div>
                      <div className="text-sm text-gray-500">{log.admin_user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        {getTargetTypeText(log.target_type)}
                      </div>
                      {log.target_id && (
                        <div className="text-sm text-gray-500 font-mono">
                          {log.target_id.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:text-blue-900"
                      title="詳細表示"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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

        {logs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">ログがありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              指定した条件に一致するログが見つかりませんでした。
            </p>
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">操作ログ詳細</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ログID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">アクション</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                      {getActionText(selectedLog.action)}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">実行者</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedLog.admin_user.username || '未設定'} ({selectedLog.admin_user.email})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">実行日時</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">対象タイプ</label>
                  <p className="mt-1 text-sm text-gray-900">{getTargetTypeText(selectedLog.target_type)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">対象ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.target_id || '未設定'}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">詳細情報</label>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}