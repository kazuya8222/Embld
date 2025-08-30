'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Calendar, User, Filter, FileText, ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Proposal {
  id: string;
  service_name: string;
  problem_statement: string;
  solution_description: string;
  target_users: string;
  main_features: Array<{
    name: string;
    description: string;
  }>;
  business_model: string;
  recruitment_message: string;
  status: '未提出' | '審査中' | '承認済み' | '却下';
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ProposalsListProps {
  proposals: Proposal[]
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export function ProposalsList({ 
  proposals, 
  currentPage, 
  totalPages, 
  searchParams 
}: ProposalsListProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()
  
  const selectedStatus = searchParams.status || 'all'
  const limit = 20 // ページあたりの表示件数

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page') // ページをリセット
    router.push(`/admin/proposals?${params.toString()}`)
  }

  const changePage = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    router.push(`/admin/proposals?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '審査中':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-200">審査中</Badge>;
      case '承認済み':
        return <Badge className="bg-green-500/20 text-green-600 border-green-200">承認済み</Badge>;
      case '却下':
        return <Badge className="bg-red-500/20 text-red-600 border-red-200">却下</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-200">未提出</Badge>;
    }
  }

  const statusOptions = [
    { value: 'all', label: 'すべて' },
    { value: '未提出', label: '未提出' },
    { value: '審査中', label: '審査中' },
    { value: '承認済み', label: '承認済み' },
    { value: '却下', label: '却下' }
  ]

  const editableStatusOptions = [
    { value: '未提出', label: '未提出' },
    { value: '審査中', label: '審査中' },
    { value: '承認済み', label: '承認済み' },
    { value: '却下', label: '却下' }
  ]

  const updateProposalStatus = async (proposalId: string, newStatus: string) => {
    setUpdatingStatus(proposalId)
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: newStatus,
          reviewed_at: newStatus !== '未提出' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)

      if (error) {
        console.error('Error updating proposal status:', error)
        alert('ステータスの更新に失敗しました')
      } else {
        // ページをリロードして更新されたデータを取得
        window.location.reload()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました')
    } finally {
      setUpdatingStatus(null)
      setEditingStatus(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">ステータス:</span>
          </div>
          <div className="flex gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFilter('status', option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 企画書一覧 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {proposals.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">企画書がありません</h3>
            <p className="text-gray-500">
              {selectedStatus === 'all' ? '企画書が登録されていません' : `${selectedStatus}の企画書はありません`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      企画書
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      投稿者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {proposal.service_name || '無題の企画書'}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {proposal.problem_statement || '課題説明なし'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {proposal.user_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          ユーザーID
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {editingStatus === proposal.id ? (
                            <select
                              value={proposal.status}
                              onChange={(e) => updateProposalStatus(proposal.id, e.target.value)}
                              disabled={updatingStatus === proposal.id}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {editableStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <>
                              {getStatusBadge(proposal.status)}
                              <button
                                onClick={() => setEditingStatus(proposal.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="ステータスを編集"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(proposal.created_at).toLocaleDateString('ja-JP')}
                        {proposal.submitted_at && (
                          <div className="text-xs text-gray-400">
                            提出: {new Date(proposal.submitted_at).toLocaleDateString('ja-JP')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => {
                            setSelectedProposal(proposal)
                            setIsModalOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    variant="outline"
                    size="sm"
                  >
                    前へ
                  </Button>
                  <Button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                    size="sm"
                  >
                    次へ
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{((currentPage - 1) * limit) + 1}</span>
                      から
                      <span className="font-medium">{Math.min(currentPage * limit, proposals.length + ((currentPage - 1) * limit))}</span>
                      まで (全
                      <span className="font-medium">{proposals.length + ((currentPage - 1) * limit)}</span>
                      件中)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        variant="outline"
                        size="sm"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => changePage(pageNum)}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="relative inline-flex items-center px-4 py-2"
                            >
                              {pageNum}
                            </Button>
                          )
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                      
                      <Button
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        variant="outline"
                        size="sm"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 詳細モーダル */}
      {isModalOpen && selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* モーダルヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedProposal.service_name || '無題の企画書'}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  {getStatusBadge(selectedProposal.status)}
                  <span className="text-sm text-gray-500">
                    作成日: {new Date(selectedProposal.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedProposal(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* モーダルコンテンツ */}
            <div className="p-6 space-y-6">
              {/* 問題提起 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">解決したい課題</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedProposal.problem_statement || '記載なし'}
                  </p>
                </div>
              </div>

              {/* ソリューション */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">解決策</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedProposal.solution_description || '記載なし'}
                  </p>
                </div>
              </div>

              {/* ターゲットユーザー */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ターゲットユーザー</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedProposal.target_users || '記載なし'}
                  </p>
                </div>
              </div>

              {/* 主要機能 */}
              {selectedProposal.main_features && selectedProposal.main_features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">主要機能</h3>
                  <div className="space-y-3">
                    {selectedProposal.main_features.map((feature, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">{feature.name}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ビジネスモデル */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ビジネスモデル</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedProposal.business_model || '記載なし'}
                  </p>
                </div>
              </div>

              {/* 募集メッセージ */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">募集メッセージ</h3>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedProposal.recruitment_message || '記載なし'}
                  </p>
                </div>
              </div>

              {/* レビューノート */}
              {selectedProposal.reviewer_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">レビューノート</h3>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedProposal.reviewer_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href={`/proposals/${selectedProposal.id}`} target="_blank">
                  <Button variant="outline">
                    ユーザービューで開く
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedProposal(null)
                  }}
                >
                  閉じる
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}