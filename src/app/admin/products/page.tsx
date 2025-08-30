import { createSupabaseServerClient } from '@/lib/supabase/server'
import { DevelopedProductsList } from '@/components/admin/DevelopedProductsList'
import { Suspense } from 'react'

interface SearchParams {
  status?: string
  page?: string
  [key: string]: string | undefined
}

export default async function AdminDevelopedProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('products')
    .select(`
      *,
      proposals (
        service_name,
        user_id
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // ステータスフィルター
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: products, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return <div>エラーが発生しました</div>
  }

  // 総プロダクト数を取得（ページネーション用）
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const totalPages = Math.ceil((totalProducts || 0) / limit)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">プロダクト管理</h1>
        <p className="text-gray-600 mt-2">承認された企画書から開発されたプロダクトと投稿されたプロダクトを管理します</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DevelopedProductsList 
          products={products || []}
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}