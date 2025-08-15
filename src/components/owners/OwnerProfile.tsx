'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { followUser, unfollowUser } from '@/app/actions/ownerFollows';
import { Settings, Grid, Bookmark, Tag, Plus, ExternalLink, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';

interface OwnerProfileProps {
  user: any;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export function OwnerProfile({
  user,
  postCount,
  followerCount: initialFollowerCount,
  followingCount,
  isFollowing: initialIsFollowing,
  isOwnProfile,
}: OwnerProfileProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const handleFollow = async () => {
    setIsLoading(true);
    
    if (isFollowing) {
      const result = await unfollowUser(user.id);
      if (result.success) {
        setIsFollowing(false);
        setFollowerCount(followerCount - 1);
      }
    } else {
      const result = await followUser(user.id);
      if (result.success) {
        setIsFollowing(true);
        setFollowerCount(followerCount + 1);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white">
      {/* Profile Header */}
      <div className="max-w-4xl mx-auto">
        {/* Top Section */}
        <div className="px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl md:text-6xl font-bold overflow-hidden">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">
                  {user.username || 'Anonymous'}
                </h1>
                
                <div className="flex space-x-2">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => router.push('/owners/new')}
                        className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        新規投稿
                      </button>
                      <button
                        onClick={() => router.push('/owners/profile/edit')}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        編集
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleFollow}
                      disabled={isLoading}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isFollowing
                          ? 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? '処理中...' : isFollowing ? 'フォロー中' : 'フォロー'}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-6 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{postCount}</div>
                  <div className="text-gray-600 text-sm">投稿</div>
                </div>
                <button className="text-center hover:opacity-80 transition-opacity">
                  <div className="text-xl font-bold text-gray-900">{followerCount}</div>
                  <div className="text-gray-600 text-sm">フォロワー</div>
                </button>
                <button className="text-center hover:opacity-80 transition-opacity">
                  <div className="text-xl font-bold text-gray-900">{followingCount}</div>
                  <div className="text-gray-600 text-sm">フォロー中</div>
                </button>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="text-gray-700">
                  {user.bio || '個人開発者として様々なプロジェクトに取り組んでいます。'}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}に参加
                  </div>
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <a 
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-purple-600 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t">
          <div className="flex">
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
            <button
              onClick={() => setActiveTab('tagged')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'tagged'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Tag className="w-4 h-4 mr-2" />
              タグ付け
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}