'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { followUser, unfollowUser } from '@/app/actions/ownerFollows';
import { UserPlus, UserCheck } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  currentUser: User | null;
}

export function FollowButton({ userId, isFollowing: initialIsFollowing, currentUser }: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    
    if (isFollowing) {
      const result = await unfollowUser(userId);
      if (result.success) {
        setIsFollowing(false);
      }
    } else {
      const result = await followUser(userId);
      if (result.success) {
        setIsFollowing(true);
      }
    }
    
    setIsLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          フォロー中
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          フォロー
        </>
      )}
    </button>
  );
}