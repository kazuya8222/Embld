'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Eye, Plus, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { ViolationActionModal } from './ViolationActionModal'
import { NewViolationModal } from './NewViolationModal'

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

interface ViolationsListProps {
  violations: Violation[]
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export function ViolationsList({ violations, currentPage, totalPages, searchParams }: ViolationsListProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')
  const [typeFilter, setTypeFilter] = useState(searchParams.type || '')
  const [actionFilter, setActionFilter] = useState(searchParams.action || '')
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null)
  const [modalType, setModalType] = useState<'view' | 'edit' | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    params.delete('page')
    router.push(`/admin/violations?${params.toString()}`)
  }

  const handleTypeFilter = (type: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (type) {
      params.set('type', type)
    } else {
      params.delete('type')
    }
    params.delete('page')
    setTypeFilter(type)
    router.push(`/admin/violations?${params.toString()}`)
  }

  const handleActionFilter = (action: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (action) {
      params.set('action', action)
    } else {
      params.delete('action')
    }
    params.delete('page')
    setActionFilter(action)
    router.push(`/admin/violations?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/violations?${params.toString()}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const openModal = (violation: Violation, type: 'view' | 'edit') => {
    setSelectedViolation(violation)
    setModalType(type)
  }

  const closeModal = () => {
    setSelectedViolation(null)
    setModalType(null)
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'content_removal':
        return <XCircle className="w-4 h-4 text-orange-600" />
      case 'temporary_suspension':
        return <Clock className="w-4 h-4 text-red-600" />
      case 'permanent_ban':
        return <XCircle className="w-4 h-4 text-red-800" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'content_removal': return 'bg-orange-100 text-orange-800'
      case 'temporary_suspension': return 'bg-red-100 text-red-800'
      case 'permanent_ban': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">違反履歴の検索・フィルター</h3>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新しい違反を記録
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="違反内容で検索"
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
              value={typeFilter}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全ての違反タイプ</option>
              <option value="spam">スパム</option>
              <option value="inappropriate_content">不適切なコンテンツ</option>
              <option value="harassment">ハラスメント</option>
              <option value="copyright">著作権侵害</option>
              <option value="other">その他</option>
            </select>
            
            <select
              value={actionFilter}
              onChange={(e) => handleActionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全てのアクション</option>
              <option value="warning">警告</option>
              <option value="content_removal">コンテンツ削除</option>
              <option value="temporary_suspension">一時停止</option>
              <option value="permanent_ban">永久BAN</option>
            </select>
          </div>
        </div>
      </div>

      {/* 違反一覧 */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  違反ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  違反タイプ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  違反内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  対応アクション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  処理日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {violations.map((violation) => (
                <tr key={violation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {violation.user.username || '未設定'}
                      </div>
                      <div className="text-sm text-gray-500">{violation.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {getViolationTypeText(violation.violation_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {violation.description}
                    </div>
                    {violation.related_content_type && (
                      <div className="text-xs text-gray-500 mt-1">
                        関連: {violation.related_content_type}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getActionIcon(violation.action_taken)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(violation.action_taken)}`}>
                        {getActionText(violation.action_taken)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatDate(violation.created_at)}</div>
                    {violation.resolved_at && (
                      <div className="text-xs text-green-600">
                        解決: {formatDate(violation.resolved_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(violation, 'view')}
                        className="text-blue-600 hover:text-blue-900"
                        title="詳細表示"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
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

        {violations.length === 0 && (
          <div className="px-6 py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">違反履歴がありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              現在、違反履歴は記録されていません。
            </p>
          </div>
        )}
      </div>

      {/* モーダル */}
      {selectedViolation && modalType && (
        <ViolationActionModal
          violation={selectedViolation}
          type={modalType}
          onClose={closeModal}
          onSuccess={() => {
            closeModal()
            router.refresh()
          }}
        />
      )}

      {showNewModal && (
        <NewViolationModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => {
            setShowNewModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}