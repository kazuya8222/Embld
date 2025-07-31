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
      
      // セッション同期を強制実行（リトライ機能付き）
      const forceSync = async (retryCount = 0) => {
        try {
          console.log(`Attempting session sync (attempt ${retryCount + 1})...`)
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            console.log('SUCCESS: Session found for Google login:', session.user.email)
            
            const sessionData = {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
              user: session.user
            }
            
            localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData))
            console.log('Session synced to localStorage:', sessionData.user.email)
            
            // ストレージイベントを複数回トリガー
            window.dispatchEvent(new Event('storage'))
            setTimeout(() => window.dispatchEvent(new Event('storage')), 100)
            setTimeout(() => window.dispatchEvent(new Event('storage')), 500)
            
            // ページをリロードして確実に状態を更新
            setTimeout(() => {
              console.log('Reloading page to ensure auth state sync')
              window.location.reload()
            }, 1000)
          } else {
            console.log(`No session found (attempt ${retryCount + 1}), retrying...`)
            
            // 最大5回リトライ
            if (retryCount < 5) {
              setTimeout(() => forceSync(retryCount + 1), 1000 * (retryCount + 1))
            } else {
              console.error('Failed to get session after 5 attempts, giving up')
            }
          }
        } catch (error) {
          console.error(`Failed to force session sync (attempt ${retryCount + 1}):`, error)
          
          // エラーの場合もリトライ
          if (retryCount < 5) {
            setTimeout(() => forceSync(retryCount + 1), 1000 * (retryCount + 1))
          }
        }
      }
      
      // 初期遅延を追加（Googleログイン処理の完了を待つ）
      setTimeout(() => forceSync(), 500)
    }
  }, [searchParams, supabase])

  return null
}