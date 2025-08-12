import { createSupabaseServerClient } from '@/lib/supabase/server'
import { IdeasList } from '@/components/admin/IdeasList'
import { Suspense } from 'react'

interface SearchParams {
  search?: string
  status?: string
  approval?: string
  page?: string
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('ideas')
    .select(`
      id,
      title,
      category,
      tags,
      status,
      approval_status,
      created_at,
      updated_at,
      admin_notes,
      user_id
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // 検索フィルター
  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`)
  }

  // ステータスフィルター
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  // 承認状態フィルター
  if (searchParams.approval) {
    query = query.eq('approval_status', searchParams.approval)
  }

  const { data: ideas, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return <div>エラーが発生しました: {error.message}</div>
  }

  // 各アイデアのユーザー情報、wantsとcommentsのカウントを個別に取得
  const ideasWithCounts = await Promise.all(
    (ideas || []).map(async (idea) => {
      const [
        { data: userData },
        { count: wantsCount },
        { count: commentsCount }
      ] = await Promise.all([
        supabase.from('users').select('id, username, email').eq('id', idea.user_id).single(),
        supabase.from('wants').select('*', { count: 'exact', head: true }).eq('idea_id', idea.id),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('idea_id', idea.id)
      ])
      
      return {
        ...idea,
        users: userData || { id: idea.user_id, username: null, email: 'Unknown' },
        wants: [{ count: wantsCount || 0 }],
        comments: [{ count: commentsCount || 0 }]
      }
    })
  )

  // 総アイデア数を取得（ページネーション用）
  const { count: totalIdeas } = await supabase
    .from('ideas')
    .select('*', { count: 'exact', head: true })

  const totalPages = Math.ceil((totalIdeas || 0) / limit)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">アイデア・企画案管理</h1>
        <p className="text-gray-600 mt-2">投稿されたアイデアの管理・承認</p>
      </div>

      <Suspense fallback={<div>読み込み中...</div>}>
        <IdeasList 
          ideas={ideasWithCounts || []}
          currentPage={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}