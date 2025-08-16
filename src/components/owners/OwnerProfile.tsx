'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { followUser, unfollowUser } from '@/app/actions/ownerFollows';
import { Settings, Plus, MapPin, Link as LinkIcon } from 'lucide-react';
import { FollowListModal } from './FollowListModal';

interface OwnerProfileProps {
  user: any;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
  currentUserId?: string;
}

export function OwnerProfile({
  user,
  postCount,
  followerCount: initialFollowerCount,
  followingCount,
  isFollowing: initialIsFollowing,
  isOwnProfile,
  currentUserId,
}: OwnerProfileProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<'followers' | 'following' | null>(null);

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
    <>
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
                        className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
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
                <button 
                  onClick={() => setModalOpen('followers')}
                  className="text-center hover:opacity-80 transition-opacity"
                >
                  <div className="text-xl font-bold text-gray-900">{followerCount}</div>
                  <div className="text-gray-600 text-sm">フォロワー</div>
                </button>
                <button 
                  onClick={() => setModalOpen('following')}
                  className="text-center hover:opacity-80 transition-opacity"
                >
                  <div className="text-xl font-bold text-gray-900">{followingCount}</div>
                  <div className="text-gray-600 text-sm">フォロー中</div>
                </button>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                {user.one_liner && (
                  <div className="text-purple-600 font-medium italic">
                    💬 {user.one_liner}
                  </div>
                )}
                <div className="text-gray-700">
                  {user.bio || '個人開発者として様々なプロジェクトに取り組んでいます。'}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
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
                  
                  {/* ソーシャルメディアリンク */}
                  {(user.x_account || user.instagram_account || user.tiktok_account || user.youtube_account) && (
                    <div className="flex items-center gap-3">
                      {user.x_account && (
                        <a
                          href={`https://x.com/${user.x_account}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full hover:bg-gray-800 transition-colors"
                        >
                          <span>𝕏</span>
                          <span>@{user.x_account}</span>
                        </a>
                      )}
                      {user.instagram_account && (
                        <a
                          href={`https://instagram.com/${user.instagram_account}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition-colors"
                        >
                          <span>📷</span>
                          <span>@{user.instagram_account}</span>
                        </a>
                      )}
                      {user.tiktok_account && (
                        <a
                          href={`https://tiktok.com/@${user.tiktok_account}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full hover:bg-gray-800 transition-colors"
                        >
                          <span>🎵</span>
                          <span>@{user.tiktok_account}</span>
                        </a>
                      )}
                      {user.youtube_account && (
                        <a
                          href={`https://youtube.com/@${user.youtube_account}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors"
                        >
                          <span>📺</span>
                          <span>@{user.youtube_account}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    {/* フォロワー・フォロー中モーダル */}
    <FollowListModal
      isOpen={modalOpen !== null}
      onClose={() => setModalOpen(null)}
      userId={user.id}
      currentUserId={currentUserId}
      type={modalOpen || 'followers'}
    />
    </>
  );
}