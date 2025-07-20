'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { CATEGORIES } from '@/types'
import { cn } from '@/lib/utils/cn'
import { X, Upload } from 'lucide-react'

export function IdeaForm() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    solution: '',
    target_users: '',
    category: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5 && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { data, error: insertError } = await supabase
        .from('ideas')
        .insert({
          user_id: user.id,
          title: formData.title,
          problem: formData.problem,
          solution: formData.solution,
          target_users: formData.target_users || null,
          category: formData.category,
          tags: formData.tags,
          sketch_urls: [],
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else {
        router.push(`/ideas/${data.id}`)
      }
    } catch (err) {
      setError('投稿に失敗しました。もう一度お試しください。')
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">アイデアを投稿するにはログインが必要です</p>
        <a
          href="/auth/login"
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          ログイン
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">新しいアイデアを投稿</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="アプリのタイトルを入力してください（50文字以内）"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.title.length}/50
            </div>
          </div>

          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
              解決したい問題 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="problem"
              name="problem"
              value={formData.problem}
              onChange={handleInputChange}
              required
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="どのような問題を解決したいですか？（500文字以内）"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.problem.length}/500
            </div>
          </div>

          <div>
            <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-2">
              解決策・アイデア <span className="text-red-500">*</span>
            </label>
            <textarea
              id="solution"
              name="solution"
              value={formData.solution}
              onChange={handleInputChange}
              required
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="どのような機能やアプローチで解決しますか？（500文字以内）"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.solution.length}/500
            </div>
          </div>

          <div>
            <label htmlFor="target_users" className="block text-sm font-medium text-gray-700 mb-2">
              ターゲットユーザー
            </label>
            <input
              type="text"
              id="target_users"
              name="target_users"
              value={formData.target_users}
              onChange={handleInputChange}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="誰が使うアプリですか？（200文字以内、任意）"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.target_users.length}/200
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">カテゴリを選択してください</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ（最大5個）
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="タグを入力してEnterで追加"
                  disabled={formData.tags.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 5}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  追加
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.problem || !formData.solution || !formData.category}
              className={cn(
                "flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? '投稿中...' : 'アイデアを投稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}