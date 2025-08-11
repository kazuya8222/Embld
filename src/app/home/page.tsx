import { createSupabaseServerClient } from '@/lib/supabase/server'
import HomePageClient from '@/components/home/HomePageClient'

interface SearchParams {
  category?: string
  search?: string
}

interface HomePageIdea {
  id: string
  title: string
  problem: string
  category: string
  status: string
  created_at: string
  tags?: string[]
  sketch_urls?: string[]
  revenue?: number
  user: {
    username: string
    avatar_url?: string
  }
  wants_count: number
  comments_count: number
  user_has_wanted: boolean
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // 単一クエリでカウントも同時取得（パフォーマンス向上）
  let query = supabase
    .from('ideas')
    .select(`
      id,
      title,
      problem,
      category,
      status,
      created_at,
      tags,
      sketch_urls,
      revenue,
      user:users(username, avatar_url),
      wants:wants(count),
      comments:comments(count),
      user_wants:wants!wants_user_id_fkey(user_id)
    `)
    .limit(20) // 50→20に削減

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,problem.ilike.%${searchParams.search}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data: ideas, error } = await query

  if (error) {
    console.error('Error fetching ideas:', error)
    return <div>アイデアの取得に失敗しました</div>
  }

  // データ変換を最適化
  const ideasWithCounts = ideas?.map(idea => ({
    ...idea,
    user: Array.isArray(idea.user) ? idea.user[0] : idea.user,
    wants_count: Array.isArray(idea.wants) ? idea.wants.length : 0,
    comments_count: Array.isArray(idea.comments) ? idea.comments.length : 0,
    user_has_wanted: session?.user?.id ? 
      Array.isArray(idea.user_wants) && idea.user_wants.some((want: any) => want.user_id === session.user.id) : false,
  }) as HomePageIdea) || []

  return (
    <HomePageClient 
      ideasWithCounts={ideasWithCounts} 
      searchParams={searchParams}
    />
  )
}
