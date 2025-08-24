'use client'

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Eye, Heart, GitFork, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface OwnerPost {
  id: string;
  title: string;
  description: string;
  images: string[];
  view_count: number;
  like_count: number;
  category: string;
  user_id: string;
  demo_url?: string;
  github_url?: string;
  tags: string[];
  tech_stack: string[];
}

export function CommunityShowcase() {
  const [posts, setPosts] = useState<OwnerPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = `
          SELECT 
            op.id,
            op.title,
            op.description,
            op.images,
            op.view_count,
            op.like_count,
            op.category,
            op.user_id,
            op.demo_url,
            op.github_url,
            op.tags,
            op.tech_stack,
            profiles.username,
            profiles.avatar_url
          FROM owner_posts op
          LEFT JOIN profiles ON op.user_id = profiles.id
          WHERE op.is_public = true 
            AND op.approval_status = 'approved'
          ORDER BY op.like_count DESC, op.view_count DESC
          LIMIT 6
        `;
        
        const response = await fetch('/api/community/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch community posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="w-full max-w-7xl mx-auto px-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">完成アプリ一覧</h2>
          <p className="text-gray-400">embldで開発されたアプリを見てみましょう。</p>
        </div>
        <Link href="/owners">
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            全て見る <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
          >
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 group cursor-pointer overflow-hidden">
              <div className="relative">
                {/* Project Image */}
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                  {post.images && post.images.length > 0 ? (
                    <img 
                      src={post.images[0]} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-500 text-lg font-medium">
                        {post.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {post.category && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 left-3 bg-black/50 text-white border-0"
                    >
                      {post.category}
                    </Badge>
                  )}
                  
                  {/* View Details Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Title & Description */}
                  <div className="mb-3">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {post.description}
                    </p>
                  </div>

                  {/* Tech Stack Tags */}
                  {post.tech_stack && post.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tech_stack.slice(0, 3).map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {tech}
                        </Badge>
                      ))}
                      {post.tech_stack.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                          +{post.tech_stack.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        <span>{post.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.like_count || 0}</span>
                      </div>
                    </div>
                    
                    {/* User Avatar */}
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {post.user_id?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}