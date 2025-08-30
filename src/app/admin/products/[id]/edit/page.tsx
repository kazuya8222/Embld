'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Plus, X, Upload, ImagePlus, Video } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  proposal_id: string
  title: string
  overview: string
  description: string
  featured_image: string | null
  video_url: string | null
  web_url: string | null
  app_store_url: string | null
  google_play_url: string | null
  status: string
  is_public: boolean
  tech_stack: string[]
  proposals?: {
    service_name: string
  }
}

export default function EditDevelopedProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    description: '',
    icon_url: '',
    demo_url: '',
    web_url: '',
    app_store_url: '',
    google_play_url: '',
    status: 'development',
    is_public: false,
    tech_stack: [] as string[],
    tags: [] as string[]
  })
  const [newTech, setNewTech] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [dragOver, setDragOver] = useState<'icon' | 'video' | null>(null)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        proposals (
          service_name
        )
      `)
      .eq('id', productId)
      .single()

    if (!error && data) {
      setProduct(data)
      setFormData({
        title: data.title || '',
        overview: data.overview || '',
        description: data.description || '',
        icon_url: data.featured_image || '',
        demo_url: data.video_url || '',
        web_url: data.web_url || '',
        app_store_url: data.app_store_url || '',
        google_play_url: data.google_play_url || '',
        status: data.status || 'development',
        is_public: data.is_public || false,
        tech_stack: data.tech_stack || [],
        tags: [] // tagsフィールドは存在しない
      })
    } else {
      console.error('Error fetching product:', error)
      router.push('/admin/products')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          overview: formData.overview,
          description: formData.description,
          featured_image: formData.icon_url || null,
          video_url: formData.demo_url || null,
          web_url: formData.web_url || null,
          app_store_url: formData.app_store_url || null,
          google_play_url: formData.google_play_url || null,
          status: formData.status,
          is_public: formData.is_public,
          tech_stack: formData.tech_stack,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) {
        console.error('Error updating product:', error)
        alert('プロダクトの更新に失敗しました')
      } else {
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/admin/products/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'ファイルのアップロードに失敗しました')
    }

    const result = await response.json()
    return result.url
  }

  const handleIconUpload = async (file: File) => {
    try {
      setIsUploadingIcon(true)
      const url = await uploadFile(file)
      setFormData(prev => ({ ...prev, icon_url: url }))
      alert('アイコン画像をアップロードしました！')
    } catch (error) {
      console.error('Icon upload error:', error)
      alert('アイコン画像のアップロードに失敗しました。')
    } finally {
      setIsUploadingIcon(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    try {
      setIsUploadingVideo(true)
      const url = await uploadFile(file)
      setFormData(prev => ({ ...prev, demo_url: url }))
      alert('動画をアップロードしました！')
    } catch (error) {
      console.error('Video upload error:', error)
      alert('動画のアップロードに失敗しました。')
    } finally {
      setIsUploadingVideo(false)
    }
  }

  const handleDrop = (e: React.DragEvent, type: 'icon' | 'video') => {
    e.preventDefault()
    setDragOver(null)
    
    const files = e.dataTransfer.files
    if (files.length === 0) return
    
    const file = files[0]
    
    if (type === 'icon') {
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルのみアップロード可能です。')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください。')
        return
      }
      handleIconUpload(file)
    } else if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        alert('動画ファイルのみアップロード可能です。')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('ファイルサイズは50MB以下にしてください。')
        return
      }
      handleVideoUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent, type: 'icon' | 'video') => {
    e.preventDefault()
    setDragOver(type)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(null)
  }

  const addTech = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTech.trim()]
      }))
      setNewTech('')
    }
  }

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">プロダクト編集</h1>
          <p className="text-gray-600 mt-2">
            元企画書: {product.proposals?.service_name}
          </p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロダクト名 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="プロダクト名を入力"
                required
              />
            </div>

            {/* 概要 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                概要 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.overview}
                onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                placeholder="プロダクトの簡単な説明"
                required
              />
            </div>

            {/* 詳細説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                詳細説明（Markdown対応）
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="プロダクトの詳細な説明を入力（Markdown記法が使えます）"
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            {/* アイコン画像 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                アイコン画像
              </label>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver === 'icon'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={(e) => handleDrop(e, 'icon')}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 'icon')}
                  onDragLeave={handleDragLeave}
                >
                  {isUploadingIcon ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">アップロード中...</span>
                    </div>
                  ) : formData.icon_url ? (
                    <div className="space-y-4">
                      <img
                        src={formData.icon_url}
                        alt="アイコンプレビュー"
                        className="mx-auto w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="text-sm text-gray-600">
                        画像をドラッグ&ドロップで変更
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-lg font-medium text-gray-900">
                        アイコン画像をドラッグ&ドロップ
                      </div>
                      <div className="text-sm text-gray-600">
                        PNG, JPG, GIF (最大5MB)
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleIconUpload(file)
                    }}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label htmlFor="icon-upload">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        ファイル選択
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* デモ動画 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                デモ動画
              </label>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver === 'video'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={(e) => handleDrop(e, 'video')}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 'video')}
                  onDragLeave={handleDragLeave}
                >
                  {isUploadingVideo ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">アップロード中...</span>
                    </div>
                  ) : formData.demo_url && formData.demo_url.includes('supabase') ? (
                    <div className="space-y-4">
                      <video
                        src={formData.demo_url}
                        className="mx-auto max-w-full h-32 rounded-lg"
                        controls
                        muted
                      />
                      <div className="text-sm text-gray-600">
                        動画をドラッグ&ドロップで変更
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Video className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-lg font-medium text-gray-900">
                        デモ動画をドラッグ&ドロップ
                      </div>
                      <div className="text-sm text-gray-600">
                        MP4, WebM, MOV (最大50MB)
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleVideoUpload(file)
                    }}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        動画選択
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>リンク情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Web URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Web URL
              </label>
              <Input
                type="url"
                value={formData.web_url}
                onChange={(e) => setFormData(prev => ({ ...prev, web_url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            {/* App Store URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App Store URL
              </label>
              <Input
                type="url"
                value={formData.app_store_url}
                onChange={(e) => setFormData(prev => ({ ...prev, app_store_url: e.target.value }))}
                placeholder="https://apps.apple.com/..."
              />
            </div>

            {/* Google Play URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Play URL
              </label>
              <Input
                type="url"
                value={formData.google_play_url}
                onChange={(e) => setFormData(prev => ({ ...prev, google_play_url: e.target.value }))}
                placeholder="https://play.google.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>技術スタック</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="例: React, TypeScript, Node.js"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTech()
                  }
                }}
              />
              <Button type="button" onClick={addTech} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tech_stack.map(tech => (
                <div key={tech} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>タグ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="例: SaaS, AI, モバイル"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>公開設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              >
                <option value="development">開発中</option>
                <option value="beta">ベータ版</option>
                <option value="released">リリース済み</option>
                <option value="maintenance">メンテナンス中</option>
                <option value="discontinued">終了</option>
              </select>
            </div>

            {/* 公開設定 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_public" className="ml-2 text-sm font-medium text-gray-700">
                ユーザーに公開する
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? '更新中...' : '変更を保存'}
          </Button>
        </div>
      </form>
    </div>
  )
}