'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Save, 
  X, 
  Plus,
  Upload,
  ImagePlus
} from 'lucide-react';
import BlogImage from '@/components/blog/BlogImage';
import MarkdownPreview from '@/components/MarkdownPreview';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

interface EditBlogModalProps {
  blog: Blog;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blog: Blog) => void;
}

export default function EditBlogModal({ blog, isOpen, onClose, onSave }: EditBlogModalProps) {
  const [formData, setFormData] = useState<Blog>(blog);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [dragOver, setDragOver] = useState<'featured' | 'content' | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setFormData(blog);
  }, [blog]);

  const handleInputChange = (field: keyof Blog, value: string) => {
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
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch('/api/admin/blogs/upload-image', {
      method: 'POST',
      body: uploadFormData,
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
      
      setFormData(prev => ({ 
        ...prev, 
        content: prev.content + '\n\n' + markdownSyntax + '\n\n'
      }));
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

  const validateSlug = (slug: string): boolean => {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugPattern.test(slug);
  };

  const handleSave = async () => {
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          excerpt: formData.excerpt || formData.content.substring(0, 200) + '...'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '保存に失敗しました');
      }

      const result = await response.json();
      if (result.success) {
        alert('ブログを更新しました！');
        onSave(formData);
        onClose();
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('ブログの保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">ブログを編集</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="text-gray-700 hover:text-gray-900"
            >
              <X className="w-4 h-4 mr-2" />
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* メインコンテンツ */}
            <div className="lg:col-span-3 space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700">タイトル *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="ブログのタイトルを入力..."
                    className="text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-gray-700">スラッグ（URL） *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="my-blog-post"
                    className="text-gray-900 bg-white"
                  />
                  {formData.slug && !validateSlug(formData.slug) && (
                    <p className="text-sm text-red-500 mt-1">
                      英数字とハイフンのみ使用できます
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt" className="text-gray-700">概要</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="ブログの簡単な説明（自動生成される場合は空白で可）"
                  rows={2}
                  className="text-gray-900 bg-white"
                />
              </div>

              {/* コンテンツエディター */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-gray-700">本文 *</Label>
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
                        onChange={(e) => handleInputChange('content', e.target.value)}
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
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* アイキャッチ画像 */}
              <div>
                <Label className="block mb-4 text-gray-700">アイキャッチ画像</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
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
                      {isUploadingFeatured ? 'アップロード中...' : 'ファイルをドラッグ&ドロップ'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="featured-image-input-modal"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFeaturedImageUpload(file);
                      }}
                      disabled={isUploadingFeatured}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('featured-image-input-modal')?.click()}
                      disabled={isUploadingFeatured}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      <ImagePlus className="w-4 h-4 mr-2" />
                      ファイルを選択
                    </Button>
                  </div>
                </div>
                
                {formData.featured_image && (
                  <div className="mt-4">
                    <Label className="text-gray-700">プレビュー</Label>
                    <BlogImage
                      src={formData.featured_image}
                      alt="アイキャッチ画像プレビュー"
                      className="w-full h-32 rounded-lg mt-2"
                      width={300}
                      height={128}
                    />
                  </div>
                )}
              </div>

              {/* タグ */}
              <div>
                <Label className="block mb-4 text-gray-700">タグ</Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="タグを入力..."
                    className="text-gray-900 bg-white"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}