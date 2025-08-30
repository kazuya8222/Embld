'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth/AuthProvider';
import { TopBar } from '@/components/common/TopBar';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, Rocket, ChevronRight, Calendar, Plus } from 'lucide-react';
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
  const router = useRouter();
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
        const response = await fetch(`/api/products?userId=${user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const result = await response.json();
          setProducts(result.data || []);
        } else {
          console.error('Failed to fetch user products');
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
      <div className="h-screen flex flex-col bg-[#1a1a1a]">
        <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#e0e0e0]">Loading...</div>
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
    <div className="h-screen flex flex-col bg-[#1a1a1a] relative overflow-hidden">
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

      {/* TopBar */}
      <TopBar onMenuToggle={handleMenuToggle} onMenuHover={handleMenuHover} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#e0e0e0] mb-2">プロダクト一覧</h1>
            <p className="text-[#a0a0a0]">開発したプロダクトを管理できます</p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Rocket className="w-16 h-16 text-[#5a5a5a] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#a0a0a0] mb-2">
                プロダクトがありません
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <div key={product.id}>
                  <Card className="bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#4a4a4a] transition-colors cursor-pointer group">
                    <Link href={`/products/${product.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Rocket className="w-6 h-6 text-blue-400 flex-shrink-0" />
                          <ChevronRight className="w-4 h-4 text-[#808080] group-hover:text-[#e0e0e0] transition-colors" />
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <CardTitle className="text-lg text-[#e0e0e0] mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {product.title || '無題のプロダクト'}
                        </CardTitle>
                        
                        <p className="text-[#a0a0a0] text-sm mb-4 line-clamp-3">
                          {product.description ? 
                            product.description.slice(0, 100) + (product.description.length > 100 ? '...' : '')
                            : '説明が設定されていません'
                          }
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-[#808080]">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(product.created_at).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          {product.category && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                              {product.category}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}