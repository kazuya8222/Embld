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
          
          // プロフィール取得にタイムアウトを追加
          const profilePromise = supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve({ data: null }), 3000)
          )
          
          const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any
          setUserProfile(profile)
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
          
          // プロフィール取得にタイムアウトを追加
          try {
            const profilePromise = supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            const timeoutPromise = new Promise((resolve) => 
              setTimeout(() => resolve({ data: null }), 2000)
            )
            
            const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any
            setUserProfile(profile)
          } catch (error) {
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

  const signOut = async () => {
    try {
      // タイムアウト付きでログアウト処理
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('ログアウト処理がタイムアウトしました')), 3000)
      )
      
      try {
        await Promise.race([signOutPromise, timeoutPromise])
      } catch (signOutError) {
        // タイムアウトまたはエラーでもローカル処理で継続
      }
      
      // ローカルストレージのクリア（特定のキーのみ）
      try {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      } catch (storageError) {
        // ストレージクリアエラーは無視
      }
      
      setUser(null)
      setUserProfile(null)
      router.push('/auth/login')
    } catch (error) {
      // エラーが発生しても強制的にローカル状態をクリア
      try {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      } catch (storageError) {
        // 無視
      }
      
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