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
    
    // 後で定義されるfetchUserProfile関数を使用
    await fetchUserProfileInternal(user, 0)
  }

  // 内部用のプロフィール取得関数
  const fetchUserProfileInternal = async (user: any, retryCount = 0) => {
    try {
      console.log(`AuthProvider: Fetching profile for user ${user.id} (attempt ${retryCount + 1})`)
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('username, avatar_url, google_avatar_url, email, created_at')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error('AuthProvider: Profile fetch error:', profileError)
        
        // リトライ（最大3回）
        if (retryCount < 2) {
          console.log(`AuthProvider: Retrying profile fetch in ${(retryCount + 1) * 1000}ms...`)
          setTimeout(() => fetchUserProfileInternal(user, retryCount + 1), (retryCount + 1) * 1000)
          return
        }
        
        // 最終的にエラーの場合、emailベースのフォールバック
        console.warn('AuthProvider: Using email fallback for profile')
        setUserProfile({
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          google_avatar_url: null,
          email: user.email
        })
        return
      }
      
      console.log('AuthProvider: Profile successfully fetched:', profile)
      setUserProfile(profile)
      
    } catch (error) {
      console.error('AuthProvider: Exception during profile fetch:', error)
      
      // 例外が発生した場合もリトライ
      if (retryCount < 2) {
        setTimeout(() => fetchUserProfileInternal(user, retryCount + 1), (retryCount + 1) * 1000)
      } else {
        // 最終的にエラーの場合、emailベースのフォールバック
        setUserProfile({
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          google_avatar_url: null,
          email: user.email
        })
      }
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
    // 初期セッションの取得（ロバストなエラーハンドリング付き）
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...')
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('AuthProvider: Error getting user:', error)
          setUser(null)
          setUserProfile(null)
        } else if (user) {
          console.log('AuthProvider: User found:', {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          })
          
          setUser(user)
          
          // プロフィール取得（リトライ機能付き）
          await fetchUserProfileInternal(user)
        } else {
          console.log('AuthProvider: No user found')
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

    // 認証状態の変更を監視（ロバストなハンドリング付き）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('AuthProvider: Auth state changed:', event, {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id
        })
        
        if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out')
          // ログアウト時は即座に状態をクリア
          setUser(null)
          setUserProfile(null)
          
          // ローカルストレージもクリア
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token')
            sessionStorage.clear()
          }
        } else if (session?.user) {
          console.log('AuthProvider: User signed in:', {
            id: session.user.id,
            email: session.user.email
          })
          
          setUser(session.user)
          
          // 共通のプロフィール取得関数を使用
          await fetchUserProfileInternal(session.user)
        } else {
          console.log('AuthProvider: No session or user')
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