'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Eye, Edit, CheckCircle, XCircle, Clock } from 'lucide-react'
import { IdeaStatusBadge } from './IdeaStatusBadge'
import { IdeaActionModal } from './IdeaActionModal'

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

interface IdeasListProps {
  ideas: Idea[]
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export function IdeasList({ ideas, currentPage, totalPages, searchParams }: IdeasListProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.status || '')
  const [approvalFilter, setApprovalFilter] = useState(searchParams.approval || '')
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [modalType, setModalType] = useState<'view' | 'edit' | 'approve' | null>(null)

  const handleSearch = () => {
    const params = new URLSearchParams(urlSearchParams)
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    params.delete('page')
    router.push(`/admin/ideas?${params.toString()}`)
  }

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(urlSearchParams)
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    params.delete('page')
    setStatusFilter(status)
    router.push(`/admin/ideas?${params.toString()}`)
  }

  const handleApprovalFilter = (approval: string) => {
    const params = new URLSearchParams(urlSearchParams)
    if (approval) {
      params.set('approval', approval)
    } else {
      params.delete('approval')
    }
    params.delete('page')
    setApprovalFilter(approval)
    router.push(`/admin/ideas?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams)
    params.set('page', page.toString())
    router.push(`/admin/ideas?${params.toString()}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const openModal = (idea: Idea, type: 'view' | 'edit' | 'approve') => {
    setSelectedIdea(idea)
    setModalType(type)
  }

  const closeModal = () => {
    setSelectedIdea(null)
    setModalType(null)
  }

  const getApprovalIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-orange-600" />
    }
  }

  const getApprovalText = (status: string) => {
    switch (status) {
      case 'approved': return '承認済み'
      case 'rejected': return '却下'
      default: return '承認待ち'
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
                placeholder="アイデアタイトルで検索"
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
              <option value="draft">下書き</option>
              <option value="open">公開中</option>
              <option value="in_development">開発中</option>
              <option value="completed">完了</option>
            </select>
            
            <select
              value={approvalFilter}
              onChange={(e) => handleApprovalFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全ての承認状態</option>
              <option value="pending">承認待ち</option>
              <option value="approved">承認済み</option>
              <option value="rejected">却下</option>
            </select>
          </div>
        </div>
      </div>

      {/* アイデア一覧 */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アイデア情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  承認状態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  統計
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ideas.map((idea) => (
                <tr key={idea.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {idea.title}
                      </div>
                      <div className="text-sm text-gray-500">{idea.category}</div>
                      {idea.tags && idea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {idea.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {idea.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{idea.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {idea.users.username || '未設定'}
                    </div>
                    <div className="text-sm text-gray-500">{idea.users.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <IdeaStatusBadge status={idea.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getApprovalIcon(idea.approval_status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getApprovalText(idea.approval_status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>ほしい: {idea.wants?.[0]?.count || 0}</div>
                      <div>コメント: {idea.comments?.[0]?.count || 0}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(idea.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(idea, 'view')}
                        className="text-blue-600 hover:text-blue-900"
                        title="詳細表示"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(idea, 'edit')}
                        className="text-green-600 hover:text-green-900"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {idea.approval_status === 'pending' && (
                        <button
                          onClick={() => openModal(idea, 'approve')}
                          className="text-orange-600 hover:text-orange-900"
                          title="承認・却下"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
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
      </div>

      {/* モーダル */}
      {selectedIdea && modalType && (
        <IdeaActionModal
          idea={selectedIdea}
          type={modalType}
          onClose={closeModal}
          onSuccess={() => {
            closeModal()
            router.refresh()
          }}
        />
      )}
    </div>
  )
}