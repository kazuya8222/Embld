'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Globe,
  Lock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import EditBlogModal from '@/components/admin/EditBlogModal';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  featured_image?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/admin/blogs/list');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const updateBlogStatus = async (blogId: string, newStatus: 'published' | 'draft') => {
    try {
      setIsUpdating(blogId);
      
      // まずブログの詳細を取得
      const blogToUpdate = blogs.find(b => b.id === blogId);
      if (!blogToUpdate) return;

      const response = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: blogId,
          title: blogToUpdate.title,
          slug: blogToUpdate.slug,
          excerpt: blogToUpdate.excerpt,
          content: blogToUpdate.content || '',
          featured_image: blogToUpdate.featured_image,
          tags: blogToUpdate.tags,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ステータスの更新に失敗しました');
      }

      alert(newStatus === 'published' ? 'ブログを公開しました！' : 'ブログを下書きに戻しました。');
      fetchBlogs(); // リフレッシュ
    } catch (error) {
      console.error('Status update error:', error);
      alert('ステータスの更新に失敗しました。');
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteBlog = async (blogId: string) => {
    if (!confirm('本当にこのブログを削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      setIsUpdating(blogId);
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ブログの削除に失敗しました');
      }

      alert('ブログを削除しました。');
      fetchBlogs(); // リフレッシュ
    } catch (error) {
      console.error('Delete error:', error);
      alert('ブログの削除に失敗しました。');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  const handleModalSave = (updatedBlog: Blog) => {
    fetchBlogs(); // リフレッシュ
    setIsModalOpen(false);
    setEditingBlog(null);
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
          <h1 className="text-3xl font-bold text-gray-900">ブログ管理</h1>
          <p className="text-gray-600 mt-2">
            投稿済みブログの管理と編集ができます
          </p>
        </div>
        <Link href="/admin/blogs/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新規ブログ執筆
          </Button>
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ブログ数</p>
                <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <PenTool className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">公開済み</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogs.filter(blog => blog.status === 'published').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">下書き</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogs.filter(blog => blog.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ブログ一覧 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだブログが投稿されていません
                </h3>
                <p className="text-gray-600 mb-6">
                  最初のブログ記事を執筆してみましょう
                </p>
                <Link href="/admin/blogs/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    新規ブログ執筆
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        タイトル
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        ステータス
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
                    {blogs.map((blog) => (
                      <tr key={blog.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <h3 className="font-medium text-gray-900 line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                              {blog.excerpt}
                            </p>
                            {blog.tags && blog.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {blog.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                                {blog.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{blog.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              blog.status === 'published'
                                ? 'default'
                                : blog.status === 'draft'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {blog.status === 'published' && '公開'}
                            {blog.status === 'draft' && '下書き'}
                            {blog.status === 'archived' && 'アーカイブ'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDistanceToNow(new Date(blog.updated_at), {
                            addSuffix: true,
                            locale: ja
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditBlog(blog)}
                              disabled={isUpdating === blog.id}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              編集
                            </Button>
                            
                            {blog.status === 'published' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateBlogStatus(blog.id, 'draft')}
                                disabled={isUpdating === blog.id}
                                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                              >
                                <Lock className="w-4 h-4 mr-1" />
                                {isUpdating === blog.id ? '更新中...' : '非公開'}
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateBlogStatus(blog.id, 'published')}
                                disabled={isUpdating === blog.id}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <Globe className="w-4 h-4 mr-1" />
                                {isUpdating === blog.id ? '更新中...' : '公開'}
                              </Button>
                            )}
                            
                            <Link href={`/blogs/${blog.slug}`} target="_blank">
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={isUpdating === blog.id}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                表示
                              </Button>
                            </Link>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteBlog(blog.id)}
                              disabled={isUpdating === blog.id}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {isUpdating === blog.id ? '削除中...' : '削除'}
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

      {/* 編集モーダル */}
      {editingBlog && (
        <EditBlogModal
          blog={editingBlog}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}