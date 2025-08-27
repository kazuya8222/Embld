'use client'

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Calendar, 
  Clock, 
  User, 
  Share2,
  Bookmark,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Article {
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

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
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
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error || !data) {
          console.error('Error fetching article:', error);
          notFound();
          return;
        }

        setArticle(data);
        
        // Increment view count
        await supabase
          .from('articles')
          .update({ view_count: data.view_count + 1 })
          .eq('id', data.id);

      } catch (error) {
        console.error('Failed to fetch article:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, supabase]);

  const handleLike = async () => {
    if (!article) return;

    try {
      const newLikeCount = liked ? article.like_count - 1 : article.like_count + 1;
      
      const { error } = await supabase
        .from('articles')
        .update({ like_count: newLikeCount })
        .eq('id', article.id);

      if (!error) {
        setArticle({ ...article, like_count: newLikeCount });
        setLiked(!liked);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] relative">
        <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
        <div className="pt-16">
          <div className="max-w-4xl mx-auto p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-[#2a2a2a] rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-[#2a2a2a] rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-[#2a2a2a] rounded mb-8"></div>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-[#2a2a2a] rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return notFound();
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
        <div className="max-w-4xl mx-auto p-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/articles">
              <Button 
                variant="ghost" 
                className="text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                記事一覧に戻る
              </Button>
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            {article.is_featured && (
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-[#e0e0e0] mb-4">
                FEATURED
              </Badge>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0] mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-lg text-[#a0a0a0] mb-6 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#a0a0a0] mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(article.published_at), {
                    addSuffix: true,
                    locale: ja
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>約{Math.ceil(article.content.length / 500)}分で読めます</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.view_count}回表示</span>
              </div>

              <Badge variant="outline" className="border-[#3a3a3a] text-[#a0a0a0]">
                {article.category}
              </Badge>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="border-[#3a3a3a] text-[#a0a0a0]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>

          {/* Featured Image */}
          {article.featured_image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </motion.div>
          )}

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="prose prose-lg prose-invert max-w-none mb-12"
          >
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={`${className} bg-[#2a2a2a] px-1 py-0.5 rounded text-[#e0e0e0]`} {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => <h1 className="text-2xl font-bold text-[#e0e0e0] mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-[#e0e0e0] mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold text-[#e0e0e0] mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-[#a0a0a0] leading-relaxed mb-4">{children}</p>,
                ul: ({ children }) => <ul className="text-[#a0a0a0] space-y-2 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="text-[#a0a0a0] space-y-2 mb-4">{children}</ol>,
                li: ({ children }) => <li className="text-[#a0a0a0]">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#0066cc] pl-4 italic text-[#a0a0a0] bg-[#2a2a2a] py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    className="text-[#0066cc] hover:text-[#0052a3] underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-4 mb-12 p-4 bg-[#2a2a2a] rounded-lg"
          >
            <Button
              onClick={handleLike}
              variant="ghost"
              className={`flex items-center gap-2 ${
                liked 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-[#a0a0a0] hover:text-[#e0e0e0]'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span>{article.like_count}</span>
            </Button>

            <Button
              onClick={() => setBookmarked(!bookmarked)}
              variant="ghost"
              className={`flex items-center gap-2 ${
                bookmarked 
                  ? 'text-yellow-500 hover:text-yellow-400' 
                  : 'text-[#a0a0a0] hover:text-[#e0e0e0]'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
              <span>ブックマーク</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="ghost"
              className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#e0e0e0]"
            >
              <Share2 className="w-5 h-5" />
              <span>シェア</span>
            </Button>
          </motion.div>

          {/* Related Articles Section (placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="border-t border-[#3a3a3a] pt-12"
          >
            <h3 className="text-xl font-bold text-[#e0e0e0] mb-6">関連記事</h3>
            <div className="text-[#a0a0a0]">
              関連記事機能は準備中です。
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}