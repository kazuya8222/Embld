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
    console.log('5. Supabase instance:', supabase)
    console.log('6. Supabase auth client:', supabase.auth)
    console.log('7. Supabase from method:', supabase.from)
    
    if (!user) {
      console.log('8. No user found, redirecting to login')
      window.location.href = '/auth/login'
      return
    }

    if (loading) {
      console.log('8. Already loading, ignoring click')
      return
    }

    setLoading(true)
    console.log('9. Loading state set to true')
    
    // 楽観的アップデート
    const previousWanted = isWanted
    const previousCount = wantsCount
    
    setIsWanted(!isWanted)
    setWantsCount(isWanted ? wantsCount - 1 : wantsCount + 1)
    console.log('10. Optimistic update applied')

    try {
      if (previousWanted) {
        // DELETE操作
        console.log('11. Starting DELETE operation...')
        console.log('12. Creating query builder...')
        
        const deleteQuery = supabase.from('wants')
        console.log('13. Query builder created:', deleteQuery)
        
        const filteredQuery = deleteQuery
          .delete()
          .eq('idea_id', ideaId)
          .eq('user_id', user.id)
        console.log('14. Filtered query created:', filteredQuery)
        
        console.log('15. Executing query...')
        const startTime = Date.now()
        
        // Promise実行の詳細なログ
        const queryPromise = filteredQuery.select()
        console.log('16. Query promise created:', queryPromise)
        
        // タイムアウトを設定
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.log('17. Query timeout triggered')
            reject(new Error('Query timeout after 30 seconds'))
          }, 30000)
        })
        
        console.log('18. Waiting for query response...')
        const result = await Promise.race([queryPromise, timeoutPromise])
        
        const endTime = Date.now()
        console.log(`19. Query completed in ${endTime - startTime}ms`)
        console.log('20. Query result:', result)
        
        const { data, error } = result as any
        
        if (error) {
          console.error('21. DELETE failed:', error)
          throw error
        }
        
        console.log('22. DELETE successful:', data)
        
      } else {
        // INSERT操作
        console.log('11. Starting INSERT operation...')
        console.log('12. Creating insert data...')
        
        const insertData = {
          idea_id: ideaId,
          user_id: user.id,
        }
        console.log('13. Insert data:', insertData)
        
        console.log('14. Creating query...')
        const insertQuery = supabase
          .from('wants')
          .insert(insertData)
          .select()
        
        console.log('15. Executing query...')
        const startTime = Date.now()
        
        const { data, error } = await insertQuery
        
        const endTime = Date.now()
        console.log(`16. Query completed in ${endTime - startTime}ms`)
        console.log('17. INSERT response:', { data, error })
        
        if (error) {
          console.error('18. INSERT failed:', error)
          throw error
        }
        
        console.log('19. INSERT successful:', data)
      }
      
    } catch (error: any) {
      console.error('ERROR. Operation failed:', error)
      console.error('ERROR details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        ...error
      })
      
      // エラー時は元に戻す
      setIsWanted(previousWanted)
      setWantsCount(previousCount)
      console.log('Reverted optimistic update')
      
      alert(`エラーが発生しました: ${error.message}`)
    } finally {
      setLoading(false)
      console.log('Loading state set to false')
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