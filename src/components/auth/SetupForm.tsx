'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/components/auth/AuthProvider'

// コンポーネントの外で一度だけクライアントを作成
const supabase = createClient()

export function SetupForm() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      // すでにプロフィールが設定されているか確認
      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profile?.username) {
        // すでに設定済みならホームへ
        router.push('/home')
      } else {
        setChecking(false)
      }
    }

    checkUser()
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setMessage('ユーザー情報が見つかりません')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // ユーザー名の重複チェック
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .single()

      if (existingUser) {
        setMessage('このユーザー名はすでに使用されています')
        setLoading(false)
        return
      }

      // ユーザープロフィールを更新
      const { error } = await supabase
        .from('users')
        .update({
          username,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Profile update error:', error)
        setMessage(`エラー: ${error.message}`)
      } else {
        setMessage('プロフィールを設定しました')
        // マイページへリダイレクト
        setTimeout(() => {
          window.location.href = '/profile'
        }, 1000)
      }
    } catch (error: any) {
      console.error('Setup error:', error)
      setMessage('プロフィールの設定に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-gray-600">確認中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">プロフィール設定</h1>
        <p className="text-gray-600 mt-2">
          EMBLDで使用するユーザー名を設定してください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            pattern="[a-zA-Z0-9_-]+"
            minLength={3}
            maxLength={20}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="username"
          />
          <p className="mt-1 text-sm text-gray-500">
            3〜20文字の英数字、ハイフン、アンダースコアが使用できます
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !username}
          className={cn(
            "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors",
            (loading || !username) && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? '設定中...' : 'プロフィールを設定'}
        </button>
      </form>

      {message && (
        <div className={cn(
          "p-3 rounded-md text-sm",
          message.includes('設定しました') 
            ? "bg-green-50 border border-green-200 text-green-600"
            : "bg-red-50 border border-red-200 text-red-600"
        )}>
          {message}
        </div>
      )}
    </div>
  )
}