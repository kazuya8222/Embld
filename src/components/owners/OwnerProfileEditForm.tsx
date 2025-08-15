'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, User, MapPin, Link as LinkIcon, FileText } from 'lucide-react';

interface OwnerProfileEditFormProps {
  userProfile: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    google_avatar_url: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
  };
}

export function OwnerProfileEditForm({ userProfile }: OwnerProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: userProfile.username || '',
    bio: userProfile.bio || '個人開発者として様々なプロジェクトに取り組んでいます。',
    location: userProfile.location || '',
    website: userProfile.website || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/owners/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // 編集完了後にownersのプロフィールページに遷移
        router.push(`/owners/profile/${formData.username || userProfile.id}`);
      } else {
        alert('プロフィールの更新に失敗しました');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('プロフィールの更新中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* プロフィール画像セクション */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {(userProfile.avatar_url || userProfile.google_avatar_url) ? (
                <img
                  src={userProfile.avatar_url || userProfile.google_avatar_url || ''}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                userProfile.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 p-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">プロフィール画像</h3>
            <p className="text-sm text-gray-500">
              現在はGoogleアカウントの画像が使用されています
            </p>
          </div>
        </div>

        {/* ユーザー名 */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            ユーザー名
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="ユーザー名を入力"
          />
        </div>

        {/* 自己紹介 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline w-4 h-4 mr-1" />
            自己紹介
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="あなたについて教えてください"
          />
          <p className="text-sm text-gray-500 mt-1">
            あなたの経験やスキル、興味について簡潔に書いてください
          </p>
        </div>

        {/* 所在地 */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            所在地
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="例：東京、日本"
          />
        </div>

        {/* ウェブサイト */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            <LinkIcon className="inline w-4 h-4 mr-1" />
            ウェブサイト
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '保存中...' : 'プロフィールを更新'}
          </button>
        </div>
      </form>
    </div>
  );
}