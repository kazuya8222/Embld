'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Tag,
  Code,
  Monitor
} from 'lucide-react';
import Link from 'next/link';

interface Product {
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
  is_public: boolean;
  approval_status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const result = await response.json();
          setProduct(result.data);
          
          // Increment view count
          await fetch(`/api/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ incrementViewCount: true })
          });
        } else {
          console.error('Failed to fetch product');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
          <div className="max-w-6xl mx-auto p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-[#2a2a2a] rounded w-32 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#2a2a2a] rounded-lg aspect-video"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-[#2a2a2a] rounded w-3/4"></div>
                  <div className="h-4 bg-[#2a2a2a] rounded w-1/2"></div>
                  <div className="h-20 bg-[#2a2a2a] rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] relative">
        <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
        <div className="pt-16">
          <div className="max-w-6xl mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold text-[#e0e0e0] mb-4">プロダクトが見つかりません</h1>
            <p className="text-[#a0a0a0] mb-6">指定されたプロダクトは存在しないか、公開されていません。</p>
            <Button onClick={() => router.back()}>戻る</Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
        <div className="max-w-6xl mx-auto p-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#3a3a3a] p-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </motion.div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {product.featured && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-[#e0e0e0] border-0">
                      FEATURED
                    </Badge>
                  )}
                  {product.category && (
                    <Badge variant="outline" className="border-[#3a3a3a] text-[#a0a0a0]">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-[#e0e0e0] mb-4">
                  {product.title}
                </h1>
                <div className="flex items-center gap-6 text-sm text-[#a0a0a0] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(product.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{product.view_count.toLocaleString()} 回閲覧</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>{product.like_count.toLocaleString()} いいね</span>
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Images Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                <h2 className="text-xl font-semibold text-[#e0e0e0] mb-4">スクリーンショット</h2>
                
                {product.images && product.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-video bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] rounded-lg overflow-hidden">
                      <img
                        src={product.images[selectedImageIndex]}
                        alt={`${product.title} - Screenshot ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Thumbnail Navigation */}
                    {product.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImageIndex === index 
                                ? 'border-blue-600' 
                                : 'border-[#3a3a3a] hover:border-[#5a5a5a]'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-[#4a4a4a] rounded-full flex items-center justify-center">
                        <Monitor className="w-8 h-8 text-[#a0a0a0]" />
                      </div>
                      <p className="text-[#a0a0a0]">スクリーンショットがありません</p>
                    </div>
                  </div>
                )}
                
                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-[#e0e0e0] mb-3">説明</h3>
                  <p className="text-[#a0a0a0] leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Tech Stack */}
              {product.tech_stack && product.tech_stack.length > 0 && (
                <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                  <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    技術スタック
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tech_stack.map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="border-[#3a3a3a] text-[#e0e0e0] bg-[#3a3a3a]"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                  <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    タグ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-[#1a1a1a] text-[#a0a0a0] border border-[#3a3a3a]"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Info */}
              <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">プロジェクト情報</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">作成日</span>
                    <span className="text-[#e0e0e0]">{formatDate(product.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">更新日</span>
                    <span className="text-[#e0e0e0]">{formatDate(product.updated_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">ステータス</span>
                    <Badge 
                      variant={product.approval_status === 'approved' ? 'default' : 'secondary'}
                      className={
                        product.approval_status === 'approved' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#3a3a3a] text-[#a0a0a0]'
                      }
                    >
                      {product.approval_status === 'approved' ? '承認済み' : product.approval_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0a0a0]">公開状態</span>
                    <Badge 
                      variant={product.is_public ? 'default' : 'secondary'}
                      className={
                        product.is_public 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-[#3a3a3a] text-[#a0a0a0]'
                      }
                    >
                      {product.is_public ? '公開' : '非公開'}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}