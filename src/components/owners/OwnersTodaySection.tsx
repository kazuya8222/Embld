'use client';

import Link from 'next/link';
import { Rocket, ExternalLink, Clock } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date';

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  pricing_model: string;
  user: {
    username: string;
  };
  created_at: string;
}

interface OwnersTodaySectionProps {
  posts: Post[];
}

export function OwnersTodaySection({ posts }: OwnersTodaySectionProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Rocket className="w-6 h-6 text-orange-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">今日のローンチ</h2>
          <span className="ml-3 px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
            NEW
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/owners/${post.id}`}
              className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {post.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-500 ml-2 flex-shrink-0" />
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {post.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    post.pricing_model === 'free' 
                      ? 'bg-green-100 text-green-700'
                      : post.pricing_model === 'freemium'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {post.pricing_model === 'free' ? '無料' : 
                     post.pricing_model === 'freemium' ? 'フリーミアム' :
                     post.pricing_model === 'paid' ? '有料' : 'サブスク'}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(post.created_at)}
                </div>
              </div>

              <div className="mt-2 text-xs">
                by <Link 
                  href={`/owners/profile/${post.user.username}`}
                  className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{post.user.username}
                </Link>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            今日はまだ新しいプロジェクトがありません
          </div>
        )}
      </div>
    </div>
  );
}