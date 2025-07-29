'use client'

import { Idea } from '@/types'
import { Flame, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'

interface HotIdeasProps {
  ideas: (Idea & {
    wants_count: number
    comments_count: number
    user: {
      username: string
    }
  })[]
}

export function HotIdeas({ ideas }: HotIdeasProps) {
  const topIdeas = ideas.slice(0, 3)
  
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
      case 1:
        return <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold">2</div>
      case 2:
        return <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
      default:
        return null
    }
  }
  
  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">🔥 今、最もアツいアイデア</h2>
        <span className="ml-auto text-sm text-gray-600">リアルタイム更新</span>
      </div>
      
      <div className="space-y-3">
        {topIdeas.map((idea, index) => (
          <Link
            key={idea.id}
            href={`/ideas/${idea.id}`}
            className="flex items-center gap-4 bg-white rounded-lg p-4 hover:shadow-md transition-all duration-300 group"
          >
            {getRankIcon(index)}
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                {idea.title}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {idea.wants_count} ほしい
                </span>
                <span>💬 {idea.comments_count}</span>
                <span>by {idea.user.username}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                {idea.wants_count}
              </div>
              <div className="text-xs text-gray-500">ほしい！</div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Link
          href="/?sort=wants"
          className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          もっと見る
          <TrendingUp className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}