import { createSupabaseServerClient } from '@/lib/supabase/server'
import { UsersList } from '@/components/admin/UsersList'
import { Suspense } from 'react'

interface SearchParams {
  search?: string
  status?: string
  page?: string
  [key: string]: string | undefined
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('users')
    .select(`
      id,
      email,
      username,
      account_status,
      terms_agreed_at,
      last_login_at,
      created_at,
      is_admin,
      is_developer
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // 検索フィルター
  if (searchParams.search) {
    query = query.or(`email.ilike.%${searchParams.search}%,username.ilike.%${searchParams.search}%`)
  }

  // ステータスフィルター
  if (searchParams.status) {
    query = query.eq('account_status', searchParams.status)
  }

  const { data: users, error } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return <div>エラーが発生しました</div>
  }

  // 総ユーザー数を取得（ページネーション用）
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const totalPages = Math.ceil((totalUsers || 0) / limit)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        <p className="text-gray-600 mt-2">登録ユーザーの管理・権限設定</p>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <UsersList 
          users={users || []}
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}