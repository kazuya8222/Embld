'use client';

import Link from 'next/link';
import { Star, Heart, ExternalLink } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  user: {
    username: string;
  };
  likes: any[];
}

interface OwnersFeaturedSectionProps {
  posts: Post[];
}

export function OwnersFeaturedSection({ posts }: OwnersFeaturedSectionProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Star className="w-6 h-6 text-purple-500 mr-2 fill-current" />
          <h2 className="text-2xl font-bold text-gray-900">注目のプロジェクト</h2>
          <span className="ml-3 px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">
            FEATURED
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/owners/${post.id}`}
              className={`group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 ${
                index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              <div className={`bg-gradient-to-br from-purple-400 to-pink-400 ${
                index === 0 ? 'h-48' : 'h-32'
              } flex items-center justify-center text-white text-6xl font-bold`}>
                {post.title.charAt(0).toUpperCase()}
              </div>
              
              <div className={`p-6 ${index === 0 ? 'space-y-4' : 'space-y-2'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-bold text-gray-900 group-hover:text-purple-600 transition-colors ${
                      index === 0 ? 'text-xl' : 'text-lg'
                    } line-clamp-2`}>
                      {post.title}
                    </h3>
                    <p className={`text-gray-600 mt-2 ${
                      index === 0 ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'
                    }`}>
                      {post.description}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500 ml-2 flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes?.length || 0}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    by <Link 
                      href={`/owners/profile/${post.user.username}`}
                      className="text-purple-600 hover:text-purple-800 transition-colors font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{post.user.username}
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}