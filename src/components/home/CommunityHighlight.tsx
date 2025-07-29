'use client'

import { useEffect, useState } from 'react'
import { Users, Heart, MessageCircle, Sparkles } from 'lucide-react'

interface CommunityHighlightProps {
  totalUsers: number
  totalComments: number
  totalWants: number
}

export function CommunityHighlight({ totalUsers, totalComments, totalWants }: CommunityHighlightProps) {
  const [currentHighlight, setCurrentHighlight] = useState(0)
  
  const highlights = [
    {
      icon: <Users className="w-5 h-5" />,
      text: `${totalUsers}人のクリエイターが参加中`,
      color: 'from-blue-500 to-purple-500'
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      text: `${totalComments}件の活発な議論`,
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      text: `${totalWants}個の「ほしい！」`,
      color: 'from-pink-500 to-red-500'
    }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHighlight((prev) => (prev + 1) % highlights.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [highlights.length])
  
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-xl font-bold">みんなで作る、次世代のアプリ</h2>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${highlights[currentHighlight].color} bg-opacity-20`}>
              {highlights[currentHighlight].icon}
            </div>
            <p className="text-lg font-medium">
              {highlights[currentHighlight].text}
            </p>
          </div>
          
          <div className="flex gap-1">
            {highlights.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentHighlight ? 'bg-white w-6' : 'bg-white bg-opacity-40'
                }`}
              />
            ))}
          </div>
        </div>
        
        <p className="text-sm mt-3 opacity-90">
          アイデアを投稿して、一緒に未来を創りましょう！
        </p>
      </div>
    </div>
  )
}