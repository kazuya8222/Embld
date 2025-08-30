import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProposalsList } from '@/components/admin/ProposalsList'
import { Suspense } from 'react'

interface SearchParams {
  status?: string
  page?: string
  [key: string]: string | undefined
}

export default async function AdminProposalsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('proposals')
    .select(`*`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // ステータスフィルター
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: proposals, error } = await query

  if (error) {
    console.error('Error fetching proposals:', error)
    return <div>エラーが発生しました</div>
  }

  // 総企画書数を取得（ページネーション用）
  const { count: totalProposals } = await supabase
    .from('proposals')
    .select('*', { count: 'exact', head: true })

  const totalPages = Math.ceil((totalProposals || 0) / limit)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">企画書管理</h1>
        <p className="text-gray-600 mt-2">ユーザーが提出した企画書を管理します</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProposalsList 
          proposals={proposals || []}
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}