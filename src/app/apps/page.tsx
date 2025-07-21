import { createClient } from '@/utils/supabase/server'
import { AppCard } from '@/components/apps/AppCard'
import Link from 'next/link'
import { Smartphone, Plus } from 'lucide-react'

export default async function AppsPage() {
  const supabase = await createClient()

  const { data: apps, error } = await supabase
    .from('completed_apps')
    .select(`
      *,
      idea:ideas(title, category),
      developer:users(username, avatar_url),
      reviews(rating)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching apps:', error)
    return <div>アプリの取得に失敗しました</div>
  }

  const appsWithStats = apps?.map(app => ({
    ...app,
    reviews_count: app.reviews?.length || 0,
    average_rating: app.reviews && app.reviews.length > 0 
      ? app.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / app.reviews.length
      : 0,
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">完成アプリ</h1>
          <p className="text-gray-600 mt-1">アイデアから生まれた素晴らしいアプリたち</p>
        </div>
        <Link
          href="/ideas"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          アイデアを見る
        </Link>
      </div>

      {appsWithStats.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            まだ完成アプリがありません
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            アイデアを投稿して、開発者と一緒に素晴らしいアプリを作り上げましょう！
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ideas/new"
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              アイデアを投稿
            </Link>
            <Link
              href="/ideas"
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              既存のアイデアを見る
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appsWithStats.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}

      {appsWithStats.length > 0 && (
        <div className="bg-primary-50 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            あなたのアイデアもアプリになるかも？
          </h2>
          <p className="text-gray-600 mb-4">
            新しいアイデアを投稿して、開発者コミュニティと一緒に実現させましょう
          </p>
          <Link
            href="/ideas/new"
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            アイデアを投稿
          </Link>
        </div>
      )}
    </div>
  )
}