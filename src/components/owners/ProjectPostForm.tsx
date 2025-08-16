'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOwnerPost } from '@/app/actions/ownerPosts';
import { Image, Link, Code, X, Upload, Play, Globe, Camera } from 'lucide-react';

interface ProjectPostFormProps {
  userId: string;
}

export function ProjectPostForm({ userId }: ProjectPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    product_url: '',
    github_url: '',
    demo_url: '',
    demo_video_url: '',
    tech_stack: [] as string[],
    tags: [] as string[],
    images: [] as string[],
    category: 'その他',
    pricing_model: 'free' as 'free' | 'paid' | 'freemium' | 'subscription',
    platform: [] as string[],
    is_public: true,
  });
  
  const [techInput, setTechInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [platformInput, setPlatformInput] = useState('');
  const [autoFillUrl, setAutoFillUrl] = useState('');

  const categories = [
    'ビジネス', 'ライフスタイル', 'エンタメ', '写真/ビデオ', 'ソーシャルネットワーキング',
    'ユーティリティ', '仕事効率化', 'メディカル', 'ファイナンス', '教育',
    'フード/ドリンク', 'ゲーム', 'ヘルスケア/フィットネス', 'ニュース', 'ナビゲーション',
    'ショッピング', 'スポーツ', 'トラベル', 'ミュージック', 'グラフィック/デザイン',
    '開発ツール', 'その他'
  ];

  const handleAutoFill = async () => {
    if (!autoFillUrl.trim()) return;
    
    setIsAutoFilling(true);
    try {
      // ここでWebサイトの情報を取得するAPIを呼び出す
      const response = await fetch('/api/owners/auto-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: autoFillUrl.trim() })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          description: data.description || prev.description,
          category: data.category || prev.category,
          tech_stack: data.tech_stack || prev.tech_stack,
          platform: data.platform || prev.platform,
          images: data.images || prev.images,
        }));
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createOwnerPost({
        ...formData,
        user_id: userId,
        project_url: formData.product_url || undefined,
      });

      if (result.success && result.data) {
        router.push(`/owners/${result.data.id}`);
      } else {
        alert('投稿の作成に失敗しました');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        tech_stack: [...formData.tech_stack, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const handleRemoveTech = (index: number) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter((_, i) => i !== index),
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleAddPlatform = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && platformInput.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        platform: [...formData.platform, platformInput.trim()],
      });
      setPlatformInput('');
    }
  };

  const handleRemovePlatform = (index: number) => {
    setFormData({
      ...formData,
      platform: formData.platform.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* 自動入力セクション */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-purple-600" />
            クイック入力
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            ウェブサイトのURLを入力すると、自動でプロダクト情報を取得・入力します
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={autoFillUrl}
              onChange={(e) => setAutoFillUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://your-product.com"
            />
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isAutoFilling || !autoFillUrl.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAutoFilling ? '取得中...' : '自動入力'}
            </button>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">基本情報</h3>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              プロダクト名 *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="あなたのプロダクトの名前を入力"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              概要 *
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="プロダクトの簡潔な説明を入力"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              詳細説明
            </label>
            <textarea
              id="content"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="プロダクトの詳細な説明を入力"
            />
          </div>
        </div>

        {/* URL情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">URL情報</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="project_url" className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="inline w-4 h-4 mr-1" />
                プロダクトURL
              </label>
              <input
                type="url"
                id="product_url"
                value={formData.product_url}
                onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="demo_url" className="block text-sm font-medium text-gray-700 mb-2">
                デモURL
              </label>
              <input
                type="url"
                id="demo_url"
                value={formData.demo_url}
                onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://demo.example.com"
              />
            </div>

            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label htmlFor="demo_video_url" className="block text-sm font-medium text-gray-700 mb-2">
                <Play className="inline w-4 h-4 mr-1" />
                デモ動画URL
              </label>
              <input
                type="url"
                id="demo_video_url"
                value={formData.demo_video_url}
                onChange={(e) => setFormData({ ...formData, demo_video_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="YouTube, Vimeo, 直接MP4リンクなど"
              />
              <p className="text-xs text-gray-500 mt-1">
                推奨形式：MP4, WebM / プラットフォーム：YouTube, Vimeo
              </p>
            </div>
          </div>
        </div>

        {/* プロジェクト詳細 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">プロダクト詳細</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pricing_model" className="block text-sm font-medium text-gray-700 mb-2">
                料金モデル
              </label>
              <select
                id="pricing_model"
                value={formData.pricing_model}
                onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="free">無料</option>
                <option value="paid">有料</option>
                <option value="freemium">フリーミアム</option>
                <option value="subscription">サブスクリプション</option>
              </select>
            </div>

            <div>
              <label htmlFor="is_public" className="block text-sm font-medium text-gray-700 mb-2">
                公開設定
              </label>
              <select
                id="is_public"
                value={formData.is_public.toString()}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="true">公開</option>
                <option value="false">非公開</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対応プラットフォーム
            </label>
            <input
              type="text"
              value={platformInput}
              onChange={(e) => setPlatformInput(e.target.value)}
              onKeyDown={handleAddPlatform}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="プラットフォームを入力してEnterキーで追加（例：Web, iOS, Android）"
            />
            {formData.platform.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.platform.map((platform, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {platform}
                    <button
                      type="button"
                      onClick={() => handleRemovePlatform(index)}
                      className="ml-2 hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Code className="inline w-4 h-4 mr-1" />
              技術スタック
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleAddTech}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="使用技術を入力してEnterキーで追加（例：React, Next.js, TypeScript）"
            />
            {formData.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tech_stack.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(index)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="タグを入力してEnterキーで追加（例：Web開発, モバイルアプリ, AI）"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="ml-2 hover:text-gray-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}