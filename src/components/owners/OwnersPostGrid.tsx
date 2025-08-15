'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Eye, ExternalLink, Github, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils/date';

interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  tech_stack: string[];
  pricing_model: string;
  platform: string[];
  view_count: number;
  like_count: number;
  created_at: string;
  project_url?: string;
  github_url?: string;
  user: {
    username: string;
    avatar_url?: string;
  };
  likes: any[];
  comments: any[];
}

interface OwnersPostGridProps {
  posts: Post[];
}

export function OwnersPostGrid({ posts }: OwnersPostGridProps) {
  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'bg-green-100 text-green-700';
      case 'freemium': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-yellow-100 text-yellow-700';
      case 'subscription': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPricingText = (pricing: string) => {
    switch (pricing) {
      case 'free': return '無料';
      case 'freemium': return 'フリーミアム';
      case 'paid': return '有料';
      case 'subscription': return 'サブスク';
      default: return '不明';
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">プロジェクトが見つかりません</h3>
        <p className="text-gray-500">別のキーワードで検索してみてください</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden"
        >
          {/* Project Image Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
            {post.title.charAt(0).toUpperCase()}
          </div>

          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link href={`/owners/${post.id}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
              </div>
              <div className="flex space-x-1 ml-2">
                {post.project_url && (
                  <a
                    href={post.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {post.github_url && (
                  <a
                    href={post.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {post.description}
            </p>

            {/* Tech Stack */}
            {post.tech_stack && post.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tech_stack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                  >
                    {tech}
                  </span>
                ))}
                {post.tech_stack.length > 3 && (
                  <span className="px-2 py-0.5 text-gray-500 text-xs">
                    +{post.tech_stack.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Categories and Pricing */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {post.category}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getPricingColor(post.pricing_model)}`}>
                  {getPricingText(post.pricing_model)}
                </span>
              </div>
            </div>

            {/* Platform */}
            {post.platform && post.platform.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.platform.map((platform) => (
                  <span
                    key={platform}
                    className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {post.like_count || 0}
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comments?.[0]?.count || 0}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {post.view_count || 0}
                </div>
              </div>
            </div>

            {/* Author and Date */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <Link 
                  href={`/owners/profile/${post.user.username}`}
                  className="hover:text-purple-600 transition-colors"
                >
                  @{post.user.username}
                </Link>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDistanceToNow(post.created_at)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}