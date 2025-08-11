import { createSupabaseServerClient } from '@/lib/supabase/server'
import { WantButton } from '@/components/common/WantButton'
import { CommentSection } from '@/components/common/CommentSection'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, Tag, Lightbulb, MessageCircle } from 'lucide-react'
import { IdeaChatForm } from '@/components/ideas/IdeaChatForm'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'

// メタデータ生成（SEO最適化）
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createSupabaseServerClient()
  const { data: idea } = await supabase
    .from('ideas')
    .select('title, problem')
    .eq('id', params.id)
    .single()

  return {
    title: idea?.title || 'アイデア詳細',
    description: idea?.problem || 'アイデアの詳細を確認'
  }
}

// 静的パラメータ生成（人気アイデアを事前生成）
export async function generateStaticParams() {
  const supabase = createSupabaseServerClient()
  const { data: ideas } = await supabase
    .from('ideas')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(10) // 最新10件を静的生成

  return ideas?.map((idea) => ({
    id: idea.id,
  })) || []
}

// キャッシュ付きアイデア取得
const getCachedIdea = unstable_cache(
  async (ideaId: string) => {
    const supabase = createSupabaseServerClient()
    
    // 全データを並列取得
    const [ideaResult, wantsResult, commentsResult] = await Promise.all([
      supabase
        .from('ideas')
        .select(`
          *,
          user:users(username, avatar_url)
        `)
        .eq('id', ideaId)
        .single(),
      
      supabase
        .from('wants')
        .select('*', { count: 'exact', head: true })
        .eq('idea_id', ideaId),
      
      supabase
        .from('comments')
        .select(`
          *,
          user:users(username, avatar_url)
        `)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
    ])

    if (ideaResult.error || !ideaResult.data) {
      return null
    }

    return {
      idea: ideaResult.data,
      wantsCount: wantsResult.count || 0,
      comments: commentsResult.data || []
    }
  },
  ['idea-detail'],
  { 
    revalidate: 10,
    tags: ['idea']
  }
)

export default async function IdeaDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  
  // セッションとアイデアデータを並列取得
  const [{ data: { session } }, cachedData] = await Promise.all([
    supabase.auth.getSession(),
    getCachedIdea(params.id)
  ])

  if (!cachedData) {
    notFound()
  }

  const { idea, wantsCount, comments } = cachedData

  // ユーザーのwants状態を取得（ログイン時のみ）
  let userHasWanted = false
  if (session?.user?.id) {
    const { data } = await supabase
      .from('wants')
      .select('id')
      .eq('idea_id', params.id)
      .eq('user_id', session.user.id)
      .maybeSingle()
    
    userHasWanted = !!data
  }

  const isOwner = session?.user?.id === idea.user_id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <Link 
          href="/home" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ホームに戻る</span>
        </Link>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1 mr-4">
                {idea.title}
              </h1>
              <div className="flex items-center gap-3">
                <WantButton
                  ideaId={idea.id}
                  initialWanted={userHasWanted}
                  initialCount={wantsCount}
                  size="lg"
                />
                {isOwner && (
                  <Link
                    href={`/ideas/${idea.id}/edit`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    編集
                  </Link>
                )}
              </div>
            </div>
            
            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{idea.user?.username || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(idea.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {idea.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{comments.length} コメント</span>
              </div>
            </div>
          </div>

          {/* スケッチ画像 */}
          {idea.sketch_urls && idea.sketch_urls.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                アイデアスケッチ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {idea.sketch_urls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    alt={`スケッチ ${index + 1}`}
                    className="w-full rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 問題の詳細 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">解決したい問題</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {idea.problem}
            </p>
          </div>

          {/* ソリューション */}
          {idea.solution && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">解決策</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {idea.solution}
              </p>
            </div>
          )}

          {/* ターゲット */}
          {idea.target && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ターゲットユーザー</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {idea.target}
              </p>
            </div>
          )}

          {/* タグ */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">タグ</h2>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI チャット */}
          <div className="mb-8 border-t pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AIと相談する</h2>
            <IdeaChatForm ideaId={idea.id} initialIdea={idea} />
          </div>

          {/* コメントセクション */}
          <div className="border-t pt-8">
            <CommentSection 
              ideaId={idea.id} 
              initialComments={comments}
            />
          </div>
        </div>
      </div>
    </div>
  )
}