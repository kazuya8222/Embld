'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ClientDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      
      try {
        // 1. getSession を確認
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // 2. getUser を確認
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        // 3. Cookie を確認
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          if (key.startsWith('sb-')) {
            acc[key] = value ? value.substring(0, 50) + '...' : 'empty'
          }
          return acc
        }, {} as Record<string, string>)
        
        // 4. LocalStorage を確認
        const storageKeys = Object.keys(localStorage).filter(key => key.startsWith('sb-'))
        const storage = storageKeys.reduce((acc, key) => {
          const value = localStorage.getItem(key)
          acc[key] = value ? value.substring(0, 50) + '...' : 'empty'
          return acc
        }, {} as Record<string, string>)
        
        setDebugInfo({
          session: {
            exists: !!session,
            user: session?.user?.email,
            error: sessionError?.message
          },
          user: {
            exists: !!user,
            email: user?.email,
            id: user?.id,
            error: userError?.message
          },
          cookies,
          storage,
          env: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        })
      } catch (error: any) {
        setDebugInfo({ error: error.message })
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
    
    // 認証状態の変更を監視
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      checkAuth()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Client-side Auth Debug</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Session (getSession)</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(debugInfo.session, null, 2)}</pre>
        </div>
        
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">User (getUser)</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(debugInfo.user, null, 2)}</pre>
        </div>
        
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Cookies</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(debugInfo.cookies, null, 2)}</pre>
        </div>
        
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">LocalStorage</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(debugInfo.storage, null, 2)}</pre>
        </div>
        
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Environment</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(debugInfo.env, null, 2)}</pre>
        </div>
        
        <div className="mt-4 space-x-4">
          <button
            onClick={async () => {
              const supabase = createClient()
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`
                }
              })
              if (error) alert(error.message)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Google Login
          </button>
          
          <button
            onClick={async () => {
              const supabase = createClient()
              const { error } = await supabase.auth.signOut()
              if (error) alert(error.message)
              else window.location.reload()
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}