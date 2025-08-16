'use client';

import { useState } from 'react';
import { Grid, Bookmark } from 'lucide-react';
import { InstagramPostGrid } from './InstagramPostGrid';

interface ProfileContentProps {
  posts: any[];
  savedPosts: any[];
  isOwnProfile: boolean;
}

export function ProfileContent({ posts, savedPosts, isOwnProfile }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState('posts');

  const renderContent = () => {
    switch (activeTab) {
      case 'saved':
        if (!isOwnProfile) return null;
        return (
          <div className="bg-white">
            {savedPosts.length > 0 ? (
              <InstagramPostGrid posts={savedPosts} />
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🔖</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">保存済みの投稿がありません</h3>
                <p className="text-gray-500">気に入った投稿を保存してみましょう</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="bg-white">
            <InstagramPostGrid posts={posts} />
          </div>
        );
    }
  };

  return (
    <>
      {/* Tab navigation */}
      <div className="bg-white">
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center py-3 text-sm font-medium border-t-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-4 h-4 mr-2" />
            投稿
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              保存済み
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      {renderContent()}
    </>
  );
}