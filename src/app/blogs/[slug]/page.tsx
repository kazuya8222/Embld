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
  Calendar, 
  Clock
} from 'lucide-react';
import Link from 'next/link';
import BlogImage from '@/components/blog/BlogImage';
import RelatedBlogs from '@/components/blog/RelatedBlogs';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

export default function BlogPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
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
    const fetchBlog = async () => {
      if (!slug) {
        console.error('No slug provided');
        setLoading(false);
        return;
      }

      console.log('Fetching blog with slug:', slug);

      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        console.log('Query result:', { data, error });

        if (error) {
          console.error('Supabase query error:', error);
          setLoading(false);
          return;
        }

        if (!data) {
          console.error('No blog data returned for slug:', slug);
          setLoading(false);
          return;
        }

        console.log('Setting blog data:', data);
        setBlog(data);

      } catch (error) {
        console.error('Failed to fetch blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, supabase]);


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

  if (!loading && !blog) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] relative">
        <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
        <div className="pt-16">
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-[#e0e0e0] mb-4">
                ブログが見つかりません
              </h1>
              <p className="text-[#a0a0a0] mb-8">
                指定されたブログは存在しないか、まだ公開されていません。
              </p>
              <Link href="/blogs">
                <Button variant="ghost" className="text-[#0066cc] hover:bg-[#0066cc]/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ブログ一覧に戻る
                </Button>
              </Link>
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
        <div className="max-w-4xl mx-auto p-6">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/blogs">
              <Button 
                variant="ghost" 
                className="text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ブログ一覧に戻る
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0] mb-4 leading-tight">
              {blog?.title}
            </h1>
            
            <p className="text-lg text-[#a0a0a0] mb-6 leading-relaxed">
              {blog?.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#a0a0a0] mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(blog?.published_at || ''), {
                    addSuffix: true,
                    locale: ja
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>約{Math.ceil((blog?.content?.length || 0) / 500)}分で読めます</span>
              </div>

            </div>

            {/* Tags */}
            {blog?.tags && blog?.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog?.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="border-[#3a3a3a] text-[#a0a0a0]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <BlogImage
              src={blog?.featured_image}
              alt={blog?.title}
              className="w-full h-64 md:h-80 rounded-lg"
              priority
              width={800}
              height={320}
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-invert max-w-none mb-12">
            <ReactMarkdown
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  return !isInline ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={`${className} bg-[#2a2a2a] px-1 py-0.5 rounded text-[#e0e0e0]`} {...rest}>
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
                img: ({ src, alt }) => (
                  <BlogImage
                    src={src}
                    alt={alt || 'Blog image'}
                    className="w-full h-auto rounded-lg my-6"
                    width={800}
                    height={400}
                  />
                ),
              }}
            >
              {blog?.content}
            </ReactMarkdown>
          </div>

          {/* Related Blogs */}
          <RelatedBlogs
            currentBlogId={blog?.id || ''}
            category={blog?.category || ''}
            tags={blog?.tags || []}
            limit={3}
          />
        </div>
      </div>
    </div>
  );
}