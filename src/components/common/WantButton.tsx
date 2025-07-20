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
}

export function WantButton({ ideaId, initialWanted, initialCount, className }: WantButtonProps) {
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

  return (
    <button
      onClick={handleWantToggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        isWanted
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Heart className={`w-5 h-5 ${isWanted ? 'fill-current' : ''}`} />
      <span>{isWanted ? 'いいね済み' : 'いいね！'}</span>
      <span className="ml-1 font-bold">{wantsCount}</span>
    </button>
  )
}