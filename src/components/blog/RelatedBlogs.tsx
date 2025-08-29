'use client'

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BlogImage from '@/components/blog/BlogImage';
import { useRelatedBlogs } from '@/hooks/useRelatedBlogs';
import { Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RelatedBlogsProps {
  currentBlogId: string;
  category: string;
  tags: string[];
  limit?: number;
}

export function RelatedBlogs({ currentBlogId, category, tags, limit = 3 }: RelatedBlogsProps) {
  const { relatedBlogs, loading } = useRelatedBlogs(currentBlogId, category, tags, limit);

  if (loading) {
    return (
      <div className="border-t border-[#3a3a3a] pt-12">
        <h3 className="text-xl font-bold text-[#e0e0e0] mb-6">関連ブログ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#2a2a2a] rounded-lg h-48 mb-4"></div>
              <div className="h-4 bg-[#2a2a2a] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[#2a2a2a] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedBlogs.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-[#3a3a3a] pt-12">
      <h3 className="text-xl font-bold text-[#e0e0e0] mb-6">関連ブログ</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedBlogs.map((blog) => (
          <Link key={blog.id} href={`/blogs/${blog.slug}`}>
            <Card className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] transition-colors group cursor-pointer overflow-hidden h-full flex flex-col">
              <div className="relative flex-1 flex flex-col">
                {/* Blog Image */}
                <BlogImage
                  src={blog.featured_image}
                  alt={blog.title}
                  className="aspect-[16/10]"
                  width={400}
                  height={250}
                />

                <CardContent className="p-4 flex-1 flex flex-col">
                  {/* Title & Excerpt */}
                  <div className="mb-3 flex-1">
                    <h4 className="text-[#e0e0e0] font-semibold text-base mb-2 line-clamp-2 h-12 group-hover:text-[#0066cc] transition-colors">
                      {blog.title}
                    </h4>
                    <p className="text-[#a0a0a0] text-sm line-clamp-2 h-10">
                      {blog.excerpt}
                    </p>
                  </div>

                  {/* Category Badge */}
                  {blog.category && (
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs border-[#0066cc] text-[#0066cc] bg-[#0066cc]/10">
                        {blog.category}
                      </Badge>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="h-6 mb-3">
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-[#3a3a3a] text-[#a0a0a0]">
                            #{tag}
                          </Badge>
                        ))}
                        {blog.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs border-[#3a3a3a] text-[#a0a0a0]">
                            +{blog.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Published Date */}
                  <div className="flex items-center text-xs text-[#666666] mt-auto">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(blog.published_at), {
                        addSuffix: true,
                        locale: ja
                      })}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedBlogs;