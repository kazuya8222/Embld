import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Lightbulb, Users, Rocket, Star, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = createServerClient()
  
  const { data: ideas, count: ideasCount } = await supabase
    .from('ideas')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: apps, count: appsCount } = await supabase
    .from('completed_apps')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(3)

  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact' })

  return (
    <div className="space-y-16">
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            アイデアを
            <span className="text-primary-600">アプリ</span>
            に
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            「こんなアプリ欲しい」と「何か作りたい」をつなぐシンプルな掲示板
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/ideas"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors"
          >
            アイデアを見る
          </Link>
          <Link
            href="/ideas/new"
            className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-50 transition-colors"
          >
            アイデアを投稿
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <Lightbulb className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold">アイデア投稿</h3>
          <p className="text-gray-600">
            あなたの「こんなアプリがあったらいいな」を投稿して、開発者と出会おう
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold">コミュニティ</h3>
          <p className="text-gray-600">
            「欲しい！」ボタンで需要を可視化し、コメントでアイデアを磨こう
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Rocket className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold">アプリ実現</h3>
          <p className="text-gray-600">
            開発者がアイデアを実装し、みんなで使える素晴らしいアプリに
          </p>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 text-center">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-primary-600">{ideasCount || 0}</div>
          <div className="text-gray-600">投稿されたアイデア</div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-600">{appsCount || 0}</div>
          <div className="text-gray-600">完成したアプリ</div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-purple-600">{usersCount || 0}</div>
          <div className="text-gray-600">参加ユーザー</div>
        </div>
      </section>

      {ideas && ideas.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">最新のアイデア</h2>
            <Link
              href="/ideas"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              すべて見る
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <div key={idea.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {idea.category}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      idea.status === 'open' ? 'bg-green-100 text-green-700' :
                      idea.status === 'in_development' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {idea.status === 'open' ? '募集中' :
                       idea.status === 'in_development' ? '開発中' : '完成'}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {idea.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {idea.problem}
                  </p>
                  
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {idea.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <Link
                    href={`/ideas/${idea.id}`}
                    className="block w-full text-center bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {apps && apps.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">最新の完成アプリ</h2>
            <Link
              href="/apps"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              すべて見る
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div key={app.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {app.app_name}
                  </h3>
                  
                  {app.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {app.description}
                    </p>
                  )}
                  
                  <Link
                    href={`/apps/${app.id}`}
                    className="block w-full text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    アプリを見る
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-primary-50 rounded-2xl p-8 text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            プレミアムプランで詳細分析
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            「欲しい！」したユーザーの詳細情報や、アイデアの分析データを確認できます
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/premium"
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2 justify-center"
          >
            <Star className="w-5 h-5" />
            プレミアムプランを見る
          </Link>
        </div>
      </section>
    </div>
  )
}