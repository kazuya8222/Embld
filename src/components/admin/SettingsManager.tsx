'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Save, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

interface Tag {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

interface SystemSetting {
  id: string
  setting_key: string
  setting_value: any
  description: string | null
  updated_at: string
}

interface SettingsManagerProps {
  categories: Category[]
  tags: Tag[]
  systemSettings: SystemSetting[]
}

export function SettingsManager({ categories, tags, systemSettings }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'admins' | 'system'>('categories')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [newItemForm, setNewItemForm] = useState({ name: '', description: '' })
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleAddCategory = async () => {
    if (!newItemForm.name.trim()) return
    setLoading(true)

    try {
      const { error } = await supabase.from('categories').insert({
        name: newItemForm.name,
        description: newItemForm.description || null,
        is_active: true
      })

      if (error) throw error

      setNewItemForm({ name: '', description: '' })
      window.location.reload()
    } catch (error) {
      console.error('Error adding category:', error)
      alert('カテゴリの追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async () => {
    if (!newItemForm.name.trim()) return
    setLoading(true)

    try {
      const { error } = await supabase.from('tags').insert({
        name: newItemForm.name,
        description: newItemForm.description || null,
        is_active: true
      })

      if (error) throw error

      setNewItemForm({ name: '', description: '' })
      window.location.reload()
    } catch (error) {
      console.error('Error adding tag:', error)
      alert('タグの追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (table: 'categories' | 'tags', id: string, currentStatus: boolean) => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      window.location.reload()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('ステータスの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (table: 'categories' | 'tags', id: string) => {
    if (!confirm('本当に削除しますか？')) return
    setLoading(true)

    try {
      const { error } = await supabase.from(table).delete().eq('id', id)

      if (error) throw error

      window.location.reload()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleGrantAdmin = async () => {
    if (!adminEmail.trim()) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('email', adminEmail)

      if (error) throw error

      // 管理者ログに記録
      await supabase.from('admin_logs').insert({
        action: 'grant_admin',
        target_type: 'user',
        details: { email: adminEmail }
      })

      setAdminEmail('')
      alert('管理者権限を付与しました')
    } catch (error) {
      console.error('Error granting admin:', error)
      alert('管理者権限の付与に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const tabs = [
    { id: 'categories', label: 'カテゴリ管理' },
    { id: 'tags', label: 'タグ管理' },
    { id: 'admins', label: '管理者権限' },
    { id: 'system', label: 'システム設定' }
  ]

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* カテゴリ管理 */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">新しいカテゴリを追加</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ名</label>
                <input
                  type="text"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: モバイルアプリ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
                <input
                  type="text"
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="カテゴリの説明"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleAddCategory}
                disabled={loading || !newItemForm.name.trim()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                カテゴリを追加
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">カテゴリ一覧</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリ名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      説明
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {category.description || '説明なし'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.is_active ? '有効' : '無効'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(category.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleActive('categories', category.id, category.is_active)}
                          className={`${
                            category.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {category.is_active ? '無効化' : '有効化'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem('categories', category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* タグ管理 */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">新しいタグを追加</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タグ名</label>
                <input
                  type="text"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: AI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
                <input
                  type="text"
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="タグの説明"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleAddTag}
                disabled={loading || !newItemForm.name.trim()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                タグを追加
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">タグ一覧</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タグ名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      説明
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {tag.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {tag.description || '説明なし'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tag.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tag.is_active ? '有効' : '無効'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(tag.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleActive('tags', tag.id, tag.is_active)}
                          className={`${
                            tag.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {tag.is_active ? '無効化' : '有効化'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem('tags', tag.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 管理者権限 */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">管理者権限を付与</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleGrantAdmin}
                  disabled={loading || !adminEmail.trim()}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  管理者権限を付与
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              ※ 既存ユーザーのメールアドレスを入力してください。該当ユーザーに管理者権限が付与されます。
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>注意:</strong> 管理者権限を持つユーザーは、すべてのユーザー情報とアイデアにアクセスでき、
                  プラットフォーム全体の設定を変更できます。信頼できるユーザーにのみ権限を付与してください。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* システム設定 */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">システム設定</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プラットフォーム名
                </label>
                <input
                  type="text"
                  defaultValue="EmBld"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お問い合わせメール
                </label>
                <input
                  type="email"
                  defaultValue="contact@em-bld.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                利用規約（HTML可）
              </label>
              <textarea
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="EmBldプラットフォームの利用規約..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プライバシーポリシー（HTML可）
              </label>
              <textarea
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="個人情報の取り扱いについて..."
              />
            </div>

            <div className="pt-4">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                設定を保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}