'use client'

import { useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
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
  const [wantsCount, setWantsCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  
  const handleClick = useCallback(async () => {
    if (loading) return
    
    setLoading(true)
    
    // 楽観的アップデート
    const previousWanted = isWanted
    const previousCount = wantsCount
    
    setIsWanted(!isWanted)
    setWantsCount(isWanted ? wantsCount - 1 : wantsCount + 1)

    try {
      // セッションを取得
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('ログインが必要です')
      }
      
      const userId = session.user.id

      // 既存のwantをチェック
      const { data: existingWant } = await supabase
        .from('wants')
        .select('*')
        .eq('idea_id', ideaId)
        .eq('user_id', userId)
        .maybeSingle()

      if (existingWant) {
        // wantを削除
        const { error } = await supabase
          .from('wants')
          .delete()
          .eq('id', existingWant.id)
        
        if (error) throw error
        setIsWanted(false)
      } else {
        // wantを追加
        const { error } = await supabase
          .from('wants')
          .insert({
            idea_id: ideaId,
            user_id: userId,
          })
        
        if (error) throw error
        setIsWanted(true)
      }
      
    } catch (error: any) {
      console.error('Toggle want failed:', error)
      
      // エラー時は元に戻す
      setIsWanted(previousWanted)
      setWantsCount(previousCount)

    } finally {
      setLoading(false)
    }
  }, [ideaId, isWanted, wantsCount, loading])

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
      onClick={handleClick}
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