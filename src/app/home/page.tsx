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

// 超高速アイデア取得（CAMPFIRE風最適化）
const getCachedIdeas = unstable_cache(
  async (category?: string, search?: string, userId?: string) => {
    const supabase = createSupabaseServerClient()
    
    // 1. 基本アイデア情報のみ取得（JOINなし）
    let ideaQuery = supabase
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
        user_id
      `)
      .limit(20)

    if (category) {
      ideaQuery = ideaQuery.eq('category', category)
    }

    if (search) {
      ideaQuery = ideaQuery.or(`title.ilike.%${search}%,problem.ilike.%${search}%`)
    }

    ideaQuery = ideaQuery.order('created_at', { ascending: false })

    // 2. 並列でデータ取得（高速化）
    const [
      { data: ideas, error: ideasError },
      { data: users, error: usersError },
      { data: wantsCounts, error: wantsError },
      { data: commentsCounts, error: commentsError },
      { data: userWants, error: userWantsError }
    ] = await Promise.all([
      ideaQuery,
      
      // ユーザー情報を一括取得
      supabase
        .from('users')
        .select('id, username, avatar_url'),
      
      // wants数を高速取得（最新20件のアイデアのみ）
      supabase
        .from('wants')
        .select('idea_id')
        .limit(1000) // 制限を設けて高速化
        .then(({ data }) => {
          const counts = new Map()
          data?.forEach(want => {
            counts.set(want.idea_id, (counts.get(want.idea_id) || 0) + 1)
          })
          return { data: counts, error: null }
        }),
      
      // comments数を高速取得（最新20件のアイデアのみ）
      supabase
        .from('comments')
        .select('idea_id')
        .limit(1000) // 制限を設けて高速化
        .then(({ data }) => {
          const counts = new Map()
          data?.forEach(comment => {
            counts.set(comment.idea_id, (counts.get(comment.idea_id) || 0) + 1)
          })
          return { data: counts, error: null }
        }),
      
      // ユーザーのwants（ログイン時のみ）
      userId ? supabase
        .from('wants')
        .select('idea_id')
        .eq('user_id', userId)
        .then(({ data }) => ({ data: new Set(data?.map(w => w.idea_id)), error: null }))
        : Promise.resolve({ data: new Set(), error: null })
    ])

    if (ideasError) throw ideasError

    // 3. メモリ内で高速結合（JOINなし）
    const userMap = new Map(users?.map(u => [u.id, u]) || [])
    
    return ideas?.map(idea => ({
      ...idea,
      user: userMap.get(idea.user_id) || { username: 'Unknown', avatar_url: undefined },
      wants_count: wantsCounts?.get(idea.id) || 0,
      comments_count: commentsCounts?.get(idea.id) || 0,
      user_has_wanted: userWants?.has(idea.id) || false,
    })) || []
  },
  ['ideas-optimized'],
  { 
    revalidate: 10, // 10秒キャッシュで負荷分散
    tags: ['ideas'] 
  }
)

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createSupabaseServerClient()
  
  // セッション取得（高速化）
  const { data: { session } } = await supabase.auth.getSession()
  
  // 最適化されたアイデア取得（ユーザーIDを含む）
  const ideas = await getCachedIdeas(
    searchParams.category, 
    searchParams.search,
    session?.user?.id
  )

  return (
    <HomePageClient 
      ideasWithCounts={ideas} 
      searchParams={searchParams}
    />
  )
}
