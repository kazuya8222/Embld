'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

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
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // プロフィール取得を簡素化
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            setUserProfile(profile)
          } catch (error) {
            console.warn('Failed to fetch user profile:', error)
            setUserProfile(null)
          }
        } else {
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        setUser(null)
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()
    
    // 標準クライアントの状態変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          
          // プロフィール取得を簡素化
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            setUserProfile(profile)
          } catch (error) {
            console.warn('Failed to fetch user profile:', error)
            setUserProfile(null)
          }
        } else {
          setUser(null)
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, mounted])

  const signOut = useCallback(async () => {
    try {
      // ローカル状態を即座にクリア
      setUser(null)
      setUserProfile(null)
      
      // Supabaseからのログアウト（エラーが発生しても続行）
      await supabase.auth.signOut({ scope: 'local' })
      
      // ページ遷移
      router.push('/auth/login')
      
    } catch (error) {
      console.warn('Supabase signOut error:', error)
      // エラーが発生してもログアウト状態にする
      setUser(null)
      setUserProfile(null)
      router.push('/auth/login')
    }
  }, [supabase, router])

  // Contextの値をメモ化してパフォーマンス最適化
  const contextValue = useMemo(() => ({
    user,
    userProfile,
    loading,
    signOut
  }), [user, userProfile, loading, signOut])

  // ハイドレーションエラーを防ぐため、初回レンダリング時はローディング状態を維持
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, userProfile: null, loading: true, signOut }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
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