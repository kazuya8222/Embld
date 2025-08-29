'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Globe,
  Lock,
  Heart
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  video_url?: string;
  like_count: number;
  category: string;
  user_id: string;
  demo_url?: string;
  github_url?: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products/list');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateProductStatus = async (productId: string, isPublic: boolean) => {
    try {
      setIsUpdating(productId);
      
      const productToUpdate = products.find(p => p.id === productId);
      if (!productToUpdate) return;

      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          is_public: isPublic
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ステータスの更新に失敗しました');
      }

      alert(isPublic ? 'プロダクトを公開しました！' : 'プロダクトを非公開にしました。');
      fetchProducts();
    } catch (error) {
      console.error('Status update error:', error);
      alert('ステータスの更新に失敗しました。');
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('本当にこのプロダクトを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      setIsUpdating(productId);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'プロダクトの削除に失敗しました');
      }

      alert('プロダクトを削除しました。');
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      alert('プロダクトの削除に失敗しました。');
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">プロダクト管理</h1>
          <p className="text-gray-600 mt-2">
            投稿済みプロダクトの管理と編集ができます
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新規プロダクト投稿
          </Button>
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Monitor className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総プロダクト数</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">公開</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(product => product.is_public).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">非公開</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(product => !product.is_public).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総いいね数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((total, product) => total + (product.like_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* プロダクト一覧 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだプロダクトが投稿されていません
                </h3>
                <p className="text-gray-600 mb-6">
                  最初のプロダクトを投稿してみましょう
                </p>
                <Link href="/admin/products/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新規プロダクト投稿
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        プロダクト
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        カテゴリ
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        ステータス
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        いいね
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        更新日
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {product.icon_url ? (
                                <img
                                  src={product.icon_url}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Monitor className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 line-clamp-1">
                                {product.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                                {product.description}
                              </p>
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {product.tags.slice(0, 2).map((tag, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                  {product.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{product.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={product.is_public ? 'default' : 'secondary'}
                          >
                            {product.is_public ? '公開' : '非公開'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {product.like_count || 0}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDistanceToNow(new Date(product.updated_at), {
                            addSuffix: true,
                            locale: ja
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={isUpdating === product.id}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                編集
                              </Button>
                            </Link>
                            
                            {product.is_public ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateProductStatus(product.id, false)}
                                disabled={isUpdating === product.id}
                                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                              >
                                <Lock className="w-4 h-4 mr-1" />
                                {isUpdating === product.id ? '更新中...' : '非公開'}
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateProductStatus(product.id, true)}
                                disabled={isUpdating === product.id}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <Globe className="w-4 h-4 mr-1" />
                                {isUpdating === product.id ? '更新中...' : '公開'}
                              </Button>
                            )}
                            
                            <Link href={`/embld-products/${product.id}`} target="_blank">
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={isUpdating === product.id}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                表示
                              </Button>
                            </Link>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteProduct(product.id)}
                              disabled={isUpdating === product.id}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {isUpdating === product.id ? '削除中...' : '削除'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}