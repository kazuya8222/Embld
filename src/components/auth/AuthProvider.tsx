'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { directSupabase } from '@/lib/supabase/direct-client'

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const getInitialSession = async () => {
      try {
        console.log('Checking initial session...')
        
        // まず直接クライアントで確認
        const { data: { session: directSession } } = await directSupabase.getSession()
        
        if (directSession?.user) {
          console.log('Direct session found:', directSession.user.email)
          setUser(directSession.user)
          
          // プロフィール取得も直接クライアントで試行
          const { data: profile, error: profileError } = await directSupabase.select('users', '*', { id: directSession.user.id })
          
          if (!profileError && profile && profile.length > 0) {
            setUserProfile(profile[0])
          } else {
            console.log('Falling back to standard client for profile...')
            const { data: fallbackProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', directSession.user.id)
              .single()
            setUserProfile(fallbackProfile)
          }
        } else {
          // フォールバック: 標準クライアント
          console.log('No direct session, checking standard client...')
          const { data: { session } } = await supabase.auth.getSession()
          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('Standard session found, syncing to direct client...')
            
            // 標準クライアントのセッションを直接クライアントに同期
            const sessionData = {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
              user: session.user
            }
            localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData))
            
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            setUserProfile(profile)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // セッション変更の監視（ローカルストレージの変更を監視）
    const handleStorageChange = async () => {
      console.log('Storage change detected, checking direct session...')
      const { data: { session: directSession } } = await directSupabase.getSession()
      
      if (directSession?.user) {
        console.log('Direct session found after storage change:', directSession.user.email)
        setUser(directSession.user)
        const { data: profile } = await directSupabase.select('users', '*', { id: directSession.user.id })
        if (profile && profile.length > 0) {
          setUserProfile(profile[0])
          console.log('Profile updated from direct client:', profile[0].email)
        }
      } else {
        console.log('No direct session after storage change')
        setUser(null)
        setUserProfile(null)
      }
    }

    // ローカルストレージの変更を監視
    window.addEventListener('storage', handleStorageChange)
    
    // 標準クライアントの状態変更も監視（フォールバック用）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state change detected:', { event: _event, hasSession: !!session, email: session?.user?.email })
        
        // 常にセッション同期を試行（直接クライアントがない場合も含む）
        if (session?.user) {
          console.log('Syncing Google login session to direct client...')
          setUser(session.user)
          
          // 標準クライアントのセッションを直接クライアントに同期
          const sessionData = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
            user: session.user
          }
          localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData))
          console.log('Session synced to localStorage')
          
          // ストレージイベントを手動でトリガー
          window.dispatchEvent(new Event('storage'))
          
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUserProfile(profile)
          console.log('User profile loaded:', profile?.email)
        } else {
          console.log('No session, clearing user state')
          setUser(null)
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      subscription.unsubscribe()
    }
  }, [supabase, mounted])

  const signOut = async () => {
    try {
      // 直接クライアントでログアウト
      await directSupabase.signOut()
      
      // 標準クライアントでもログアウト（フォールバック）
      try {
        const signOutPromise = supabase.auth.signOut({ scope: 'local' })
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('標準ログアウトタイムアウト')), 3000)
        )
        
        await Promise.race([signOutPromise, timeoutPromise])
      } catch (standardError) {
        console.log('Standard signout failed, but direct signout succeeded')
      }
      
      // 状態をクリア
      setUser(null)
      setUserProfile(null)
      
      // ログインページにリダイレクト
      router.push('/auth/login')
    } catch (error) {
      console.error('Signout error:', error)
      // エラーが発生した場合でも、クライアント側でセッションをクリアしてリダイレクト
      setUser(null)
      setUserProfile(null)
      router.push('/auth/login')
    }
  }

  // ハイドレーションエラーを防ぐため、初回レンダリング時はローディング状態を維持
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, userProfile: null, loading: true, signOut }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}