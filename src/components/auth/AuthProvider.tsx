'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      return profile
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return null
    }
  }

  const refreshAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user) {
        setUser(session.user)
        const profile = await fetchUserProfile(session.user.id)
        setUserProfile(profile)
      } else {
        setUser(null)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('Error refreshing auth:', error)
      setUser(null)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    // 初回認証チェック
    const initAuth = async () => {
      try {
        // セッションを取得
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
          
          // 新規ユーザーの場合、プロフィールを作成
          if (event === 'SIGNED_IN' && !profile) {
            const { error } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email!,
                username: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                google_avatar_url: session.user.user_metadata?.avatar_url,
                auth_provider: session.user.app_metadata?.provider || 'email',
              })
            
            if (!error) {
              const newProfile = await fetchUserProfile(session.user.id)
              setUserProfile(newProfile)
            }
          }
        } else {
          setUser(null)
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    // URLパラメータでリフレッシュを検出
    const checkUrlRefresh = () => {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('t')) {
        refreshAuth()
        // パラメータを削除
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
    
    checkUrlRefresh()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshAuth }}>
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