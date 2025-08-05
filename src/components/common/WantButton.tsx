'use client'

import { useState } from 'react'
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
  
  // デバッグ用ログ
  console.log('WantButton render - Environment check:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    user: user?.id
  })

  const handleWantToggle = async () => {
    console.log('handleWantToggle called', { user, ideaId, isWanted })
    
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    setLoading(true)
    try {
      if (isWanted) {
        console.log('Attempting to delete want...')
        const { error } = await supabase
          .from('wants')
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
        
        console.log('Delete result:', { error })
        if (!error) {
          setIsWanted(false)
          setWantsCount(prev => prev - 1)
        } else {
          console.error('Delete error:', error)
        }
      } else {
        console.log('Attempting to insert want...')
        console.log('Supabase instance:', supabase)
        console.log('About to call supabase.from...')
        
        try {
          // 直接データベース操作を実行
          console.log('Starting insert operation...')
          
          // タイムアウトを設定してデバッグ
          const insertPromise = supabase
            .from('wants')
            .insert({
              idea_id: ideaId,
              user_id: user.id,
            })
            .select()
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Insert timeout after 5 seconds')), 5000)
          )
          
          const result = await Promise.race([insertPromise, timeoutPromise])
          
          console.log('Insert completed:', result)
          const { data, error } = result as any
          
          console.log('Insert result:', { data, error })
          if (!error) {
            setIsWanted(true)
            setWantsCount(prev => prev + 1)
          } else {
            console.error('Insert error:', error)
          }
        } catch (insertError) {
          console.error('Insert catch error:', insertError)
        }
      }
    } catch (error) {
      console.error('Error toggling want:', error)
      alert('エラーが発生しました。もう一度お試しください。')
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