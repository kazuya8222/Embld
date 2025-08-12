import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminLogsList } from '@/components/admin/AdminLogsList'
import { Suspense } from 'react'

interface SearchParams {
  action?: string
  target_type?: string
  page?: string
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('admin_logs')
    .select(`
      id,
      action,
      target_type,
      target_id,
      details,
      created_at,
      admin_user_id
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // アクションフィルター
  if (searchParams.action) {
    query = query.eq('action', searchParams.action)
  }

  // ターゲットタイプフィルター
  if (searchParams.target_type) {
    query = query.eq('target_type', searchParams.target_type)
  }

  const { data: logs, error } = await query

  if (error) {
    console.error('Error fetching logs:', error)
    return <div>エラーが発生しました: {error.message}</div>
  }

  // 各ログの管理者情報を個別に取得
  const logsWithAdminData = await Promise.all(
    (logs || []).map(async (log) => {
      const { data: adminData } = await supabase
        .from('users')
        .select('id, username, email')
        .eq('id', log.admin_user_id)
        .single()
      
      return {
        ...log,
        admin_user: adminData || { id: log.admin_user_id, username: null, email: 'Unknown' }
      }
    })
  )

  // 総ログ数を取得（ページネーション用）
  const { count: totalLogs } = await supabase
    .from('admin_logs')
    .select('*', { count: 'exact', head: true })

  const totalPages = Math.ceil((totalLogs || 0) / limit)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">管理者操作ログ</h1>
        <p className="text-gray-600 mt-2">管理者の操作履歴とシステムアクティビティ</p>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <AdminLogsList 
          logs={logsWithAdminData || []}
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}