'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { saveOwnerPost } from '@/app/actions/ownerPosts';

interface SaveButtonProps {
  postId: string;
  currentUser: User | null;
  isSaved?: boolean;
  saveCount?: number;
}

export function SaveButton({ postId, currentUser, isSaved: initialIsSaved = false, saveCount: initialSaveCount = 0 }: SaveButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [saveCount, setSaveCount] = useState(initialSaveCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    setIsSaved(!isSaved);
    setSaveCount(isSaved ? saveCount - 1 : saveCount + 1);
    
    const result = await saveOwnerPost(postId, currentUser.id);
    
    if (!result.success) {
      // Revert on error
      setIsSaved(isSaved);
      setSaveCount(initialSaveCount);
    }
    
    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
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
      <span className="text-sm text-gray-600">{saveCount}</span>
    </div>
  );
}