import { createSupabaseServerClient } from '@/lib/supabase/server'
import HomePageClient from '@/components/home/HomePageClient'
import { unstable_cache } from 'next/cache'

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

// キャッシュ付きデータ取得関数
const getCachedIdeas = unstable_cache(
  async (category?: string, search?: string) => {
    const supabase = createSupabaseServerClient()
    
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
        comments:comments(count)
      `)
      .limit(20)

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,problem.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data: ideas, error } = await query

    if (error) throw error
    
    return ideas
  },
  ['ideas-list'],
  { 
    revalidate: 5, // 5秒間キャッシュ
    tags: ['ideas'] 
  }
)

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  
  // セッション取得とアイデア取得を並列実行
  const [{ data: { session } }, ideas] = await Promise.all([
    supabase.auth.getSession(),
    getCachedIdeas(searchParams.category, searchParams.search)
  ])
  
  // ユーザーのwants情報取得（ログイン時のみ）
  let userWants: string[] = []
  if (session?.user?.id && ideas) {
    const ideaIds = ideas.map(idea => idea.id)
    const { data } = await supabase
      .from('wants')
      .select('idea_id')
      .eq('user_id', session.user.id)
      .in('idea_id', ideaIds)
    
    userWants = data?.map(want => want.idea_id) || []
  }

  // データ変換を最適化
  const ideasWithCounts = ideas?.map(idea => ({
    ...idea,
    user: Array.isArray(idea.user) ? idea.user[0] : idea.user,
    wants_count: Array.isArray(idea.wants) ? idea.wants.length : 0,
    comments_count: Array.isArray(idea.comments) ? idea.comments.length : 0,
    user_has_wanted: userWants.includes(idea.id),
  }) as HomePageIdea) || []

  return (
    <HomePageClient 
      ideasWithCounts={ideasWithCounts} 
      searchParams={searchParams}
    />
  )
}
