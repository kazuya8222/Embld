'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Idea } from '@/types'
import { MessageCircle, User, Calendar } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

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

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 text-sm rounded-full font-medium">
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
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
            {idea.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-3">
            {idea.problem}
          </p>
        </div>

        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{idea.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{idea.user.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(idea.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleWantToggle}
              disabled={loading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                isWanted
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-teal-100 hover:to-cyan-100 hover:text-teal-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{isWanted ? '❤️ ほしい！' : '🤍 ほしい！'}</span>
              <span className="bg-white bg-opacity-30 px-1.5 py-0.5 rounded-full text-xs font-bold">{wantsCount}</span>
            </button>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>{idea.comments_count}</span>
            </div>
          </div>

          <Link
            href={`/ideas/${idea.id}`}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-md text-sm hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  )
}