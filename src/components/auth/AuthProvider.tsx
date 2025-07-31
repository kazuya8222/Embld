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
        console.log('Checking initial session...')
        
        // 標準クライアントを優先してチェック
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('Standard session found:', session.user.email)
          setUser(session.user)
          
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUserProfile(profile)
        } else {
          console.log('No standard session found')
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()
    
    // 標準クライアントの状態変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUserProfile(profile)
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
    console.log('AuthProvider: signOut 関数が呼ばれました')
    try {
      console.log('AuthProvider: supabase.auth.signOut() を実行中...')
      
      // タイムアウト付きでログアウト処理
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('ログアウト処理がタイムアウトしました')), 5000)
      )
      
      try {
        await Promise.race([signOutPromise, timeoutPromise])
        console.log('AuthProvider: supabase signOut 成功')
      } catch (signOutError) {
        console.log('AuthProvider: supabase signOut タイムアウト/エラー、ローカル処理で継続')
      }
      
      // ローカルストレージのクリア
      try {
        localStorage.clear()
        console.log('AuthProvider: ローカルストレージをクリアしました')
      } catch (storageError) {
        console.log('AuthProvider: ローカルストレージクリアに失敗')
      }
      
      setUser(null)
      setUserProfile(null)
      console.log('AuthProvider: 状態をクリアしました')
      
      console.log('AuthProvider: ログインページにリダイレクト中...')
      router.push('/auth/login')
    } catch (error) {
      console.error('AuthProvider: Signout error:', error)
      
      // エラーが発生しても強制的にローカル状態をクリア
      try {
        localStorage.clear()
      } catch (storageError) {
        console.log('強制ローカルストレージクリアに失敗')
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