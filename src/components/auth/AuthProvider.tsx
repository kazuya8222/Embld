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

  // プロフィール情報を強制再取得する関数
  const refreshProfile = async () => {
    if (!user) {
      console.log('AuthProvider: No user, skipping profile refresh')
      return
    }
    
    console.log('AuthProvider: Force refreshing profile...')
    setUserProfile(null) // 一旦クリアして再取得
    
    // 簡易的なプロフィール再取得（エラー時のフォールバック付き）
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('username, avatar_url, google_avatar_url, email, created_at')
        .eq('id', user.id)
        .single()
      
      if (error || !profile) {
        setUserProfile({
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          google_avatar_url: null,
          email: user.email
        })
      } else {
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('RefreshProfile error:', error)
      setUserProfile({
        username: user.email?.split('@')[0] || 'User',
        avatar_url: null,
        google_avatar_url: null,
        email: user.email
      })
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
    // ユーザープロフィール取得の共通関数（useEffect内に移動）
    const fetchUserProfile = async (user: any, retryCount = 0) => {
      const timeoutMs = 5000 // 5秒タイムアウト
      
      try {
        if (retryCount > 0) {
          console.log(`AuthProvider: Retrying profile fetch for user ${user.id} (attempt ${retryCount + 1})`)
        }
        
        // タイムアウト付きでプロフィール取得
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), timeoutMs)
        )
        
        const fetchPromise = supabase
          .from('users')
          .select('username, avatar_url, google_avatar_url, email, created_at')
          .eq('id', user.id)
          .single()
        
        const result = await Promise.race([fetchPromise, timeoutPromise])
        const { data: profile, error: profileError } = result as any
        
        if (profileError) {
          console.error('AuthProvider: Profile fetch error:', profileError.message || profileError)
          
          // リトライ（最大3回）
          if (retryCount < 2) {
            setTimeout(() => fetchUserProfile(user, retryCount + 1), (retryCount + 1) * 1000)
            return
          }
          
          // 最終的にエラーの場合、emailベースのフォールバック
          console.warn('AuthProvider: Using email fallback due to persistent error')
          setUserProfile({
            username: user.email?.split('@')[0] || 'User',
            avatar_url: null,
            google_avatar_url: null,
            email: user.email
          })
          return
        }
        
        if (!profile) {
          console.warn('AuthProvider: Profile is null, using email fallback')
          setUserProfile({
            username: user.email?.split('@')[0] || 'User',
            avatar_url: null,
            google_avatar_url: null,
            email: user.email
          })
          return
        }
        
        // 初回のみ成功ログを表示
        if (retryCount === 0) {
          console.log('AuthProvider: Profile loaded successfully:', profile.username)
        }
        setUserProfile(profile)
        
      } catch (error) {
        console.error('AuthProvider: Exception during profile fetch:', error)
        
        // 例外が発生した場合もリトライ
        if (retryCount < 2) {
          setTimeout(() => fetchUserProfile(user, retryCount + 1), (retryCount + 1) * 1000)
        } else {
          // 最終的にエラーの場合、emailベースのフォールバック
          console.warn('AuthProvider: Using email fallback due to persistent exception')
          setUserProfile({
            username: user.email?.split('@')[0] || 'User',
            avatar_url: null,
            google_avatar_url: null,
            email: user.email
          })
        }
      }
    }

    // 初期セッションの取得
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('AuthProvider: Error getting user:', error)
          setUser(null)
          setUserProfile(null)
        } else if (user) {
          setUser(user)
          await fetchUserProfile(user)
        } else {
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('AuthProvider: Exception during initial session:', error)
        setUser(null)
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserProfile(null)
          
          // ローカルストレージもクリア
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token')
            sessionStorage.clear()
          }
        } else if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user)
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