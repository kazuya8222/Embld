'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/components/auth/AuthProvider'
import { User } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { updateProfile, uploadAvatar } from '@/app/actions/profile'

interface UserProfile {
  username: string
  avatar_url: string | null
  google_avatar_url: string | null
  email: string
}

interface ProfileSettingsFormProps {
  user: SupabaseUser
  initialProfile: UserProfile | null
}

export function ProfileSettingsForm({ user, initialProfile }: ProfileSettingsFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [username, setUsername] = useState(initialProfile?.username || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile?.avatar_url || null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isNewUser, setIsNewUser] = useState(!initialProfile?.username)
  const router = useRouter()
  const { refreshProfile } = useAuth()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('username', username)
      if (avatarUrl) {
        formData.append('avatar_url', avatarUrl)
      }

      const result = await updateProfile(formData)
      
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage(result.success || 'プロフィールを更新しました')
        // プロフィール情報を再読み込み
        setProfile({
          ...profile!,
          username,
          avatar_url: avatarUrl || null
        })
        // AuthProviderのプロフィール情報も更新
        await refreshProfile()
        
        // 新規ユーザーの場合はホームへリダイレクト
        if (isNewUser) {
          setTimeout(() => {
            router.push('/home')
          }, 1000)
        }
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
    if (!file) return

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('ファイルサイズは5MB以下にしてください')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadAvatar(formData)
      
      if (result.error) {
        setMessage(result.error)
      } else {
        setAvatarUrl(result.avatarUrl || '')
        setMessage(result.success || '画像をアップロードしました')
        // AuthProviderのプロフィール情報も更新
        await refreshProfile()
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setMessage('画像のアップロードに失敗しました')
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className="max-w-2xl mx-auto">
      {isNewUser && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ようこそEMBLDへ！</h3>
          <p className="text-blue-700 text-sm">
            まずはユーザー名を設定してプロフィールを完成させましょう。
            ユーザー名は他のユーザーに表示される名前です。
          </p>
        </div>
      )}
      
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
                  {avatarUrl || profile?.google_avatar_url ? (
                    <img
                      src={avatarUrl || profile?.google_avatar_url || ''}
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
                pattern="[a-zA-Z0-9_\-]+"
                minLength={3}
                maxLength={20}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="username"
              />
              <p className="mt-1 text-sm text-gray-500">
                3〜20文字の英数字、ハイフン、アンダースコアが使用できます
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