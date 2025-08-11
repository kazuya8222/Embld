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
  updateProfileOptimistic: (newProfile: Partial<any>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfileOptimistic: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 即座にローカルストレージからプロフィールを復元（最速表示）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedProfile = localStorage.getItem('embld_user_profile')
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile)
          // 24時間以内のキャッシュなら使用
          if (profile.expires && Date.now() < profile.expires) {
            setUserProfile(profile.data)
          }
        }
      } catch (error) {
        console.error('Failed to load cached profile:', error)
      }
    }
  }, [])

  // プロフィール情報を強制再取得する関数（高速化）
  const refreshProfile = async () => {
    if (!user) {
      console.log('AuthProvider: No user, skipping profile refresh')
      return
    }
    
    console.log('AuthProvider: Force refreshing profile...')
    
    // 簡易的なプロフィール再取得（エラー時のフォールバック付き）
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('username, avatar_url, google_avatar_url, email, created_at')
        .eq('id', user.id)
        .single()
      
      if (error || !profile) {
        const fallbackProfile = {
          username: user.email?.split('@')[0] || 'User',
          avatar_url: null,
          google_avatar_url: null,
          email: user.email
        }
        setUserProfile(fallbackProfile)
      } else {
        console.log('AuthProvider: Profile refreshed:', profile)
        
        // プロフィールをローカルストレージにもキャッシュ
        if (typeof window !== 'undefined') {
          const cacheData = {
            data: profile,
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24時間後
          }
          localStorage.setItem('embld_user_profile', JSON.stringify(cacheData))
        }
        
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('RefreshProfile error:', error)
      const fallbackProfile = {
        username: user.email?.split('@')[0] || 'User',
        avatar_url: null,
        google_avatar_url: null,
        email: user.email
      }
      setUserProfile(fallbackProfile)
    }
  }

  // プロフィールの即座更新（楽観的更新）
  const updateProfileOptimistic = (newProfile: Partial<any>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...newProfile }
      setUserProfile(updatedProfile)
      
      // ローカルストレージも即座に更新
      if (typeof window !== 'undefined') {
        const cacheData = {
          data: updatedProfile,
          expires: Date.now() + (24 * 60 * 60 * 1000)
        }
        localStorage.setItem('embld_user_profile', JSON.stringify(cacheData))
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
    // ユーザープロフィール取得の共通関数（高速化版）
    const fetchUserProfile = async (user: any, retryCount = 0) => {
      const timeoutMs = 3000 // 3秒タイムアウト（高速化）
      
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
        
        // プロフィールをローカルストレージにキャッシュ（24時間）
        if (typeof window !== 'undefined') {
          const cacheData = {
            data: profile,
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24時間後
          }
          localStorage.setItem('embld_user_profile', JSON.stringify(cacheData))
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
          const fallbackProfile = {
            username: user.email?.split('@')[0] || 'User',
            avatar_url: null,
            google_avatar_url: null,
            email: user.email
          }
          
          // フォールバックもキャッシュ（1時間）
          if (typeof window !== 'undefined') {
            const cacheData = {
              data: fallbackProfile,
              expires: Date.now() + (60 * 60 * 1000) // 1時間後
            }
            localStorage.setItem('embld_user_profile', JSON.stringify(cacheData))
          }
          
          setUserProfile(fallbackProfile)
        }
      }
    }

    // 初期セッション取得の高速化
    const getInitialSession = async () => {
      try {
        // ローディング状態をできるだけ早く解除
        setTimeout(() => setLoading(false), 100)
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('AuthProvider: Error getting user:', error)
          setUser(null)
          setUserProfile(null)
        } else if (user) {
          setUser(user)
          
          // キャッシュされたプロフィールが既にあるかチェック
          if (!userProfile) {
            await fetchUserProfile(user)
          }
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
          
          // ローカルストレージもクリア（プロフィールキャッシュも含む）
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token')
            localStorage.removeItem('embld_user_profile')
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
  }, [userProfile])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshProfile, updateProfileOptimistic }}>
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