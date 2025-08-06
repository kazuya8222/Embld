import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminAppSubmissionForm } from '@/components/apps/AdminAppSubmissionForm'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default async function AdminAppsPage({
  searchParams
}: {
  searchParams: { ideaId?: string }
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!userProfile?.is_admin) {
    redirect('/')
  }

  // Get all ideas that don't have apps yet
  const { data: ideas } = await supabase
    .from('ideas')
    .select(`
      *,
      user:users(username),
      wants(id),
      comments(id),
      completed_apps(id)
    `)
    .order('created_at', { ascending: false })

  const ideasWithoutApps = ideas?.filter(idea => 
    !idea.completed_apps || idea.completed_apps.length === 0
  ) || []

  const selectedIdeaId = searchParams.ideaId
  const selectedIdea = selectedIdeaId 
    ? ideas?.find(idea => idea.id === selectedIdeaId)
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Link>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-600" />
          <h1 className="text-lg font-semibold text-yellow-900">管理者専用ページ</h1>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          このページは管理者のみがアクセスできます。アプリの投稿と収益分配の設定を行えます。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">アプリを投稿</h2>

        {!selectedIdeaId && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              アプリ化するアイデアを選択
            </h3>
            <div className="space-y-3">
              {ideasWithoutApps.length === 0 ? (
                <p className="text-gray-600">アプリ化できるアイデアがありません。</p>
              ) : (
                ideasWithoutApps.map(idea => (
                  <Link
                    key={idea.id}
                    href={`/admin/apps?ideaId=${idea.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{idea.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          by {idea.user.username} • 
                          {idea.wants?.length || 0} ほしい • 
                          {idea.comments?.length || 0} コメント
                        </p>
                      </div>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                        {idea.category}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {selectedIdea && (
          <div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">{selectedIdea.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                by {selectedIdea.user.username} • 
                カテゴリ: {selectedIdea.category}
              </p>
            </div>

            <AdminAppSubmissionForm ideaId={selectedIdea.id} ideaTitle={selectedIdea.title} />

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">収益分配について</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• アイデア投稿者: 収益の20%</li>
                <li>• 「ほしい！」したユーザー: 人数に応じて分配</li>
                <li>• 有益なコメントをしたユーザー: 貢献度に応じて分配</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                ※ 収益分配の詳細設定は、アプリ投稿後に行えます。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}