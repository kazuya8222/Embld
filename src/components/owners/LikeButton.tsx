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
      className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <Heart 
        className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
      />
      <span className={`text-xs ${isLiked ? 'text-red-500' : ''}`}>
        {likeCount}
      </span>
    </button>
  );
}