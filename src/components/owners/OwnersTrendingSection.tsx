'use client';

import Link from 'next/link';
import { TrendingUp, Eye, Heart, Flame } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  view_count: number;
  user: {
    username: string;
  };
  likes: any[];
}

interface OwnersTrendingSectionProps {
  posts: Post[];
}

export function OwnersTrendingSection({ posts }: OwnersTrendingSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Flame className="w-6 h-6 text-red-500 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">トレンディング</h2>
        <span className="ml-3 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
          HOT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/owners/${post.id}`}
            className="group block bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:from-red-50 hover:to-orange-50 transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-red-500 mr-2">
                  #{index + 1}
                </span>
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {post.view_count.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {post.likes?.length || 0}
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
              {post.title}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {post.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="px-2 py-1 bg-white bg-opacity-60 text-gray-700 text-xs rounded-full">
                {post.category}
              </span>
              <Link 
                href={`/owners/profile/${post.user.username}`}
                className="text-xs text-purple-600 hover:text-purple-800 transition-colors font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                @{post.user.username}
              </Link>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}