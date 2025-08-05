'use client'

import { useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

// コンポーネントの外で一度だけクライアントを作成
const supabase = createClient()

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
  
  const handleWantToggle = useCallback(async () => {
    console.log('=== WantButton Click Debug ===')
    console.log('1. Button clicked at:', new Date().toISOString())
    console.log('2. User:', user?.id)
    console.log('3. Idea ID:', ideaId)
    console.log('4. Current state - isWanted:', isWanted)
    console.log('5. Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    if (!user) {
      console.log('6. No user found, redirecting to login')
      window.location.href = '/auth/login'
      return
    }

    if (loading) {
      console.log('6. Already loading, ignoring click')
      return
    }

    setLoading(true)
    console.log('7. Loading state set to true')
    
    // 楽観的アップデート
    const previousWanted = isWanted
    const previousCount = wantsCount
    
    setIsWanted(!isWanted)
    setWantsCount(isWanted ? wantsCount - 1 : wantsCount + 1)
    console.log('8. Optimistic update applied')

    try {
      if (previousWanted) {
        // DELETE操作
        console.log('9. Starting DELETE operation...')
        console.log('10. DELETE request payload:', {
          table: 'wants',
          filters: { idea_id: ideaId, user_id: user.id }
        })
        
        const startTime = Date.now()
        
        const { data, error } = await supabase
          .from('wants')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
          .select()
        
        const endTime = Date.now()
        console.log(`11. DELETE completed in ${endTime - startTime}ms`)
        console.log('12. DELETE response:', { data, error })
        
        if (error) {
          console.error('13. DELETE failed:', error)
          throw error
        }
        
      } else {
        // INSERT操作
        console.log('9. Starting INSERT operation...')
        console.log('10. INSERT request payload:', {
          table: 'wants',
          data: { idea_id: ideaId, user_id: user.id }
        })
        
        const startTime = Date.now()
        
        const { data, error } = await supabase
          .from('wants')
          .insert({
            idea_id: ideaId,
            user_id: user.id,
          })
          .select()
        
        const endTime = Date.now()
        console.log(`11. INSERT completed in ${endTime - startTime}ms`)
        console.log('12. INSERT response:', { data, error })
        
        if (error) {
          console.error('13. INSERT failed:', error)
          throw error
        }
      }
      
      console.log('14. Operation successful')
      
    } catch (error: any) {
      console.error('15. Operation failed with error:', error)
      console.error('16. Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      })
      
      // エラー時は元に戻す
      setIsWanted(previousWanted)
      setWantsCount(previousCount)
      console.log('17. Reverted optimistic update')
      
      alert(`エラーが発生しました: ${error.message}`)
    } finally {
      setLoading(false)
      console.log('18. Loading state set to false')
      console.log('=== End of Debug ===')
    }
  }, [user, loading, ideaId, isWanted, wantsCount])

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
      {loading ? (
        <div className={cn(iconSizes[size], 'animate-spin rounded-full border-2 border-gray-300 border-t-gray-600')} />
      ) : (
        <Heart className={cn(iconSizes[size], isWanted && 'fill-current')} />
      )}
      <span>{isWanted ? 'ほしい済み' : 'ほしい！'}</span>
      <span className="font-semibold bg-white/50 px-2 py-0.5 rounded-full text-xs">
        {wantsCount}
      </span>
    </button>
  )
}