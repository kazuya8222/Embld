'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  category: string;
  tags: string[];
  published_at: string;
}

export function useRelatedBlogs(currentBlogId: string, category: string, tags: string[], limit: number = 3) {
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        // 1. 同じカテゴリのブログを取得
        const { data: categoryBlogs, error: categoryError } = await supabase
          .from('blogs')
          .select('id, title, slug, excerpt, featured_image, category, tags, published_at')
          .eq('status', 'published')
          .eq('category', category)
          .neq('id', currentBlogId)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (categoryError) {
          console.error('Error fetching category blogs:', categoryError);
        }

        let relatedBlogsData: Blog[] = categoryBlogs || [];

        // 2. 同じカテゴリのブログが足りない場合、タグが重複するブログを取得
        if (relatedBlogsData.length < limit && tags.length > 0) {
          const { data: tagBlogs, error: tagError } = await supabase
            .from('blogs')
            .select('id, title, slug, excerpt, featured_image, category, tags, published_at')
            .eq('status', 'published')
            .neq('id', currentBlogId)
            .overlaps('tags', tags)
            .order('published_at', { ascending: false })
            .limit(limit * 2); // より多く取得してフィルタリング

          if (tagError) {
            console.error('Error fetching tag blogs:', tagError);
          }

          if (tagBlogs) {
            // 既に取得したブログを除外
            const existingIds = relatedBlogsData.map(blog => blog.id);
            const newTagBlogs = tagBlogs
              .filter(blog => !existingIds.includes(blog.id))
              .slice(0, limit - relatedBlogsData.length);
            
            relatedBlogsData = [...relatedBlogsData, ...newTagBlogs];
          }
        }

        // 3. まだ足りない場合、最新のブログを取得
        if (relatedBlogsData.length < limit) {
          const { data: latestBlogs, error: latestError } = await supabase
            .from('blogs')
            .select('id, title, slug, excerpt, featured_image, category, tags, published_at')
            .eq('status', 'published')
            .neq('id', currentBlogId)
            .order('published_at', { ascending: false })
            .limit(limit * 2);

          if (latestError) {
            console.error('Error fetching latest blogs:', latestError);
          }

          if (latestBlogs) {
            const existingIds = relatedBlogsData.map(blog => blog.id);
            const newLatestBlogs = latestBlogs
              .filter(blog => !existingIds.includes(blog.id))
              .slice(0, limit - relatedBlogsData.length);
            
            relatedBlogsData = [...relatedBlogsData, ...newLatestBlogs];
          }
        }

        setRelatedBlogs(relatedBlogsData.slice(0, limit));
      } catch (error) {
        console.error('Failed to fetch related blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentBlogId) {
      fetchRelatedBlogs();
    }
  }, [currentBlogId, category, tags, limit, supabase]);

  return { relatedBlogs, loading };
}