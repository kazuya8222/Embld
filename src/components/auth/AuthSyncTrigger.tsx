'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthSyncTrigger() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const authParam = searchParams.get('auth')
    
    if (authParam === 'success') {
      console.log('Auth success detected, forcing session sync...')
      
      // URLからパラメータを削除
      const url = new URL(window.location.href)
      url.searchParams.delete('auth')
      window.history.replaceState({}, '', url.toString())
      
      // セッション同期を強制実行
      const forceSync = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            console.log('Forcing session sync for Google login:', session.user.email)
            
            const sessionData = {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
              user: session.user
            }
            
            localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData))
            console.log('Session synced to localStorage')
            
            // ストレージイベントを複数回トリガー
            window.dispatchEvent(new Event('storage'))
            setTimeout(() => window.dispatchEvent(new Event('storage')), 100)
            setTimeout(() => window.dispatchEvent(new Event('storage')), 500)
            
            // ページをリロードして確実に状態を更新
            setTimeout(() => {
              console.log('Reloading page to ensure auth state sync')
              window.location.reload()
            }, 1000)
          }
        } catch (error) {
          console.error('Failed to force session sync:', error)
        }
      }
      
      forceSync()
    }
  }, [searchParams, supabase])

  return null
}