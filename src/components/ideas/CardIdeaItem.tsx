'use client'

import Link from 'next/link'
import { MessageCircle, Users, Clock, DollarSign } from 'lucide-react'

interface CardIdeaItemProps {
  idea: {
    id: string
    title: string
    problem: string
    category: string
    status: string
    created_at: string
    revenue?: number
    tags?: string[]
    sketch_urls?: string[]
    user: {
      username: string
      avatar_url?: string
    }
    wants_count: number
    comments_count: number
    user_has_wanted: boolean
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return '数秒前'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}時間前`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}日前`
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months}ヶ月前`
  } else {
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years}年前`
  }
}

export function CardIdeaItem({ idea }: CardIdeaItemProps) {
  return (
    <Link href={`/ideas/${idea.id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* サムネイル画像 */}
        <div className="aspect-[16/9] relative overflow-hidden">
          {idea.sketch_urls && idea.sketch_urls.length > 0 ? (
            <img
              src={idea.sketch_urls[0]}
              alt={idea.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          {/* フォールバック用のプレースホルダー */}
          <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-green-100 absolute inset-0 flex items-center justify-center ${idea.sketch_urls && idea.sketch_urls.length > 0 ? 'hidden' : ''}`}>
            <span className="text-6xl opacity-20">💡</span>
          </div>
          {/* カテゴリバッジ */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
              {idea.category}
            </span>
          </div>
        </div>
        
        {/* コンテンツ */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {idea.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {idea.problem}
          </p>
          
          {/* 投稿者情報 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
              <Users className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">{idea.user.username}</span>
          </div>
          
          {/* 統計情報 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-gray-500">
                <Users className="w-4 h-4" />
                {idea.wants_count}人
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                {idea.comments_count}
              </span>
              {idea.revenue && idea.revenue > 0 && (
                <span className="flex items-center gap-1 text-green-600 font-bold">
                  <DollarSign className="w-4 h-4" />
                  {idea.revenue}円
                </span>
              )}
            </div>
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(idea.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}