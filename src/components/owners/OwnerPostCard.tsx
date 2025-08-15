'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, ExternalLink, Github, Eye } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date';

interface OwnerPostCardProps {
  post: any;
}

export function OwnerPostCard({ post }: OwnerPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    // TODO: Implement actual like functionality
  };

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link href={`/owners/profile/${post.user?.username || post.user_id}`}>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
        </div>
        
        <Link href={`/owners/${post.id}`}>
          <h2 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </Link>
        
        <p className="text-gray-700 mb-4 line-clamp-3">
          {post.description}
        </p>
        
        {post.images && post.images.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={post.images[0]} 
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}
        
        {post.tech_stack && post.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tech_stack.map((tech: string) => (
              <span 
                key={tech}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } transition-colors`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </button>
            
            <Link 
              href={`/owners/${post.id}#comments`}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments?.[0]?.count || 0}</span>
            </Link>
            
            <div className="flex items-center space-x-1 text-gray-500">
              <Eye className="w-5 h-5" />
              <span className="text-sm">{post.view_count || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {post.demo_url && (
              <a
                href={post.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            {post.github_url && (
              <a
                href={post.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}