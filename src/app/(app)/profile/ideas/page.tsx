import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lightbulb, Heart, MessageCircle, Calendar, Edit2 } from 'lucide-react'

export default async function MyIdeasPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: myIdeas } = await supabase
    .from('ideas')
    .select(`
      *,
      wants(id),
      comments(id),
      user:users(username)
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

  const myIdeasWithStats = myIdeas?.map(idea => ({
    ...idea,
    wants_count: idea.wants?.length || 0,
    comments_count: idea.comments?.length || 0,
  })) || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            マイページに戻る
          </Link>
        </div>
        <Link
          href="/ideas/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          新しいアイデアを投稿
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          投稿したアイデア ({myIdeasWithStats.length}件)
        </h1>

        {myIdeasWithStats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-4">まだアイデアを投稿していません</p>
            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              最初のアイデアを投稿する
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myIdeasWithStats.map((idea) => (
              <div key={idea.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/ideas/${idea.id}`}>
                      <h2 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                        {idea.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mt-1 line-clamp-2">{idea.problem}</p>
                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {idea.wants_count} ほしい！
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {idea.comments_count} コメント
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(idea.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 ml-4">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      idea.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                      idea.status === 'open' ? 'bg-green-100 text-green-700' :
                      idea.status === 'in_development' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {idea.status === 'draft' ? '下書き' :
                       idea.status === 'open' ? '募集中' :
                       idea.status === 'in_development' ? '開発中' : '完成'}
                    </span>
                    <Link
                      href={`/ideas/${idea.id}/edit`}
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}