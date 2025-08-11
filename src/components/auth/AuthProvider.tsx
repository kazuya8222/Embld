'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// コンポーネントの外で一度だけクライアントを作成
const supabase = createClient()

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // プロフィール情報を再取得する関数（必要な場合のみ実行）
  const refreshProfile = async () => {
    if (!user || userProfile) return // 既にプロフィールがある場合はスキップ
    
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('username, avatar_url, google_avatar_url') // 必要な項目のみ
        .eq('id', user.id)
        .single()
      
      setUserProfile(profile)
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  // ログアウト処理
  const signOut = async () => {
    try {
      console.log('Starting logout process...')
      
      // 状態を即座にクリア
      setUser(null)
      setUserProfile(null)
      
      // ローカルストレージもクリア
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
        
        // Supabase関連のすべてのキーを削除
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes('supabase')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        console.log('Local storage cleared')
      }
      
      // サーバーアクションを使用してログアウト
      const { signout } = await import('@/app/auth/actions')
      await signout()
      
    } catch (error) {
      console.error('Error during signout:', error)
      // エラーが発生しても状態をクリアしてリダイレクト
      setUser(null)
      setUserProfile(null)
      router.push('/auth/login')
    }
  }

  useEffect(() => {
    // 初期セッションの取得（getUser()を使用）
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          setUser(null)
          setUserProfile(null)
        } else if (user) {
          setUser(user)
          
          // ユーザープロフィールを取得（必要な項目のみ）
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('username, avatar_url, google_avatar_url')
            .eq('id', user.id)
            .single()
          
          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else {
            console.log('Profile loaded:', profile)
          }
          
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state changed:', event)
        
        if (event === 'SIGNED_OUT') {
          // ログアウト時は即座に状態をクリア
          setUser(null)
          setUserProfile(null)
          
          // ローカルストレージもクリア
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token')
            sessionStorage.clear()
          }
        } else if (session?.user) {
          setUser(session.user)
          
          // ユーザープロフィールを取得（必要な項目のみ）
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('username, avatar_url, google_avatar_url')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.error('Error fetching profile in auth state change:', profileError)
          } else {
            console.log('Profile loaded in auth state change:', profile)
          }
          
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
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshProfile }}>
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