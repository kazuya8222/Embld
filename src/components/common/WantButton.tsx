'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleWant } from '@/app/actions/wantPost'
import { cn } from '@/lib/utils/cn'

interface WantButtonProps {
  ideaId: string
  initialWanted: boolean
  initialCount: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function WantButton({ ideaId, initialWanted, initialCount, className, size = 'md' }: WantButtonProps) {
  const [isWanted, setIsWanted] = useState(initialWanted)
  const [count, setCount] = useState(initialCount)
  const [, startTransition] = useTransition()

  const handleClick = () => {
    // 即座にUIを更新（TikTok/Instagram風）
    const newWantedState = !isWanted
    setIsWanted(newWantedState)
    setCount(prev => prev + (newWantedState ? 1 : -1))

    // バックグラウンドでサーバー更新（完全非同期）
    startTransition(() => {
      toggleWant(ideaId).catch(error => {
        // エラー時のみ元に戻す（ユーザーには見えない）
        console.error('Toggle want failed:', error)
        setIsWanted(!newWantedState)
        setCount(prev => prev + (newWantedState ? -1 : 1))
      })
    })
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center rounded-full font-medium transition-all duration-200 transform active:scale-95 hover:scale-105 select-none overflow-hidden",
        sizeClasses[size],
        isWanted
          ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/25'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300',
        className
      )}
    >
      <Heart className={cn(
        iconSizes[size],
        isWanted ? 'fill-current text-white' : 'text-gray-500',
        'transition-all duration-300 ease-out'
      )} />
      <span className="font-semibold transition-all duration-200 relative z-10">
        {count}
      </span>
      
      {/* いいね時のパルスエフェクト */}
      {isWanted && (
        <>
          <div className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-30 pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-red-400 opacity-20 animate-pulse pointer-events-none" />
        </>
      )}
    </button>
  )
}