'use client';

import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import Link from 'next/link';
import { getFollowers, getFollowing, checkFollowStatus, followUser, unfollowUser } from '@/app/actions/ownerFollows';

interface UserItem {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  followed_at: string;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentUserId?: string;
  type: 'followers' | 'following';
  initialCount?: number;
}

export function FollowListModal({ 
  isOpen, 
  onClose, 
  userId, 
  currentUserId,
  type, 
  initialCount = 0 
}: FollowListModalProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [followingLoading, setFollowingLoading] = useState<Record<string, boolean>>({});

  // ユーザーリストを取得
  const fetchUsers = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const result = type === 'followers' 
        ? await getFollowers(userId)
        : await getFollowing(userId);
      
      if (result.success && result.data) {
        setUsers(result.data);
        
        // 現在のユーザーがログインしている場合、フォロー状態を確認
        if (currentUserId) {
          const followStatesMap: Record<string, boolean> = {};
          for (const user of result.data) {
            if (user.id !== currentUserId) {
              const followResult = await checkFollowStatus(currentUserId, user.id);
              if (followResult.success) {
                followStatesMap[user.id] = followResult.isFollowing || false;
              }
            }
          }
          setFollowStates(followStatesMap);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [isOpen, userId, type, currentUserId]);

  // フォロー/アンフォロー処理
  const handleFollowToggle = async (targetUserId: string) => {
    if (!currentUserId || followingLoading[targetUserId]) return;

    setFollowingLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      const isCurrentlyFollowing = followStates[targetUserId];
      const result = isCurrentlyFollowing 
        ? await unfollowUser(targetUserId)
        : await followUser(targetUserId);
      
      if (result.success) {
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: !isCurrentlyFollowing
        }));
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
    
    setFollowingLoading(prev => ({ ...prev, [targetUserId]: false }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {type === 'followers' ? 'フォロワー' : 'フォロー中'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ユーザーリスト */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-500 mt-2">読み込み中...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {type === 'followers' ? 'フォロワーがいません' : 'フォロー中のユーザーがいません'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between">
                  <Link 
                    href={`/owners/profile/${user.username}`}
                    className="flex items-center flex-1 min-w-0 mr-3"
                    onClick={onClose}
                  >
                    {/* アバター */}
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mr-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                          <span className="text-white text-lg font-semibold">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* ユーザー情報 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.username}
                      </p>
                      {user.bio && (
                        <p className="text-sm text-gray-500 truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* フォローボタン */}
                  {currentUserId && user.id !== currentUserId && (
                    <button
                      onClick={() => handleFollowToggle(user.id)}
                      disabled={followingLoading[user.id]}
                      className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        followStates[user.id]
                          ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {followingLoading[user.id]
                        ? '...'
                        : followStates[user.id]
                        ? 'フォロー中'
                        : 'フォロー'
                      }
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}