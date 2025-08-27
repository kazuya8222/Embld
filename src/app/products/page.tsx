'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth/AuthProvider';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, GitFork, ArrowUpRight, Plus, Rocket } from 'lucide-react';
import Link from 'next/link';

interface UserProduct {
  id: string;
  title: string;
  description: string;
  images: string[];
  view_count: number;
  like_count: number;
  category: string;
  demo_url?: string;
  github_url?: string;
  tags: string[];
  tech_stack: string[];
  created_at: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

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
    const fetchUserProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const query = `
          SELECT 
            id,
            title,
            description,
            images,
            view_count,
            like_count,
            category,
            demo_url,
            github_url,
            tags,
            tech_stack,
            created_at
          FROM owner_posts 
          WHERE user_id = '${user.id}'
          ORDER BY created_at DESC
        `;
        
        const response = await fetch('/api/community/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch user products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] p-6">
        <div className="max-w-7xl mx-auto">
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
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#e0e0e0] mb-4">ログインが必要です</h1>
          <Link href="/auth/login">
            <Button>ログイン</Button>
          </Link>
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
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-[#e0e0e0] mb-2"
          >
            あなたのプロダクト
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#a0a0a0]"
          >
            開発したプロダクトを管理しましょう
          </motion.p>
        </div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Rocket className="w-16 h-16 text-[#5a5a5a] mb-6" />
            <h2 className="text-xl font-semibold text-[#e0e0e0] mb-2">
              まだプロダクトがないです。
            </h2>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] transition-all duration-300 group cursor-pointer overflow-hidden">
                  <div className="relative">
                    {/* Project Image */}
                    <div className="aspect-video bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-[#a0a0a0] text-lg font-medium">
                            {product.title.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {product.category && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-3 left-3 bg-black/50 text-[#e0e0e0] border-0"
                        >
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Title & Description */}
                      <div className="mb-3">
                        <h3 className="text-[#e0e0e0] font-semibold text-lg mb-2 line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-[#a0a0a0] text-sm line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Tech Stack Tags */}
                      {product.tech_stack && product.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tech_stack.slice(0, 3).map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-[#3a3a3a] text-[#a0a0a0]">
                              {tech}
                            </Badge>
                          ))}
                          {product.tech_stack.length > 3 && (
                            <Badge variant="outline" className="text-xs border-[#3a3a3a] text-[#a0a0a0]">
                              +{product.tech_stack.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-[#a0a0a0]">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{product.view_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{product.like_count || 0}</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          {product.demo_url && (
                            <a
                              href={product.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#a0a0a0] hover:text-[#e0e0e0]"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </a>
                          )}
                          {product.github_url && (
                            <a
                              href={product.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#a0a0a0] hover:text-[#e0e0e0]"
                            >
                              <GitFork className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}