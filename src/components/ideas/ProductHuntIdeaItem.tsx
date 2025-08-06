'use client'
import Link from 'next/link'
import { MessageCircle, DollarSign } from 'lucide-react'
import { WantButton } from '@/components/common/WantButton'
import { formatRevenue } from '@/data/revenue'

interface ProductHuntIdeaItemProps {
  idea: {
    id: string
    title: string
    problem: string
    category: string
    status: string
    created_at: string
    revenue?: number
    tags?: string[]
    user: {
      username: string
      avatar_url?: string
    }
    wants_count: number
    comments_count: number
    user_has_wanted: boolean
  }
}

export function ProductHuntIdeaItem({ idea }: ProductHuntIdeaItemProps) {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}分前`
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else if (diffInHours < 48) {
      return '昨日'
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  return (
    <div className="bg-white rounded-lg border hover:shadow-md transition-shadow">
      <div className="p-4 flex items-start space-x-4">
        {/* 投票ボタン */}
        <div className="flex flex-col items-center">
          <WantButton
            ideaId={idea.id}
            initialWanted={idea.user_has_wanted}
            initialCount={idea.wants_count}
            size="sm"
            className="!flex-col !gap-0"
          />
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                <Link href={`/ideas/${idea.id}`}>
                  {idea.title}
                </Link>
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {idea.problem}
              </p>
              
              {/* メタ情報 */}
              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {idea.comments_count}
                </span>
                <span>{idea.category}</span>
                <span>@{idea.user.username}</span>
                <span>{formatDate(idea.created_at)}</span>
                {idea.revenue && idea.revenue > 0 && (
                  <span className="flex items-center text-green-600 font-bold">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {formatRevenue(idea.revenue)}
                  </span>
                )}
              </div>
            </div>

            {/* タグ */}
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex items-center space-x-2 ml-4">
                {idea.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
