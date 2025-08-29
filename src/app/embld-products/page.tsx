'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart } from 'lucide-react';
import Link from 'next/link';

interface EmbldProduct {
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
  created_at: string;
}

export default function EmbldProductsPage() {
  const [products, setProducts] = useState<EmbldProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/embld-products', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const result = await response.json();
          setProducts(result.data || []);
        } else {
          console.error('Failed to fetch embld products');
        }
      } catch (error) {
        console.error('Failed to fetch embld products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

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
                {[...Array(9)].map((_, i) => (
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
                完成プロダクト一覧
              </h1>
              <p className="text-[#a0a0a0]">
                Embldで開発された全てのプロダクトを探索しましょう
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#0066cc] text-[#e0e0e0]'
                    : 'bg-[#2a2a2a] text-[#a0a0a0] hover:bg-[#3a3a3a] hover:text-[#e0e0e0]'
                }`}
              >
                {category === 'all' ? 'すべて' : category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <div key={product.id}>
                <Link href={`/embld-products/${product.id}`}>
                  <Card className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] transition-colors group cursor-pointer overflow-hidden">
                    <div className="relative">
                      {/* Project Image */}
                      <div className="bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] relative overflow-hidden aspect-video">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-full h-full object-cover"
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
                        
                        {/* View Details Button */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="bg-[#e0e0e0] text-black hover:bg-[#c0c0c0]"
                          >
                            詳細を見る
                          </Button>
                        </div>
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


                        {/* Stats */}
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
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-[#a0a0a0] mb-4">
                {selectedCategory === 'all' 
                  ? 'まだプロダクトが登録されていません'
                  : `${selectedCategory}カテゴリにはプロダクトがありません`
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}