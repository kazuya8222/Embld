'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ExternalLink, 
  Calendar, 
  TrendingUp, 
  Users, 
  Star,
  MessageSquare,
  FileText,
  Milestone
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'motion/react'
import { TopBar } from '@/components/common/TopBar'
import { Sidebar } from '@/components/common/Sidebar'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

export default function ProductPage() {
  const params = useParams()
  const { user, loading } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [isSidebarLocked, setIsSidebarLocked] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (params?.id) {
      fetchProduct()
    }
  }, [params?.id])

  const fetchProduct = async () => {
    try {
      // productsテーブルから検索
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          proposals (
            service_name,
            user_id
          )
        `)
        .eq('id', params.id)
        .eq('is_public', true)
        .single()

      if (error || !product) {
        notFound()
        return
      }

      // 収益データを取得
      const { data: revenueData } = await supabase
        .from('product_revenue')
        .select('*')
        .eq('product_id', params.id)
        .order('date', { ascending: true })

      setProduct(product)
      setRevenueData(revenueData || [])
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoadingProduct(false)
    }
  }

  if (loading || loadingProduct) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#e0e0e0]">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return notFound()
  }

  // 統計情報を計算
  const totalRevenue = revenueData?.reduce((sum, item) => sum + item.revenue, 0) || 0
  const userShare = totalRevenue * 0.3 // 30%のユーザーシェア
  const totalCustomers = revenueData?.reduce((sum, item) => sum + (item.customer_count || 0), 0) || 0
  const averageRating = product.product_reviews?.length > 0 
    ? product.product_reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.product_reviews.length 
    : 0

  const handleMenuToggle = () => {
    setIsSidebarLocked(!isSidebarLocked)
  }

  const handleMenuHover = (isHovering: boolean) => {
    setIsSidebarHovered(isHovering)
  }

  const shouldShowSidebar = isSidebarLocked || isSidebarHovered

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
      <div className="min-h-screen pt-0 relative">
        <div className="relative z-10">
          <div className="pt-20 pb-8">
            <div className="max-w-6xl mx-auto p-6 space-y-8 text-[#e0e0e0]">
        {/* ヘッダー部分 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-[#e0e0e0]">{product.title}</h1>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                {product.status}
              </Badge>
            </div>
            <p className="text-[#a0a0a0] text-lg mb-6">{product.overview}</p>
            
            {/* 統計情報 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-400">
                    ¥{totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#808080]">総収益</div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-400">
                    ¥{userShare.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#808080]">あなたのシェア</div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-[#e0e0e0]">{totalCustomers}</div>
                  <div className="text-xs text-[#808080]">顧客数</div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-[#e0e0e0]">{averageRating.toFixed(1)}</div>
                  <div className="text-xs text-[#808080]">平均評価</div>
                </CardContent>
              </Card>
            </div>

            {/* プロダクトリンク */}
            <div className="flex gap-3">
              {product.demo_url && (
                <Link href={product.demo_url} target="_blank">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    デモを見る
                  </Button>
                </Link>
              )}
              {product.app_store_url && (
                <Link href={product.app_store_url} target="_blank">
                  <Button variant="outline" className="border-[#3a3a3a] text-[#e0e0e0]">
                    App Store
                  </Button>
                </Link>
              )}
              {product.google_play_url && (
                <Link href={product.google_play_url} target="_blank">
                  <Button variant="outline" className="border-[#3a3a3a] text-[#e0e0e0]">
                    Google Play
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* プロダクトアイコン */}
          {product.icon_url && (
            <div className="ml-8 flex-shrink-0">
              <img 
                src={product.icon_url} 
                alt={product.title}
                className="w-32 h-32 rounded-2xl object-cover"
              />
            </div>
          )}
        </div>

        {/* タブコンテンツ */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[#2a2a2a] border-[#3a3a3a]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#3a3a3a]">
              概要
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#3a3a3a]">
              <MessageSquare className="w-4 h-4 mr-1" />
              口コミ ({product.product_reviews?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="releases" className="data-[state=active]:bg-[#3a3a3a]">
              <FileText className="w-4 h-4 mr-1" />
              リリース
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-[#3a3a3a]">
              FAQ
            </TabsTrigger>
            <TabsTrigger value="milestones" className="data-[state=active]:bg-[#3a3a3a]">
              <Milestone className="w-4 h-4 mr-1" />
              マイルストーン
            </TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
              <CardHeader>
                <CardTitle className="text-[#e0e0e0]">プロダクト詳細</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{product.description || '詳細な説明がありません。'}</ReactMarkdown>
                </div>
                
                {product.tech_stack && product.tech_stack.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 text-[#e0e0e0]">使用技術</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tech_stack.map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="bg-[#3a3a3a] text-[#e0e0e0]">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3 text-[#e0e0e0]">タグ</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="border-[#4a4a4a] text-[#a0a0a0]">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 元企画書情報 */}
            {product.proposals && (
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0]">元企画書情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#a0a0a0]">
                    この製品は「{product.proposals.service_name}」という企画書から開発されました。
                  </p>
                  {product.proposals.users && (
                    <p className="text-sm text-[#808080] mt-2">
                      企画者: {product.proposals.users.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 口コミタブ */}
          <TabsContent value="reviews" className="space-y-4">
            {product.product_reviews && product.product_reviews.length > 0 ? (
              product.product_reviews.map((review: any) => (
                <Card key={review.id} className="bg-[#2a2a2a] border-[#3a3a3a]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#e0e0e0]">{review.user_name}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-[#4a4a4a]'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-[#808080]">
                        {new Date(review.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <p className="text-[#a0a0a0]">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-[#4a4a4a] mx-auto mb-4" />
                  <p className="text-[#808080]">まだ口コミがありません。</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* リリースタブ */}
          <TabsContent value="releases" className="space-y-4">
            {product.product_releases && product.product_releases.length > 0 ? (
              product.product_releases
                .sort((a: any, b: any) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime())
                .map((release: any) => (
                  <Card key={release.id} className="bg-[#2a2a2a] border-[#3a3a3a]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-[#e0e0e0]">
                          {release.title} ({release.version})
                        </CardTitle>
                        <div className="flex items-center text-sm text-[#808080]">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(release.released_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{release.description}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-[#4a4a4a] mx-auto mb-4" />
                  <p className="text-[#808080]">リリース情報がありません。</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FAQタブ */}
          <TabsContent value="faq" className="space-y-4">
            {product.product_faqs && product.product_faqs.length > 0 ? (
              product.product_faqs.map((faq: any) => (
                <Card key={faq.id} className="bg-[#2a2a2a] border-[#3a3a3a]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#e0e0e0]">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{faq.answer}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-[#4a4a4a] mx-auto mb-4" />
                  <p className="text-[#808080]">FAQがありません。</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* マイルストーンタブ */}
          <TabsContent value="milestones" className="space-y-4">
            {product.product_milestones && product.product_milestones.length > 0 ? (
              product.product_milestones
                .sort((a: any, b: any) => {
                  // 完了したものを下に、未完了を上に
                  if (a.status === 'completed' && b.status !== 'completed') return 1
                  if (a.status !== 'completed' && b.status === 'completed') return -1
                  return new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime()
                })
                .map((milestone: any) => (
                  <Card key={milestone.id} className="bg-[#2a2a2a] border-[#3a3a3a]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            milestone.status === 'completed' ? 'bg-green-400' : 
                            milestone.status === 'in_progress' ? 'bg-yellow-400' : 'bg-[#4a4a4a]'
                          }`} />
                          <h3 className="font-semibold text-[#e0e0e0]">{milestone.title}</h3>
                        </div>
                        {milestone.completed_at && (
                          <span className="text-xs text-[#808080]">
                            {new Date(milestone.completed_at).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>
                      <p className="text-[#a0a0a0] ml-6">{milestone.description}</p>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-8 text-center">
                  <Milestone className="w-12 h-12 text-[#4a4a4a] mx-auto mb-4" />
                  <p className="text-[#808080]">マイルストーンがありません。</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}