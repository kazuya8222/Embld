'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from '@/lib/utils/date';
import { createOwnerPostComment } from '@/app/actions/ownerComments';

interface OwnerPostCommentsProps {
  postId: string;
  comments: any[];
  currentUser: User | null;
}

export function OwnerPostComments({ postId, comments, currentUser }: OwnerPostCommentsProps) {
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmitting(true);
    
    const result = await createOwnerPostComment({
      post_id: postId,
      user_id: currentUser.id,
      content: commentText.trim(),
    });

    if (result.success) {
      setCommentText('');
      router.refresh();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">コメント ({comments.length})</h2>
      
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="コメントを入力..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '投稿中...' : 'コメントする'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-2">コメントするにはログインが必要です</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-blue-600 hover:underline"
          >
            ログイン
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">まだコメントがありません</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">
                      {comment.user?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}