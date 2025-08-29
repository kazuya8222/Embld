'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus,
  ArrowLeft,
  Send,
  ImagePlus
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BlogImage from '@/components/blog/BlogImage';
import MarkdownPreview from '@/components/MarkdownPreview';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  tags: string[];
  status: 'draft' | 'published';
}


export default function NewBlogPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [dragOver, setDragOver] = useState<'featured' | 'content' | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    tags: [],
    status: 'draft'
  });

  // スラッグのバリデーション
  const validateSlug = (slug: string): boolean => {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugPattern.test(slug);
  };

  const handleInputChange = (field: keyof BlogFormData, value: string) => {
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

    const response = await fetch('/api/admin/blogs/upload-image', {
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

  const handleFeaturedImageUpload = async (file: File) => {
    try {
      setIsUploadingFeatured(true);
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, featured_image: url }));
      alert('アイキャッチ画像をアップロードしました！');
    } catch (error) {
      console.error('Featured image upload error:', error);
      alert('アイキャッチ画像のアップロードに失敗しました。');
    } finally {
      setIsUploadingFeatured(false);
    }
  };

  const handleContentImageUpload = async (file: File) => {
    try {
      setIsUploadingContent(true);
      const url = await uploadImage(file);
      const markdownSyntax = `![${file.name}](${url})`;
      
      // カーソル位置に画像のMarkdown記法を挿入
      setFormData(prev => ({ 
        ...prev, 
        content: prev.content + '\n\n' + markdownSyntax + '\n\n'
      }));
      alert('画像をアップロードしてMarkdown記法を挿入しました！');
    } catch (error) {
      console.error('Content image upload error:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setIsUploadingContent(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'featured' | 'content') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルのみアップロード可能です。');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください。');
      return;
    }
    
    if (type === 'featured') {
      handleFeaturedImageUpload(file);
    } else {
      handleContentImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, type: 'featured' | 'content') => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };


  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと本文は必須です。');
      return;
    }

    if (!formData.slug.trim()) {
      alert('スラッグ（URL）は必須です。');
      return;
    }

    if (!validateSlug(formData.slug)) {
      alert('スラッグは英数字とハイフンのみ使用できます。例: my-blog-post');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status,
          excerpt: formData.excerpt || formData.content.substring(0, 200) + '...'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存に失敗しました');
      }

      const result = await response.json();
      if (result.success) {
        alert(status === 'published' ? 'ブログを公開しました！' : '下書きを保存しました。');
        router.push('/admin/blogs');
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('ブログの保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">新規ブログ執筆</h1>
            <p className="text-gray-600 mt-2">新しいブログ記事を作成します</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="text-gray-700 hover:text-gray-900"
          >
            <Save className="w-4 h-4 mr-2" />
            下書き保存
          </Button>
          <Button
            onClick={() => handleSave('published')}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                  placeholder="ブログのタイトルを入力..."
                />
              </div>

              <div>
                <Label htmlFor="slug">スラッグ（URL） *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('slug', e.target.value)}
                  placeholder="my-blog-post"
                />
                <p className="text-sm text-gray-500 mt-1">
                  英数字とハイフンのみ。URL: /blogs/{formData.slug || 'your-slug'}
                </p>
                {formData.slug && !validateSlug(formData.slug) && (
                  <p className="text-sm text-red-500 mt-1">
                    英数字とハイフンのみ使用できます
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="excerpt">概要</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('excerpt', e.target.value)}
                  placeholder="ブログの簡単な説明（自動生成される場合は空白で可）"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* コンテンツエディター */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  本文 *
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
              <div className="h-[500px]">
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
                      value={formData.content}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('content', e.target.value)}
                      placeholder="# 見出し1

## 見出し2

**太字** *斜体* `コード`

- リスト項目1
- リスト項目2

```javascript
const code = 'Hello World';
```

> 引用文

[リンクテキスト](https://example.com)

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
                      <MarkdownPreview content={formData.content} />
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="content-image-input"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
          {/* アイキャッチ画像 */}
          <Card>
            <CardHeader>
              <CardTitle>アイキャッチ画像</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ドラッグ&ドロップエリア */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver === 'featured' 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={(e) => handleDrop(e, 'featured')}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, 'featured')}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {isUploadingFeatured ? 'アップロード中...' : 'ファイルをドラッグ&ドロップまたはクリック'}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="featured-image-input"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) handleFeaturedImageUpload(file);
                    }}
                    disabled={isUploadingFeatured}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('featured-image-input')?.click()}
                    disabled={isUploadingFeatured}
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    ファイルを選択
                  </Button>
                </div>
              </div>
              
              {formData.featured_image && (
                <div className="mt-4">
                  <Label>プレビュー</Label>
                  <BlogImage
                    src={formData.featured_image}
                    alt="アイキャッチ画像プレビュー"
                    className="w-full h-32 rounded-lg mt-2"
                    width={300}
                    height={128}
                  />
                </div>
              )}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                  placeholder="タグを入力..."
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
        </div>
      </div>
    </div>
  );
}