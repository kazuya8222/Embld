'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// コンポーネントの外で一度だけクライアントを作成
const supabase = createClient()

interface AuthContextType {
  user: User | null
  userProfile: any | null
  credits: number
  subscriptionPlan: string
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshCredits: () => Promise<void>
  updateProfileOptimistic: (newProfile: Partial<any>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  credits: 0,
  subscriptionPlan: '無料',
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshCredits: async () => {},
  updateProfileOptimistic: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('無料')
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const hasInitialized = useRef(false)
  const isFetchingProfile = useRef(false)
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

  // クレジット残高を取得する関数
  const refreshCredits = async () => {
    console.log('=== RefreshCredits Called ===');
    if (!user) {
      console.log('No user found, setting credits to 0');
      setCredits(0);
      return;
    }
    
    console.log('Fetching credits for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits_balance, subscription_plan')
        .eq('id', user.id)
        .single();
      
      console.log('Credits fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching credits:', error);
        setCredits(0);
      } else {
        const creditBalance = data?.credits_balance || 0;
        console.log('Setting credits to:', creditBalance);
        setCredits(creditBalance);
        
        // subscription_planも更新
        if (data?.subscription_plan) {
          const plan = data.subscription_plan;
          if (plan === 'free') {
            setSubscriptionPlan('無料');
          } else if (plan === 'Embld Basic') {
            setSubscriptionPlan('Embld Basic');
          } else if (plan === 'Embld Plus') {
            setSubscriptionPlan('Embld Plus');
          } else {
            setSubscriptionPlan(plan);
          }
        } else {
          setSubscriptionPlan('無料');
        }
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
      setSubscriptionPlan('無料');
    }
  };

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
        .select('google_avatar_url, email, created_at, is_admin, is_developer, credits_balance')
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
        
        // クレジット情報を直接更新（プロフィールから取得済み）
        const creditBalance = profile.credits_balance || 0;
        console.log('Setting credits from profile refresh:', creditBalance);
        setCredits(creditBalance);
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
      setCredits(0)
      
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

  // ユーザープロフィール取得の共通関数
  const fetchUserProfile = useCallback(async (user: any) => {
    // 既に取得中の場合はスキップ
    if (isFetchingProfile.current) {
      console.log('AuthProvider: Already fetching profile, skipping')
      return
    }

    // 既にプロフィールがある場合はスキップ
    if (userProfile && userProfile.email === user.email) {
      console.log('AuthProvider: Profile already loaded for this user')
      return
    }

    isFetchingProfile.current = true
    
    try {
      console.log('AuthProvider: Fetching profile for user:', user.email)
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('google_avatar_url, email, created_at, is_admin, is_developer, credits_balance')
        .eq('id', user.id)
        .single()
      
      if (error || !profile) {
        console.warn('AuthProvider: Profile fetch failed, using fallback')
        setUserProfile({
          google_avatar_url: null,
          email: user.email,
          created_at: new Date().toISOString(),
          is_admin: false,
          is_developer: false
        })
      } else {
        console.log('AuthProvider: Profile loaded successfully:', profile.email)
        
        // プロフィールをローカルストレージにキャッシュ（24時間）
        if (typeof window !== 'undefined') {
          const cacheData = {
            data: profile,
            expires: Date.now() + (24 * 60 * 60 * 1000)
          }
          localStorage.setItem('embld_user_profile', JSON.stringify(cacheData))
        }
        
        setUserProfile(profile)
        
        // クレジット情報を直接更新（プロフィールから取得済み）
        const creditBalance = profile.credits_balance || 0;
        console.log('Setting credits from fetchUserProfile:', creditBalance);
        setCredits(creditBalance);
      }
    } catch (error) {
      console.error('AuthProvider: Exception during profile fetch:', error)
      setUserProfile({
        username: user.email?.split('@')[0] || 'User',
        avatar_url: null,
        google_avatar_url: null,
        email: user.email
      })
    } finally {
      isFetchingProfile.current = false
    }
  }, [userProfile])

  useEffect(() => {
    // 既に初期化済みの場合はスキップ
    if (hasInitialized.current) {
      return
    }

    // 初期セッション取得
    const getInitialSession = async () => {
      hasInitialized.current = true
      
      try {
        // getSession()を使用（APIコールを削減）
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error)
          setUser(null)
          setUserProfile(null)
        } else if (session?.user) {
          setUser(session.user)
          
          // プロフィールがまだ無い場合のみ取得
          if (!userProfile) {
            await fetchUserProfile(session.user)
          } else {
            // プロフィールがある場合もクレジット情報は更新
            refreshCredits()
          }
        } else {
          setUser(null)
          setUserProfile(null)
          setCredits(0)
        }
      } catch (error) {
        console.error('AuthProvider: Exception during initial session:', error)
        setUser(null)
        setUserProfile(null)
      } finally {
        setLoading(false)
        setHydrated(true)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state change:', event)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserProfile(null)
          setCredits(0)
          isFetchingProfile.current = false
          
          // ローカルストレージもクリア
          if (typeof window !== 'undefined') {
            localStorage.removeItem('supabase.auth.token')
            localStorage.removeItem('embld_user_profile')
            sessionStorage.clear()
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          // SIGNED_INイベントの場合のみプロフィールを取得
          setUser(session.user)
          await fetchUserProfile(session.user)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // トークン更新時はユーザー情報のみ更新（プロフィール取得しない）
          setUser(session.user)
          // クレジット情報は更新
          refreshCredits()
        } else if (event === 'INITIAL_SESSION') {
          // 初期セッションは既に処理済みなのでスキップ
          return
        } else if (!session) {
          setUser(null)
          setUserProfile(null)
          setCredits(0)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, refreshCredits])

  // ユーザーがログイン状態の場合、定期的にクレジットを更新
  useEffect(() => {
    if (user && !loading) {
      console.log('User is authenticated, refreshing credits...');
      refreshCredits();
    }
  }, [user, loading, refreshCredits])

  // Prevent hydration mismatch by not rendering until hydrated
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#e0e0e0]">Loading...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, credits, subscriptionPlan, loading, signOut, refreshProfile, refreshCredits, updateProfileOptimistic }}>
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