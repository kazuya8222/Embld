'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { likeOwnerPost } from '@/app/actions/ownerPosts';

interface LikeButtonProps {
  postId: string;
  isLiked: boolean;
  likeCount: number;
  currentUser: User | null;
}

export function LikeButton({ postId, isLiked: initialIsLiked, likeCount: initialLikeCount, currentUser }: LikeButtonProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    await likeOwnerPost(postId, currentUser.id);
    setIsLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`p-3 rounded-lg transition-colors disabled:opacity-50 ${
        isLiked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={`いいね (${likeCount})`}
    >
      <Heart 
        className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
      />
    </button>
  );
}