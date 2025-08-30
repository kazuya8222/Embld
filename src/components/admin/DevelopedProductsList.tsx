'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Filter, Package, ChevronLeft, ChevronRight, Plus, Edit2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  proposal_id: string
  title: string
  description: string
  overview: string
  status: 'development' | 'testing' | 'launched' | 'discontinued'
  launch_date: string | null
  website_url: string | null
  pricing_model: string | null
  base_price: number | null
  is_public: boolean
  created_at: string
  updated_at: string
  proposals: {
    service_name: string
    user_id: string
  }
}

interface DevelopedProductsListProps {
  products: Product[]
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export function DevelopedProductsList({ 
  products, 
  currentPage, 
  totalPages, 
  searchParams 
}: DevelopedProductsListProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const supabase = createClient()
  
  const selectedStatus = searchParams.status || 'all'
  const limit = 20

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`/admin/products?${params.toString()}`)
  }

  const changePage = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    router.push(`/admin/products?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'development':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-200">開発中</Badge>
      case 'testing':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-200">テスト中</Badge>
      case 'launched':
        return <Badge className="bg-green-500/20 text-green-600 border-green-200">リリース済み</Badge>
      case 'discontinued':
        return <Badge className="bg-red-500/20 text-red-600 border-red-200">サービス終了</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-200">{status}</Badge>
    }
  }

  const statusOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'development', label: '開発中' },
    { value: 'testing', label: 'テスト中' },
    { value: 'launched', label: 'リリース済み' },
    { value: 'discontinued', label: 'サービス終了' }
  ]

  const editableStatusOptions = [
    { value: 'development', label: '開発中' },
    { value: 'testing', label: 'テスト中' },
    { value: 'launched', label: 'リリース済み' },
    { value: 'discontinued', label: 'サービス終了' }
  ]

  const updateProductStatus = async (productId: string, newStatus: string) => {
    setUpdatingStatus(productId)
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) {
        console.error('Error updating product status:', error)
        alert('ステータスの更新に失敗しました')
      } else {
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

  const togglePublicStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_public: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) {
        console.error('Error updating public status:', error)
        alert('公開ステータスの更新に失敗しました')
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました')
    }
  }

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
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
          <Link href="/admin/products/new">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              新規プロダクト作成
            </Button>
          </Link>
        </div>
      </div>

      {/* プロダクト一覧 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">プロダクトがありません</h3>
            <p className="text-gray-500">
              {selectedStatus === 'all' ? 'プロダクトが登録されていません' : `${statusOptions.find(o => o.value === selectedStatus)?.label}のプロダクトはありません`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      プロダクト
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      元企画書
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公開状態
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
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {product.overview}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.proposals?.service_name || '企画書なし'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {product.proposal_id ? product.proposal_id.slice(0, 8) + '...' : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {editingStatus === product.id ? (
                            <select
                              value={product.status}
                              onChange={(e) => updateProductStatus(product.id, e.target.value)}
                              disabled={updatingStatus === product.id}
                              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {editableStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <>
                              {getStatusBadge(product.status)}
                              <button
                                onClick={() => setEditingStatus(product.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="ステータスを編集"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublicStatus(product.id, product.is_public)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            product.is_public
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {product.is_public ? '公開中' : '非公開'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('ja-JP')}
                        {product.launch_date && (
                          <div className="text-xs text-gray-400">
                            リリース: {new Date(product.launch_date).toLocaleDateString('ja-JP')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <button className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100">
                            編集
                          </button>
                        </Link>
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
                      <span className="font-medium">{Math.min(currentPage * limit, products.length + ((currentPage - 1) * limit))}</span>
                      まで (全
                      <span className="font-medium">{products.length + ((currentPage - 1) * limit)}</span>
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

    </div>
  )
}