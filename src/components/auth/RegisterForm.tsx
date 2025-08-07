'use client'

import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Googleログイン（クライアントサイド）
  const handleGoogleLogin = async () => {
    setLoading(true)
    setFormError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
      
      // OAuth URLが返される場合はそこにリダイレクト
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      setFormError(error.message || 'Googleログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // メール・パスワード登録（クライアントサイド）
  const handleEmailSignup = async (formData: FormData) => {
    setLoading(true)
    setFormError(null)
    
    try {
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // ユーザープロフィールを作成（usernameはnullで作成）
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            username: null, // usernameは後で設定
            auth_provider: 'email',
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // 登録成功時はログインページにリダイレクト
        router.push('/auth/login?message=' + encodeURIComponent('メールを確認して認証を完了してください'))
      }
    } catch (error: any) {
      console.error('Email signup error:', error)
      setFormError(error.message || '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">新規登録</h1>
        <p className="text-gray-600 mt-2">アカウントを作成してアイデアを投稿しましょう</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? '登録中...' : 'Googleで登録'}
        </button>
        <p className="text-xs text-gray-500 text-center">
          ※ Google認証画面では認証サービス名が表示されますが、EmBldへの登録です
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">または</span>
        </div>
      </div>

      <form action={handleEmailSignup} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="6文字以上のパスワード"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? '登録中...' : '登録'}
        </button>
      </form>

      {(error || formError) && (
        <div className="p-3 border rounded-md text-sm bg-red-50 border-red-200 text-red-600">
          {formError || decodeURIComponent(error!)}
        </div>
      )}

      <div className="text-center text-sm">
        <span className="text-gray-600">すでにアカウントをお持ちの方は </span>
        <a href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
          ログイン
        </a>
      </div>
    </div>
  )
}