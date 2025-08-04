'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Idea } from '@/types'
import { MessageCircle, User, Calendar, Heart, Tag, DollarSign } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { formatRevenue } from '@/data/revenue'

interface IdeaCardProps {
  idea: Idea & {
    wants_count: number
    comments_count: number
    user_has_wanted: boolean
    user: {
      username: string
      avatar_url?: string
    }
  }
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const { user } = useAuth()
  const [isWanted, setIsWanted] = useState(idea.user_has_wanted)
  const [wantsCount, setWantsCount] = useState(idea.wants_count)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleWantToggle = async () => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    setLoading(true)
    try {
      if (isWanted) {
        const { error } = await supabase
          .from('wants')
          .delete()
          .eq('idea_id', idea.id)
          .eq('user_id', user.id)
        
        if (!error) {
          setIsWanted(false)
          setWantsCount(prev => prev - 1)
        }
      } else {
        const { error } = await supabase
          .from('wants')
          .insert({
            idea_id: idea.id,
            user_id: user.id,
          })
        
        if (!error) {
          setIsWanted(true)
          setWantsCount(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Error toggling want:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getCategoryStyle = (category: string) => {
    const styles: { [key: string]: string } = {
      'リモート案件': 'bg-blue-100 text-blue-700',
      '経験少なめOK案件': 'bg-green-100 text-green-700',
      '急募案件': 'bg-red-100 text-red-700',
      '高単価案件': 'bg-yellow-100 text-yellow-700',
    }
    return styles[category] || 'bg-gray-100 text-gray-700'
  }

  const getStatusStyle = (status: string) => {
    const styles: { [key: string]: string } = {
      'open': 'bg-green-100 text-green-700',
      'in_development': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-blue-100 text-blue-700'
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6 space-y-4">
        {/* ヘッダー部分 */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getCategoryStyle(idea.category)}`}>
              {idea.category}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-lg ${getStatusStyle(idea.status)}`}>
              {idea.status === 'open' ? '募集中' :
               idea.status === 'in_development' ? '開発中' : '完成'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(idea.created_at)}</span>
          </div>
        </div>

        {/* タイトルと説明 */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            <Link href={`/ideas/${idea.id}`}>
              {idea.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {idea.problem}
          </p>
        </div>

        {/* タグ */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            {idea.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                他{idea.tags.length - 3}件
              </span>
            )}
          </div>
        )}

        {/* フッター */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* 投稿者情報 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{idea.user.username}</span>
            </div>

            {/* 統計情報 */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <button
                onClick={handleWantToggle}
                disabled={loading}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                  isWanted
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isWanted ? 'fill-current' : ''}`} />
                <span>{wantsCount}</span>
              </button>
              
              <div className="flex items-center gap-1 text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{idea.comments_count}</span>
              </div>

              {idea.revenue && idea.revenue > 0 && (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold">{formatRevenue(idea.revenue)}</span>
                </div>
              )}
            </div>
          </div>

          <Link
            href={`/ideas/${idea.id}`}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  )
}