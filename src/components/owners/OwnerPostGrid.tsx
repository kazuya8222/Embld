'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Eye } from 'lucide-react';

interface OwnerPostGridProps {
  posts: any[];
}

export function OwnerPostGrid({ posts }: OwnerPostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📱</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">まだ投稿がありません</h3>
        <p className="text-gray-500">最初のプロジェクトを投稿してみましょう</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/owners/${post.id}`}
          className="group relative aspect-square bg-gray-100 overflow-hidden"
        >
          {/* Project Image Placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg md:text-3xl">
            {post.title.charAt(0).toUpperCase()}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 text-white">
            <div className="flex items-center">
              <Heart className="w-4 h-4 md:w-6 md:h-6 mr-1 fill-current" />
              <span className="text-sm md:text-base font-semibold">{post.like_count || 0}</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 md:w-6 md:h-6 mr-1 fill-current" />
              <span className="text-sm md:text-base font-semibold">{post.comments?.[0]?.count || 0}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 md:w-6 md:h-6 mr-1" />
              <span className="text-sm md:text-base font-semibold">{post.view_count || 0}</span>
            </div>
          </div>

          {/* Project indicator for featured posts */}
          {post.is_featured && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
          )}
        </Link>
      ))}
    </div>
  );
}