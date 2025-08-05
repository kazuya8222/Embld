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
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    // 二重クリック防止
    if (loading) {
      console.log('Already processing, ignoring click')
      return
    }

    setLoading(true)
    
    // 楽観的アップデート - UIをすぐに更新
    const previousWanted = isWanted
    const previousCount = wantsCount
    
    setIsWanted(!isWanted)
    setWantsCount(isWanted ? wantsCount - 1 : wantsCount + 1)

    try {
      if (previousWanted) {
        // DELETE操作
        console.log('Deleting want...')
        
        // タイムアウト付きで実行
        const deletePromise = supabase
          .from('wants')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
          .single() // パフォーマンス向上のため
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Delete timeout')), 10000)
        )
        
        const { error } = await Promise.race([deletePromise, timeoutPromise]) as any
        
        if (error) {
          console.error('Delete error:', error)
          // エラー時は元に戻す
          setIsWanted(previousWanted)
          setWantsCount(previousCount)
          
          // タイムアウトエラーの場合
          if (error.message === 'Delete timeout') {
            alert('接続がタイムアウトしました。もう一度お試しください。')
          } else {
            alert('エラーが発生しました。もう一度お試しください。')
          }
        }
      } else {
        // INSERT操作
        console.log('Inserting want...')
        
        // まず重複チェック（競合状態を防ぐ）
        const { data: existing } = await supabase
          .from('wants')
          .select('id')
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (existing) {
          console.log('Want already exists')
          return
        }
        
        // タイムアウト付きで実行
        const insertPromise = supabase
          .from('wants')
          .insert({
            idea_id: ideaId,
            user_id: user.id,
          })
          .select()
          .single()
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Insert timeout')), 10000)
        )
        
        const { error } = await Promise.race([insertPromise, timeoutPromise]) as any
        
        if (error) {
          console.error('Insert error:', error)
          // エラー時は元に戻す
          setIsWanted(previousWanted)
          setWantsCount(previousCount)
          
          // タイムアウトエラーの場合
          if (error.message === 'Insert timeout') {
            alert('接続がタイムアウトしました。もう一度お試しください。')
          } else if (error.code === '23505') { // 重複エラー
            console.log('Duplicate entry, already wanted')
          } else {
            alert('エラーが発生しました。もう一度お試しください。')
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      // エラー時は元に戻す
      setIsWanted(previousWanted)
      setWantsCount(previousCount)
      alert('予期しないエラーが発生しました。')
    } finally {
      setLoading(false)
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
      <Heart className={cn(iconSizes[size], isWanted && 'fill-current')} />
      <span>{isWanted ? 'ほしい済み' : 'ほしい！'}</span>
      <span className="font-semibold bg-white/50 px-2 py-0.5 rounded-full text-xs">
        {wantsCount}
      </span>
    </button>
  )
}