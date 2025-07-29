'use client'

import { useEffect, useState } from 'react'
import { Trophy, Star, Zap } from 'lucide-react'
import Link from 'next/link'

interface Contributor {
  id: string
  username: string
  avatar_url?: string
  ideas_count: number
  total_wants: number
}

interface ContributorSpotlightProps {
  contributors: Contributor[]
}

export function ContributorSpotlight({ contributors }: ContributorSpotlightProps) {
  const [featuredIndex, setFeaturedIndex] = useState(0)
  
  useEffect(() => {
    if (contributors.length <= 1) return
    
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % contributors.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [contributors.length])
  
  if (contributors.length === 0) return null
  
  const featured = contributors[featuredIndex]
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">🌟 みんなで創る、アイデアの輪</h2>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {featured.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{featured.username}</h3>
              <p className="text-sm text-gray-600">アイデアクリエイター</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{featured.ideas_count}</span>
              <span className="text-gray-500">アイデア</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{featured.total_wants}</span>
              <span className="text-gray-500">獲得</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t">
          <p className="text-sm text-gray-600">
            あなたもアイデアを投稿して、次世代のアプリを一緒に創りましょう！
          </p>
          <Link
            href="/ideas/new"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            参加する →
          </Link>
        </div>
      </div>
      
      <div className="flex justify-center gap-1 mt-4">
        {contributors.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === featuredIndex ? 'bg-purple-600 w-4' : 'bg-purple-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}