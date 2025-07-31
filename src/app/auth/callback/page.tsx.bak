'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      // 少し待機してセッションが確立されるのを待つ
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('Session confirmed, redirecting to home...')
        // 強制的にページをリロードして状態を同期
        window.location.href = '/home'
      } else {
        console.log('No session found, redirecting to login...')
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">認証を確認しています...</p>
      </div>
    </div>
  )
}