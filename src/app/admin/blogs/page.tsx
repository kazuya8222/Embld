import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PenTool, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

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

export default async function AdminBlogsPage() {
  const supabase = createSupabaseServerClient();
  
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
  }

  const blogsList: Blog[] = blogs || [];

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ブログ数</p>
                <p className="text-2xl font-bold text-gray-900">{blogsList.length}</p>
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
                  {blogsList.filter(blog => blog.status === 'published').length}
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
                  {blogsList.filter(blog => blog.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アーカイブ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogsList.filter(blog => blog.status === 'archived').length}
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
            {blogsList.length === 0 ? (
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
                        カテゴリ
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        ステータス
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        閲覧数
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
                    {blogsList.map((blog) => (
                      <tr key={blog.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <h3 className="font-medium text-gray-900 line-clamp-1">
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
                          <Badge variant="outline">
                            {blog.category || '未分類'}
                          </Badge>
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
                          {blog.view_count || 0}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDistanceToNow(new Date(blog.updated_at), {
                            addSuffix: true,
                            locale: ja
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/blogs/${blog.slug}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/blogs/${blog.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
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