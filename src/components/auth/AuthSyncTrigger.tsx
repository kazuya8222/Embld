'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function AuthSyncTrigger() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const authParam = searchParams.get('auth')
    
    if (authParam === 'success') {
      console.log('Auth success detected, triggering page reload...')
      
      // URLからパラメータを削除
      const url = new URL(window.location.href)
      url.searchParams.delete('auth')
      window.history.replaceState({}, '', url.toString())
      
      // ページをリロードしてAuthProviderに認証状態を再確認させる
      // Supabaseのセッション管理は自動的に行われるため、追加のAPI呼び出しは不要
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }, [searchParams])

  return null
}