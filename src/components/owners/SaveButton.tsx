'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface SaveButtonProps {
  postId: string;
  currentUser: User | null;
}

export function SaveButton({ postId, currentUser }: SaveButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    // TODO: Implement save/unsave functionality
    setIsSaved(!isSaved);
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`p-3 rounded-lg transition-colors disabled:opacity-50 ${
        isSaved
          ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title="保存"
    >
      <Bookmark 
        className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} 
      />
    </button>
  );
}