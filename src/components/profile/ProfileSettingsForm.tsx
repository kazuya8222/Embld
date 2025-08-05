'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/components/auth/AuthProvider'
import { User } from 'lucide-react'

const supabase = createClient()

interface UserProfile {
  username: string
  avatar_url: string | null
  email: string
}

export function ProfileSettingsForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/auth/login')
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username, avatar_url, email')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error loading profile:', error)
          setMessage('プロフィールの読み込みに失敗しました')
        } else if (data) {
          setProfile(data)
          setUsername(data.username || '')
          setAvatarUrl(data.avatar_url || '')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setMessage('予期しないエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setMessage('ユーザー情報が見つかりません')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      // ユーザー名が変更された場合は重複チェック
      if (username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single()

        if (existingUser) {
          setMessage('このユーザー名はすでに使用されています')
          setSaving(false)
          return
        }
      }

      // プロフィールを更新
      const { error } = await supabase
        .from('users')
        .update({
          username,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Profile update error:', error)
        setMessage(`エラー: ${error.message}`)
      } else {
        setMessage('プロフィールを更新しました')
        // プロフィール情報を再読み込み
        setProfile({
          ...profile!,
          username,
          avatar_url: avatarUrl || null
        })
      }
    } catch (error: any) {
      console.error('Update error:', error)
      setMessage('プロフィールの更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('ファイルサイズは5MB以下にしてください')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      // ファイル名を生成
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      setMessage('画像をアップロードしました')
    } catch (error: any) {
      console.error('Upload error:', error)
      setMessage('画像のアップロードに失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-center">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">プロフィール設定</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロフィール画像
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    JPG、PNG、GIF形式（最大5MB）
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              />
            </div>

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

            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">
                アバター画像URL（任意）
              </label>
              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                外部の画像URLを直接指定することもできます
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving || !username}
                className={cn(
                  "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors",
                  (saving || !username) && "opacity-50 cursor-not-allowed"
                )}
              >
                {saving ? '保存中...' : 'プロフィールを更新'}
              </button>
            </div>
          </form>

          {message && (
            <div className={cn(
              "mt-4 p-3 rounded-md text-sm",
              message.includes('更新しました') || message.includes('アップロードしました')
                ? "bg-green-50 border border-green-200 text-green-600"
                : "bg-red-50 border border-red-200 text-red-600"
            )}>
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">危険な操作</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">アカウントの削除</h3>
              <p className="text-sm text-gray-600 mb-3">
                アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={() => alert('この機能は現在開発中です')}
              >
                アカウントを削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}