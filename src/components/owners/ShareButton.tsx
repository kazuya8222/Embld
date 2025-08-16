'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  postUrl: string;
}

export function ShareButton({ postUrl }: ShareButtonProps) {
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'プロジェクトをチェック',
          url: postUrl,
        });
      } else {
        // フォールバック: URLをクリップボードにコピー
        await navigator.clipboard.writeText(postUrl);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
      title="共有"
    >
      {isShared ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <Share2 className="w-5 h-5" />
      )}
    </button>
  );
}