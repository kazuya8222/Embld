'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  Upload,
  X, 
  Plus,
  ArrowLeft,
  Send,
  Video
} from 'lucide-react';
import Link from 'next/link';
import MarkdownPreview from '@/components/MarkdownPreview';

interface ProductFormData {
  title: string;
  overview: string;
  description: string;
  icon_url: string;
  category: string;
  demo_url: string;
  github_url: string;
  video_url: string;
  tags: string[];
  is_public: boolean;
}

const CATEGORIES = [
  'Web開発',
  'モバイルアプリ',
  'AI・機械学習',
  'ゲーム',
  'デザインツール',
  'ライフスタイル',
  'ビジネス',
  'エンターテイメント',
  'その他'
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [dragOver, setDragOver] = useState<'content' | 'video' | 'icon' | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    overview: '',
    description: '',
    icon_url: '',
    category: '',
    demo_url: '',
    github_url: '',
    video_url: '',
    tags: [],
    is_public: true
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const response = await fetch(`/api/admin/products/${productId}`);
        
        if (response.ok) {
          const result = await response.json();
          const product = result.data;
          setFormData({
            title: product.title || '',
            overview: product.overview || '',
            description: product.description || '',
            icon_url: product.icon_url || '',
            category: product.category || '',
            demo_url: product.demo_url || '',
            github_url: product.github_url || '',
            video_url: product.video_url || '',
            tags: product.tags || [],
            is_public: product.is_public !== false
          });
        } else {
          console.error('Failed to fetch product');
          alert('プロダクトの取得に失敗しました。');
          router.push('/admin/products');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        alert('プロダクトの取得に失敗しました。');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/products/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '画像のアップロードに失敗しました');
    }

    const result = await response.json();
    return result.url;
  };

  const handleContentImageUpload = async (file: File) => {
    try {
      setIsUploadingContent(true);
      const url = await uploadImage(file);
      const markdownSyntax = `![${file.name}](${url})`;
      
      // カーソル位置に画像のMarkdown記法を挿入
      setFormData(prev => ({ 
        ...prev, 
        description: prev.description + '\n\n' + markdownSyntax + '\n\n'
      }));
      alert('画像をアップロードしてMarkdown記法を挿入しました！');
    } catch (error) {
      console.error('Content image upload error:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setIsUploadingContent(false);
    }
  };

  const uploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/products/upload-video', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '動画のアップロードに失敗しました');
    }

    const result = await response.json();
    return result.url;
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setIsUploadingVideo(true);
      const url = await uploadVideo(file);
      setFormData(prev => ({ ...prev, video_url: url }));
      alert('動画をアップロードしました！');
    } catch (error) {
      console.error('Video upload error:', error);
      alert('動画のアップロードに失敗しました。');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleIconUpload = async (file: File) => {
    try {
      setIsUploadingIcon(true);
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, icon_url: url }));
      alert('アイコンをアップロードしました！');
    } catch (error) {
      console.error('Icon upload error:', error);
      alert('アイコンのアップロードに失敗しました。');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'content' | 'video' | 'icon') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    
    if (type === 'content') {
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルのみアップロード可能です。');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください。');
        return;
      }
      
      handleContentImageUpload(file);
    } else if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        alert('動画ファイルのみアップロード可能です。');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        alert('ファイルサイズは100MB以下にしてください。');
        return;
      }
      
      handleVideoUpload(file);
    } else if (type === 'icon') {
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルのみアップロード可能です。');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('ファイルサイズは2MB以下にしてください。');
        return;
      }
      
      handleIconUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, type: 'content' | 'video' | 'icon') => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleSave = async (isPublic: boolean) => {
    if (!formData.title.trim() || !formData.overview.trim() || !formData.description.trim() || !formData.category) {
      alert('タイトル、概要、説明、カテゴリは必須です。');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          is_public: isPublic
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存に失敗しました');
      }

      const result = await response.json();
      if (result.success) {
        alert('プロダクトを更新しました！');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('プロダクトの保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">プロダクト編集</h1>
            <p className="text-gray-600 mt-2">プロダクト情報を編集します</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="text-gray-700 hover:text-gray-900"
          >
            <Save className="w-4 h-4 mr-2" />
            非公開で保存
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <Send className="w-4 h-4 mr-2" />
            公開
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="プロダクトのタイトルを入力..."
                />
              </div>

              <div>
                <Label htmlFor="icon_url">アイコン</Label>
                <div className="space-y-4">
                  {/* アイコンプレビュー */}
                  {formData.icon_url && (
                    <div>
                      <Label>アップロード済みアイコン</Label>
                      <div className="w-16 h-16 bg-gray-100 rounded-lg mt-2 overflow-hidden border">
                        <img
                          src={formData.icon_url}
                          alt="アイコン"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, icon_url: '' }))}
                        className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        アイコンを削除
                      </Button>
                    </div>
                  )}

                  {/* ドラッグ&ドロップエリア */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragOver === 'icon'
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={(e) => handleDrop(e, 'icon')}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, 'icon')}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {isUploadingIcon ? 'アップロード中...' : 'アイコンをドラッグ&ドロップ'}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="icon-file-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleIconUpload(file);
                        }}
                        disabled={isUploadingIcon}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('icon-file-input')?.click()}
                        disabled={isUploadingIcon}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        ファイルを選択
                      </Button>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, SVG対応 (最大2MB、推奨サイズ: 64x64px)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="overview">概要 *</Label>
                <Textarea
                  id="overview"
                  value={formData.overview}
                  onChange={(e) => handleInputChange('overview', e.target.value)}
                  placeholder="プロダクトの簡潔な概要を入力（一覧ページに表示されます）..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <Label htmlFor="category">カテゴリ *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="demo_url">デモURL</Label>
                <Input
                  id="demo_url"
                  value={formData.demo_url}
                  onChange={(e) => handleInputChange('demo_url', e.target.value)}
                  placeholder="https://your-demo.com"
                />
              </div>

              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  value={formData.github_url}
                  onChange={(e) => handleInputChange('github_url', e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </CardContent>
          </Card>

          {/* 説明エディター */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  プロダクト説明 *
                </CardTitle>
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'edit' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'preview' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    プレビュー
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {viewMode === 'edit' ? (
                  /* エディターモード */
                  <div 
                    className={`relative border rounded-lg h-full ${
                      dragOver === 'content' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                    }`}
                    onDrop={(e) => handleDrop(e, 'content')}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, 'content')}
                    onDragLeave={handleDragLeave}
                  >
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="# プロダクトの概要

## 機能

- 主要機能1
- 主要機能2
- 主要機能3

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS

## スクリーンショット

![説明](画像URL)

## 使い方

1. ステップ1
2. ステップ2
3. ステップ3

画像を挿入するにはファイルをドラッグ&ドロップしてください。"
                      className="h-full font-mono text-sm resize-none w-full border-0 focus:ring-0 focus:outline-none p-4 rounded-lg bg-white text-gray-900"
                    />
                    {dragOver === 'content' && (
                      <div className="absolute inset-0 bg-blue-50 bg-opacity-75 flex items-center justify-center rounded-lg pointer-events-none">
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                          <p className="text-blue-600 font-medium">画像をドロップして挿入</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* プレビューモード */
                  <div className="border rounded-lg bg-white h-full">
                    <div className="h-full overflow-auto p-4">
                      <MarkdownPreview content={formData.description} />
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="content-image-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleContentImageUpload(file);
                }}
                disabled={isUploadingContent}
              />
              <p className="text-sm text-gray-500 mt-2">
                Markdownフォーマットに対応しています。プレビューボタンでレンダリング結果を確認できます。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 動画設定 */}
          <Card>
            <CardHeader>
              <CardTitle>デモ動画</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 動画プレビュー */}
              {formData.video_url && (
                <div>
                  <Label>アップロード済み動画</Label>
                  <div className="aspect-video bg-gray-100 rounded-lg mt-2 overflow-hidden">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full"
                    >
                      <source src={formData.video_url} type="video/mp4" />
                      <source src={formData.video_url} type="video/webm" />
                      <source src={formData.video_url} type="video/quicktime" />
                      お使いのブラウザは動画再生に対応していません。
                    </video>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                    className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    動画を削除
                  </Button>
                </div>
              )}

              {/* ドラッグ&ドロップエリア */}
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
                <div className="flex flex-col items-center gap-2">
                  <Video className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {isUploadingVideo ? 'アップロード中...' : 'ファイルをドラッグ&ドロップまたはクリック'}
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    id="video-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(file);
                    }}
                    disabled={isUploadingVideo}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('video-file-input')?.click()}
                    disabled={isUploadingVideo}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    ファイルを選択
                  </Button>
                  <p className="text-xs text-gray-500">
                    MP4, WebM, MOV, AVI, WMV, 3GP対応 (最大100MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* タグ */}
          <Card>
            <CardHeader>
              <CardTitle>タグ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="タグを入力..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button onClick={handleAddTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      #{tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 公開設定 */}
          <Card>
            <CardHeader>
              <CardTitle>公開設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_public">一般公開</Label>
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => handleInputChange('is_public', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div>
                <Label htmlFor="publication_status">公開状態</Label>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.is_public ? '公開 - 一般ユーザーに表示されます' : '非公開 - 管理者のみ表示されます'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}