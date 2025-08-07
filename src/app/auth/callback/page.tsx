'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    console.log('Auth callback mounted...')

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)

      if (event === 'SIGNED_IN') {
        let currentSession = session
        if (!currentSession) {
          console.log('Session is null, fetching manually...')
          const { data } = await supabase.auth.getSession()
          currentSession = data.session
        }

        if (currentSession) {
          console.log('Session ready, redirecting...')
          router.push('/home')
        } else {
          console.warn('No session after SIGNED_IN, redirecting to login')
          router.push('/auth/login?error=no-session')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>ログイン処理中...</p>
      </div>
    </div>
  )
}

