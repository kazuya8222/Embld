'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface WantButtonProps {
  ideaId: string
  initialWanted: boolean
  initialCount: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function WantButton({ ideaId, initialWanted, initialCount, className, size = 'md' }: WantButtonProps) {
  const { user } = useAuth()
  const [isWanted, setIsWanted] = useState(initialWanted)
  const [wantsCount, setWantsCount] = useState(initialCount)
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
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
        
        if (!error) {
          setIsWanted(false)
          setWantsCount(prev => prev - 1)
        }
      } else {
        const { error } = await supabase
          .from('wants')
          .insert({
            idea_id: ideaId,
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

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <button
      onClick={handleWantToggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200",
        sizeClasses[size],
        isWanted
          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-200'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Heart className={cn(iconSizes[size], isWanted && 'fill-current')} />
      <span>{isWanted ? 'ほしい済み' : 'ほしい！'}</span>
      <span className="font-semibold bg-white/50 px-2 py-0.5 rounded-full text-xs">
        {wantsCount}
      </span>
    </button>
  )
}