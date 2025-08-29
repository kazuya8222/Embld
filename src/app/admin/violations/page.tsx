import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ViolationsList } from '@/components/admin/ViolationsList'
import { Suspense } from 'react'

interface SearchParams {
  search?: string
  type?: string
  action?: string
  page?: string
}

export default async function ViolationsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('user_violations')
    .select(`
      id,
      violation_type,
      description,
      related_content_id,
      related_content_type,
      action_taken,
      admin_notes,
      resolved_at,
      created_at,
      user_id
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // 検索フィルター
  if (searchParams.search) {
    query = query.ilike('description', `%${searchParams.search}%`)
  }

  // 違反タイプフィルター
  if (searchParams.type) {
    query = query.eq('violation_type', searchParams.type)
  }

  // アクションフィルター
  if (searchParams.action) {
    query = query.eq('action_taken', searchParams.action)
  }

  const { data: violations, error } = await query

  if (error) {
    console.error('Error fetching violations:', error)
    return <div>エラーが発生しました: {error.message}</div>
  }

  // 各違反のユーザー情報を個別に取得
  const violationsWithUserData = await Promise.all(
    (violations || []).map(async (violation) => {
      const { data: userData } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('id', violation.user_id)
        .single()
      
      return {
        ...violation,
        user: userData || { id: violation.user_id, username: null, email: 'Unknown' },
        created_by_user: null // created_byフィールドは現在のスキーマに存在しない
      }
    })
  )

  // 総違反数を取得（ページネーション用）
  const { count: totalViolations } = await supabase
    .from('user_violations')
    .select('*', { count: 'exact', head: true })

  const totalPages = Math.ceil((totalViolations || 0) / limit)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">違反管理</h1>
        <p className="text-gray-600 mt-2">ユーザーの違反履歴と対応状況の管理</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ViolationsList 
          violations={violationsWithUserData || []}
          currentPage={page}
          totalPages={totalPages}
          searchParams={{
            search: searchParams.search,
            type: searchParams.type,
            action: searchParams.action
          }}
        />
      </Suspense>
    </div>
  )
}