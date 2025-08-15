'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Heart, MessageCircle, Share2, ExternalLink, Github, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date';
import { likeOwnerPost, deleteOwnerPost } from '@/app/actions/ownerPosts';

interface OwnerPostDetailProps {
  post: any;
  currentUser: User | null;
  isLiked: boolean;
}

export function OwnerPostDetail({ post, currentUser, isLiked: initialIsLiked }: OwnerPostDetailProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    await likeOwnerPost(post.id, currentUser.id);
  };

  const handleDelete = async () => {
    if (!confirm('この投稿を削除してもよろしいですか？')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteOwnerPost(post.id);
    
    if (result.success) {
      router.push('/owners');
    } else {
      alert('削除に失敗しました');
      setIsDeleting(false);
    }
  };

  const isOwner = currentUser?.id === post.user_id;

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="mb-6">
          <Link 
            href="/owners"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Link>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link href={`/owners/profile/${post.user?.username || post.user_id}`}>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </Link>
            <div>
              <Link 
                href={`/owners/profile/${post.user?.username || post.user_id}`}
                className="font-semibold hover:underline"
              >
                {post.user?.username || 'Anonymous'}
              </Link>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(post.created_at)}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/owners/${post.id}/edit`)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        
        <p className="text-lg text-gray-700 mb-6">{post.description}</p>

        {post.images && post.images.length > 0 && (
          <div className="mb-6 space-y-4">
            {post.images.map((image: string, index: number) => (
              <img 
                key={index}
                src={image} 
                alt={`${post.title} - ${index + 1}`}
                className="w-full rounded-lg"
              />
            ))}
          </div>
        )}

        {post.content && (
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {post.project_url && (
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-5 h-5 text-gray-500" />
              <a 
                href={post.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                プロジェクトサイト
              </a>
            </div>
          )}

          {post.demo_url && (
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-5 h-5 text-gray-500" />
              <a 
                href={post.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                デモサイト
              </a>
            </div>
          )}

          {post.github_url && (
            <div className="flex items-center space-x-2">
              <Github className="w-5 h-5 text-gray-500" />
              <a 
                href={post.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHubリポジトリ
              </a>
            </div>
          )}
        </div>

        {post.tech_stack && post.tech_stack.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">技術スタック</h3>
            <div className="flex flex-wrap gap-2">
              {post.tech_stack.map((tech: string) => (
                <span 
                  key={tech}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } transition-colors`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <MessageCircle className="w-6 h-6" />
              <span>{post.comments?.length || 0}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500">
              <Eye className="w-6 h-6" />
              <span>{post.view_count || 0}</span>
            </div>
          </div>
          
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </article>
  );
}