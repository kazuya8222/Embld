'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';
import BlogImage from '@/components/blog/BlogImage';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author_id: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  like_count: number;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const supabase = createClient();

  const handleMenuToggle = () => {
    setIsSidebarLocked(!isSidebarLocked);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuHover = (isHovering: boolean) => {
    setIsSidebarHovered(isHovering);
    if (!isSidebarLocked) {
      setIsSidebarOpen(isHovering);
    }
  };

  const shouldShowSidebar = isSidebarLocked || isSidebarHovered;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('status', 'published')
          .order('is_featured', { ascending: false })
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Error fetching blogs:', error);
          return;
        }

        setBlogs(data || []);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [supabase]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] relative">
        <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
        <AnimatePresence>
          {shouldShowSidebar && (
            <motion.div
              initial={{ x: -264, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -264, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50"
              onMouseEnter={() => handleMenuHover(true)}
              onMouseLeave={() => handleMenuHover(false)}
            >
              <Sidebar onLockToggle={handleMenuToggle} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pt-16">
          <div className="max-w-7xl mx-auto p-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative">
      {/* TopBar */}
      <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
      
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.div
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 top-0 z-50"
            onMouseEnter={() => handleMenuHover(true)}
            onMouseLeave={() => handleMenuHover(false)}
          >
            <Sidebar onLockToggle={handleMenuToggle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#e0e0e0] mb-2">
                ブログ一覧
              </h1>
            </div>
          </div>


          {/* Blogs Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <div key={blog.id}>
                <Link href={`/blogs/${blog.slug}`}>
                  <Card className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] transition-colors group cursor-pointer overflow-hidden h-full flex flex-col">
                    <div className="relative flex-1 flex flex-col">
                      {/* Blog Image */}
                      <BlogImage
                        src={blog.featured_image}
                        alt={blog.title}
                        className="aspect-video"
                        width={400}
                        height={225}
                      />

                      <CardContent className="p-4 flex-1 flex flex-col">
                        {/* Title & Excerpt */}
                        <div className="mb-3 flex-1">
                          <h3 className="text-[#e0e0e0] font-semibold text-lg mb-2 line-clamp-2 h-14">
                            {blog.title}
                          </h3>
                          <p className="text-[#a0a0a0] text-sm line-clamp-3 h-16">
                            {blog.excerpt}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="h-8 mb-3">
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {blog.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs border-[#3a3a3a] text-[#a0a0a0]">
                                  {tag}
                                </Badge>
                              ))}
                              {blog.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs border-[#3a3a3a] text-[#a0a0a0]">
                                  +{blog.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Meta Information */}
                        <div className="flex items-center text-sm text-[#a0a0a0] h-5">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(blog.published_at), {
                                addSuffix: true,
                                locale: ja
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-20">
              <div className="text-[#a0a0a0] mb-4">
                まだブログが投稿されていません
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}