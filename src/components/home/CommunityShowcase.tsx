'use client'

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Heart, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface OwnerPost {
  id: string;
  title: string;
  description: string;
  overview?: string;
  icon_url?: string;
  video_url?: string;
  like_count: number;
  category: string;
  user_id: string;
  demo_url?: string;
  github_url?: string;
  tags: string[];
}

export function CommunityShowcase() {
  const [posts, setPosts] = useState<OwnerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/embld-products', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const result = await response.json();
          const allPosts = result.data || [];
          // Get first 6 posts sorted by like count
          const sortedPosts = allPosts
            .sort((a: OwnerPost, b: OwnerPost) => 
              (b.like_count || 0) - (a.like_count || 0)
            )
            .slice(0, 6);
          setPosts(sortedPosts);
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
          <div className="h-8 bg-[#2a2a2a] rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-[#2a2a2a] rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#2a2a2a] rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-[#e0e0e0] mb-2">完成アプリ一覧</h2>
          <p className="text-[#a0a0a0]">embldで開発されたアプリを見てみましょう。</p>
        </div>
        <Link href="/embld-products">
          <Button variant="ghost" className="text-[#a0a0a0] hover:text-[#e0e0e0]">
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
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Link href={`/embld-products/${post.id}`}>
              <Card className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] transition-all duration-300 group cursor-pointer overflow-hidden">
              <div className="relative">
                {/* Project Video/Image */}
                <div className="aspect-video bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] relative overflow-hidden">
                  {post.video_url ? (
                    <div 
                      className="relative w-full h-full cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVideoUrl(post.video_url!);
                        setIsVideoModalOpen(true);
                      }}
                    >
                      <video 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        preload="metadata" 
                        className="w-full h-full object-cover"
                      >
                        <source src={post.video_url} type="video/mp4" />
                        <source src={post.video_url} type="video/webm" />
                        <source src={post.video_url} type="video/quicktime" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : post.icon_url ? (
                    <img 
                      src={post.icon_url} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-[#a0a0a0] text-lg font-medium">
                        {post.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  {post.category && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 left-3 bg-black/50 text-[#e0e0e0] border-0"
                    >
                      {post.category}
                    </Badge>
                  )}
                  
                  {/* View Details Button (only show for non-video content) */}
                  {!post.video_url && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="bg-[#e0e0e0] text-black hover:bg-[#c0c0c0]"
                      >
                        詳細を見る
                      </Button>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Title & Description */}
                  <div className="mb-3">
                    <h3 className="text-[#e0e0e0] font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[#a0a0a0] text-sm line-clamp-2">
                      {post.overview || post.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-[#a0a0a0]">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.like_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Full-Screen Video Modal */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div className="relative max-w-6xl w-full aspect-video">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10"
            >
              ×
            </button>
            
            <div onClick={(e) => e.stopPropagation()}>
              {selectedVideoUrl.includes('youtube.com') || selectedVideoUrl.includes('youtu.be') ? (
                <iframe
                  src={selectedVideoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : selectedVideoUrl.includes('vimeo.com') ? (
                <iframe
                  src={selectedVideoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <video 
                  controls 
                  autoPlay 
                  className="w-full h-full rounded-lg"
                >
                  <source src={selectedVideoUrl} type="video/mp4" />
                  <source src={selectedVideoUrl} type="video/webm" />
                  <source src={selectedVideoUrl} type="video/quicktime" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}