import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, User, Calendar } from 'lucide-react'

export default async function MyWantsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: myWants } = await supabase
    .from('wants')
    .select(`
      *,
      idea:ideas(
        id,
        title,
        problem,
        category,
        status,
        created_at,
        user:users(username, avatar_url, google_avatar_url),
        wants(id),
        comments(id)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const wantsWithStats = myWants?.map(want => ({
    ...want,
    idea: {
      ...want.idea,
      wants_count: want.idea.wants?.length || 0,
      comments_count: want.idea.comments?.length || 0,
    }
  })) || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          マイページに戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-red-600" />
          「ほしい！」したアイデア ({wantsWithStats.length}件)
        </h1>

        {wantsWithStats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-4">まだ「ほしい！」したアイデアはありません</p>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              アイデアを探す
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wantsWithStats.map((want) => (
              <div key={want.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/ideas/${want.idea.id}`}>
                      <h2 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                        {want.idea.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mt-1 line-clamp-2">{want.idea.problem}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          {want.idea.user.google_avatar_url || want.idea.user.avatar_url ? (
                            <img
                              src={want.idea.user.google_avatar_url || want.idea.user.avatar_url}
                              alt={want.idea.user.username}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <User className="w-3 h-3 text-gray-600" />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{want.idea.user.username}</span>
                      </div>
                      
                      <span className="text-sm text-gray-600">{want.idea.category}</span>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {want.idea.wants_count}
                        </span>
                        <span>{want.idea.comments_count} コメント</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>「ほしい！」した日: {formatDate(want.created_at)}</span>
                    </div>
                  </div>
                  
                  <span className={`ml-4 px-3 py-1 text-sm rounded-full ${
                    want.idea.status === 'open' ? 'bg-green-100 text-green-700' :
                    want.idea.status === 'in_development' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {want.idea.status === 'open' ? '募集中' :
                     want.idea.status === 'in_development' ? '開発中' : '完成'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}