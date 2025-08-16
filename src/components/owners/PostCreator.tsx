'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image, Link, Code } from 'lucide-react';

interface PostCreatorProps {
  userId: string;
}

export function PostCreator({ userId }: PostCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleCreatePost = () => {
    router.push('/owners/new');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div 
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <input
          type="text"
          placeholder="新しいプロジェクトを共有..."
          className="flex-1 bg-gray-100 px-4 py-2 rounded-full cursor-pointer focus:outline-none"
          onFocus={() => setIsExpanded(true)}
          readOnly
        />
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <Image className="w-4 h-4" aria-label="画像を追加" />
              <span>画像</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <Link className="w-4 h-4" />
              <span>リンク</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <Code className="w-4 h-4" />
              <span>技術スタック</span>
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreatePost}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              詳細を入力
            </button>
          </div>
        </div>
      )}
    </div>
  );
}