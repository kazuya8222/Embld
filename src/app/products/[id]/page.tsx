'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ExternalLink, 
  Calendar, 
  Star,
  MessageSquare,
  FileText,
  DollarSign,
  ArrowLeft,
  Monitor,
  Tag,
  Plus,
  Send,
  User,
  Milestone,
  CheckCircle,
  Circle,
  BarChart3,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion, AnimatePresence } from 'motion/react'
import { TopBar } from '@/components/common/TopBar'
import { Sidebar } from '@/components/common/Sidebar'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { RevenueDashboard } from '@/components/dashboard/RevenueDashboard'

export default function ProductPage() {
  const params = useParams()
  const { user, loading } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [isSidebarLocked, setIsSidebarLocked] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [newRequestMessage, setNewRequestMessage] = useState('')
  const [developmentRequests, setDevelopmentRequests] = useState<any[]>([])
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [expandedReleaseId, setExpandedReleaseId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (params?.id) {
      fetchProduct()
      fetchDevelopmentRequests()
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
          ),
          product_releases (
            id,
            version,
            release_date,
            title,
            description,
            changelog,
            is_major,
            created_at
          ),
          product_milestones (
            id,
            title,
            description,
            due_date,
            completed_date,
            status,
            progress_percentage,
            created_at
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

      // 分析データを取得
      const { data: analyticsData } = await supabase
        .from('product_analytics')
        .select('*')
        .eq('product_id', params.id)
        .single()

      setProduct(product)
      setRevenueData(revenueData || [])
      setAnalyticsData(analyticsData)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoadingProduct(false)
    }
  }

  const fetchDevelopmentRequests = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('development_requests')
        .select('*')
        .eq('product_id', params.id)
        .order('created_at', { ascending: false })

      if (!error) {
        setDevelopmentRequests(requests || [])
      }
    } catch (error) {
      console.error('Error fetching development requests:', error)
    }
  }

  const handleSubmitRequest = async () => {
    if (!newRequestMessage.trim() || !user) return

    setIsSubmittingRequest(true)
    try {
      const response = await fetch('/api/development-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: params.id,
          title: `追加開発依頼 - ${new Date().toLocaleDateString('ja-JP')}`,
          description: newRequestMessage,
        }),
      })

      const data = await response.json()

      if (response.status === 402) {
        // Insufficient credits
        alert(`クレジットが不足しています。必要なクレジット: ${data.required}, 現在のクレジット: ${data.current}`)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      // Success
      setNewRequestMessage('')
      await fetchDevelopmentRequests()
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error submitting request:', error)
    } finally {
      setIsSubmittingRequest(false)
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


  const handleMenuToggle = () => {
    setIsSidebarLocked(!isSidebarLocked)
  }

  const handleMenuHover = (isHovering: boolean) => {
    setIsSidebarHovered(isHovering)
  }

  const shouldShowSidebar = isSidebarLocked || isSidebarHovered

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleReleaseDetails = (releaseId: string) => {
    setExpandedReleaseId(expandedReleaseId === releaseId ? null : releaseId)
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
        <div className="max-w-6xl mx-auto p-6 space-y-4 text-[#e0e0e0]">
        {/* ヘッダー部分 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-[#e0e0e0]">{product.title}</h1>
              <Badge 
                variant="secondary" 
                className={
                  product.status === 'launched' ? 'bg-green-500/20 text-green-400' :
                  product.status === 'development' ? 'bg-blue-500/20 text-blue-400' :
                  product.status === 'testing' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }
              >
                {product.status === 'launched' ? 'リリース済み' :
                 product.status === 'development' ? '開発中' :
                 product.status === 'testing' ? 'テスト中' :
                 product.status}
              </Badge>
            </div>
            <p className="text-[#a0a0a0] text-lg mb-6">{product.overview}</p>
            
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
          <TabsList className="grid w-full grid-cols-6 bg-[#2a2a2a] border-[#3a3a3a]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#3a3a3a]">
              概要
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-[#3a3a3a]">
              <DollarSign className="w-4 h-4 mr-1" />
              収益
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#3a3a3a]">
              <BarChart3 className="w-4 h-4 mr-1" />
              分析
            </TabsTrigger>
            <TabsTrigger value="development" className="data-[state=active]:bg-[#3a3a3a]">
              <Plus className="w-4 h-4 mr-1" />
              追加開発依頼
            </TabsTrigger>
            <TabsTrigger value="releases" className="data-[state=active]:bg-[#3a3a3a]">
              <FileText className="w-4 h-4 mr-1" />
              リリース情報
            </TabsTrigger>
            <TabsTrigger value="milestones" className="data-[state=active]:bg-[#3a3a3a]">
              <Milestone className="w-4 h-4 mr-1" />
              マイルストーン
            </TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-6">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Media and Description Section */}
              <div className="lg:col-span-2 space-y-8">
                {/* Media Section */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                  {/* Video or Main Image */}
                  <div className="aspect-video bg-gradient-to-br from-[#3a3a3a] to-[#2a2a2a] rounded-lg overflow-hidden mb-4">
                    {product.video_url ? (
                      product.video_url.includes('youtube.com') || product.video_url.includes('vimeo.com') ? (
                        <iframe
                          src={product.video_url}
                          title={`${product.title} - Demo Video`}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <div 
                          className="relative w-full h-full cursor-pointer group"
                          onClick={() => setIsVideoModalOpen(true)}
                        >
                          <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover"
                          >
                            <source src={product.video_url} type="video/mp4" />
                            <source src={product.video_url} type="video/webm" />
                            <source src={product.video_url} type="video/quicktime" />
                          </video>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-[#4a4a4a] rounded-full flex items-center justify-center">
                            <Monitor className="w-8 h-8 text-[#a0a0a0]" />
                          </div>
                          <p className="text-[#a0a0a0]">メディアがありません</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Section with Markdown Support */}
                <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                  <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">プロダクト説明</h3>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-[#e0e0e0] mt-6 mb-4">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold text-[#e0e0e0] mt-5 mb-3">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold text-[#e0e0e0] mt-4 mb-2">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-[#c0c0c0] mb-4 leading-relaxed">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-2 text-[#c0c0c0] mb-4">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-2 text-[#c0c0c0] mb-4">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-[#c0c0c0]">{children}</li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-[#3a3a3a] pl-4 italic text-[#a0a0a0] my-4">
                            {children}
                          </blockquote>
                        ),
                        a: ({ children, href }) => (
                          <a 
                            href={href} 
                            className="text-blue-400 hover:text-blue-300 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        img: ({ src, alt }) => (
                          <img 
                            src={src} 
                            alt={alt} 
                            className="rounded-lg max-w-full h-auto my-4 border border-[#3a3a3a]"
                          />
                        )
                      }}
                    >
                      {product.description || product.overview || 'プロダクトの説明がありません。'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4 flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      タグ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag: string, index: number) => (
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
                        variant="secondary"
                        className={
                          product.status === 'launched' ? 'bg-green-500/20 text-green-400' :
                          product.status === 'development' ? 'bg-blue-500/20 text-blue-400' :
                          product.status === 'testing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }
                      >
                        {product.status === 'launched' ? 'リリース済み' :
                         product.status === 'development' ? '開発中' :
                         product.status === 'testing' ? 'テスト中' :
                         product.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0a0a0]">公開状態</span>
                      <Badge 
                        variant="default"
                        className="bg-green-600 text-white"
                      >
                        公開
                      </Badge>
                    </div>
                    
                    {/* Demo URL */}
                    {product.demo_url && (
                      <div className="pt-3 border-t border-[#3a3a3a]">
                        <a
                          href={product.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full"
                        >
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            使ってみる
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tech Stack */}
                {product.tech_stack && product.tech_stack.length > 0 && (
                  <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">技術スタック</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tech_stack.map((tech: string, index: number) => (
                        <Badge 
                          key={index} 
                          className="bg-[#0066cc]/20 text-[#0066cc] border-[#0066cc]/30"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 元企画書情報 */}
                {product.proposals && (
                  <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#3a3a3a]">
                    <h3 className="text-lg font-semibold text-[#e0e0e0] mb-4">元企画書情報</h3>
                    <p className="text-[#a0a0a0] mb-4">
                      この製品は「{product.proposals.service_name}」という企画書から開発されました。
                    </p>
                    <Link href={`/proposals/${product.proposals.id || product.proposal_id}`}>
                      <Button className="w-full bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]">
                        企画書を見る
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 収益タブ */}
          <TabsContent value="revenue" className="space-y-6">
            {user && (product.proposals?.user_id === user.id) ? (
              <RevenueDashboard productId={product.id} />
            ) : (
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-8 text-center">
                  <DollarSign className="w-12 h-12 text-[#4a4a4a] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#e0e0e0] mb-2">
                    収益情報にアクセスできません
                  </h3>
                  <p className="text-[#a0a0a0]">
                    この機能は企画者のみが利用できます。
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 追加開発依頼タブ */}
          <TabsContent value="development" className="space-y-6">
            {user && (product.proposals?.user_id === user.id) ? (
              <>
                {/* 新規依頼フォーム */}
                <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                  <CardHeader>
                    <CardTitle className="text-[#e0e0e0] flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-blue-400" />
                      新しい開発依頼を作成
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[#e0e0e0] mb-2 block">
                          依頼内容
                        </label>
                        <Textarea
                          value={newRequestMessage}
                          onChange={(e) => setNewRequestMessage(e.target.value)}
                          placeholder="追加開発の詳細をご記入ください。機能の説明、要件、期待する結果などを具体的に書いてください。"
                          className="bg-[#1a1a1a] border-[#3a3a3a] text-[#e0e0e0] resize-none min-h-[120px]"
                          rows={5}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitRequest}
                          disabled={!newRequestMessage.trim() || isSubmittingRequest}
                          className="bg-[#0066cc] text-[#e0e0e0] hover:bg-[#0052a3]"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmittingRequest ? '送信中...' : '依頼を送信 (50クレジット)'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 既存の依頼一覧 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#e0e0e0]">開発依頼履歴</h3>
                  {developmentRequests.length > 0 ? (
                    developmentRequests.map((request) => (
                      <Card key={request.id} className="bg-[#2a2a2a] border-[#3a3a3a]">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-[#e0e0e0] mb-2">
                                {request.title}
                              </h4>
                              <p className="text-sm text-[#808080] mb-3">
                                {new Date(request.created_at).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <Badge 
                              className={
                                request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                request.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                request.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              }
                            >
                              {request.status === 'approved' ? '承認済み' :
                               request.status === 'rejected' ? '却下' :
                               request.status === 'pending' ? '検討中' :
                               request.status === 'in_progress' ? '実装中' :
                               request.status}
                            </Badge>
                          </div>
                          
                          <div className="bg-[#1a1a1a] rounded-lg p-4">
                            <p className="text-[#c0c0c0] whitespace-pre-wrap leading-relaxed">
                              {request.description}
                            </p>
                          </div>
                          
                          {/* ステータス詳細 */}
                          <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#a0a0a0]">ステータス</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  request.status === 'approved' ? 'bg-green-400' :
                                  request.status === 'rejected' ? 'bg-red-400' :
                                  request.status === 'pending' ? 'bg-yellow-400' :
                                  request.status === 'in_progress' ? 'bg-blue-400' :
                                  'bg-gray-400'
                                }`} />
                                <span className="text-sm text-[#e0e0e0]">
                                  {request.status === 'approved' ? '承認済み - 開発チームに引き継がれました' :
                                   request.status === 'rejected' ? '却下 - 実装が困難と判断されました' :
                                   request.status === 'pending' ? '検討中 - チームが内容を確認しています' :
                                   request.status === 'in_progress' ? '実装中 - 開発チームが作業を進めています' :
                                   request.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                      <CardContent className="p-8 text-center">
                        <Plus className="w-12 h-12 text-[#4a4a4a] mx-auto mb-4" />
                        <p className="text-[#808080]">まだ開発依頼がありません。</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-8 text-center">
                  <Plus className="w-12 h-12 text-[#4a4a4a] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#e0e0e0] mb-2">
                    追加開発依頼にアクセスできません
                  </h3>
                  <p className="text-[#a0a0a0]">
                    この機能は企画者のみが利用できます。
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 分析タブ */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#e0e0e0]">プロダクト分析</h2>
              
              {/* 基本統計 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                  <CardContent className="p-4 text-center">
                    <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-[#e0e0e0]">
                      {analyticsData?.total_views?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-[#808080]">総ビュー数</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-[#e0e0e0]">
                      {analyticsData?.unique_users?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-[#808080]">ユニークユーザー</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-[#e0e0e0]">
                      {analyticsData?.engagement_rate ? `${analyticsData.engagement_rate}%` : '0%'}
                    </div>
                    <div className="text-xs text-[#808080]">エンゲージメント率</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-[#e0e0e0]">
                      {analyticsData?.average_rating || '0.0'}
                    </div>
                    <div className="text-xs text-[#808080]">平均評価</div>
                  </CardContent>
                </Card>
              </div>

              {/* パフォーマンス指標 */}
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0] flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    パフォーマンス指標
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* ダウンロード数 */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0a0a0]">ダウンロード数</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-[#1a1a1a] rounded-full h-2">
                          <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${Math.min((analyticsData?.download_count || 0) / 5000 * 100, 100)}%` }} />
                        </div>
                        <span className="text-[#e0e0e0] text-sm w-12">
                          {analyticsData?.download_count?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    {/* アクティブユーザー */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0a0a0]">月間アクティブユーザー</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-[#1a1a1a] rounded-full h-2">
                          <div className="h-2 bg-green-500 rounded-full" style={{ width: `${Math.min((analyticsData?.monthly_active_users || 0) / 3000 * 100, 100)}%` }} />
                        </div>
                        <span className="text-[#e0e0e0] text-sm w-12">
                          {analyticsData?.monthly_active_users?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    {/* リテンション率 */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0a0a0]">7日リテンション率</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-[#1a1a1a] rounded-full h-2">
                          <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${analyticsData?.retention_rate_7d || 0}%` }} />
                        </div>
                        <span className="text-[#e0e0e0] text-sm w-12">
                          {analyticsData?.retention_rate_7d || 0}%
                        </span>
                      </div>
                    </div>

                    {/* セッション時間 */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#a0a0a0]">平均セッション時間</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-[#1a1a1a] rounded-full h-2">
                          <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${Math.min((analyticsData?.avg_session_minutes || 0) / 20 * 100, 100)}%` }} />
                        </div>
                        <span className="text-[#e0e0e0] text-sm w-12">
                          {analyticsData?.avg_session_minutes || 0}分
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ユーザーフィードバック */}
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0] flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    ユーザーフィードバック概要
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 評価分布 */}
                    <div>
                      <h4 className="text-[#e0e0e0] font-semibold mb-3">評価分布</h4>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const ratingCount = analyticsData?.[`rating_${rating}_count`] || 0;
                          const totalRatings = (analyticsData?.rating_5_count || 0) + 
                                             (analyticsData?.rating_4_count || 0) + 
                                             (analyticsData?.rating_3_count || 0) + 
                                             (analyticsData?.rating_2_count || 0) + 
                                             (analyticsData?.rating_1_count || 0);
                          const percentage = totalRatings > 0 ? Math.round((ratingCount / totalRatings) * 100) : 0;
                          
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-12">
                                <span className="text-sm text-[#a0a0a0]">{rating}</span>
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              </div>
                              <div className="flex-1 bg-[#1a1a1a] rounded-full h-2">
                                <div 
                                  className="h-2 bg-yellow-400 rounded-full" 
                                  style={{ width: `${percentage}%` }} 
                                />
                              </div>
                              <span className="text-sm text-[#a0a0a0] w-8">
                                {percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 人気機能 */}
                    <div>
                      <h4 className="text-[#e0e0e0] font-semibold mb-3">人気機能</h4>
                      <div className="space-y-3">
                        {analyticsData?.popular_features && Array.isArray(analyticsData.popular_features) ? 
                          analyticsData.popular_features.slice(0, 4).map((feature: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-[#a0a0a0] text-sm">{feature.name}</span>
                              <span className="text-[#e0e0e0] text-sm">{feature.satisfaction}/5.0</span>
                            </div>
                          )) : (
                            <div className="text-[#808080] text-sm">データがありません</div>
                          )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 改善提案 */}
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0] flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    改善提案
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData?.improvement_suggestions && Array.isArray(analyticsData.improvement_suggestions) ? 
                      analyticsData.improvement_suggestions.slice(0, 3).map((suggestion: any, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            suggestion.priority === '高' ? 'bg-red-400' :
                            suggestion.priority === '中' ? 'bg-yellow-400' : 'bg-green-400'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-[#e0e0e0] font-semibold">{suggestion.suggestion}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                suggestion.priority === '高' ? 'bg-red-500/20 text-red-400' :
                                suggestion.priority === '中' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                              }`}>
                                {suggestion.priority}
                              </span>
                            </div>
                            <p className="text-[#a0a0a0] text-sm">
                              {suggestion.frequency}件のフィードバック
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-[#808080] text-sm">データがありません</div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* リリースタブ */}
          <TabsContent value="releases" className="space-y-6">
            {product.product_releases && product.product_releases.length > 0 ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#e0e0e0]">リリース</h2>
                  <p className="text-[#a0a0a0]">新しいバージョンがリリースされた時に通知を受け取る</p>
                </div>

                {/* Releases List */}
                <div className="space-y-4">
                  {product.product_releases
                    .sort((a: any, b: any) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
                    .map((release: any, index: number) => (
                      <div key={release.id}>
                        {/* Release Header - Clickable */}
                        <button 
                          onClick={() => toggleReleaseDetails(release.id)}
                          className="w-full flex items-center justify-between py-4 border-b border-[#3a3a3a] hover:bg-[#2a2a2a]/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-bold">H</span>
                            </div>
                            <h3 className="text-lg font-semibold text-[#e0e0e0]">
                              {product.title} {release.version}
                            </h3>
                          </div>
                          <div className="flex items-center text-sm text-[#808080]">
                            <Calendar className="w-4 h-4 mr-1" />
                            Release date: {new Date(release.release_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </button>

                        {/* Release Content - Show when expanded */}
                        {expandedReleaseId === release.id && (
                          <div className="py-6 bg-[#2a2a2a]/30">
                            {/* Author info */}
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">E</span>
                              </div>
                              <span className="text-sm text-[#a0a0a0]">EMBLDチーム</span>
                              <span className="text-sm text-[#a0a0a0]">wrote:</span>
                            </div>

                            {/* Release description */}
                            <p className="text-[#c0c0c0] mb-6 leading-relaxed">
                              {release.description}
                            </p>

                            {/* Changelog */}
                            <div className="space-y-4">
                              {release.changelog && release.changelog.split('\n\n').map((section: string, idx: number) => (
                                <div key={idx}>
                                  {section.includes(':') ? (
                                    <div>
                                      <h4 className="font-semibold text-[#e0e0e0] mb-2">
                                        {section.split(':')[0]}:
                                      </h4>
                                      <p className="text-[#c0c0c0] leading-relaxed">
                                        {section.split(':').slice(1).join(':').trim()}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-[#c0c0c0] leading-relaxed">{section}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-[#4a4a4a] mx-auto mb-4" />
                  <p className="text-[#808080]">リリース情報がありません。</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* マイルストーンタブ */}
          <TabsContent value="milestones" className="space-y-6">
            {product.product_milestones && product.product_milestones.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#e0e0e0]">マイルストーン</h2>
                
                {/* Timeline Container */}
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#3a3a3a]" />
                  
                  {/* Milestones List */}
                  <div className="space-y-8">
                    {product.product_milestones
                      .sort((a: any, b: any) => new Date(a.due_date || a.created_at).getTime() - new Date(b.due_date || b.created_at).getTime())
                      .map((milestone: any, index: number) => (
                        <div key={milestone.id} className="relative flex items-start gap-6">
                          {/* Timeline Dot */}
                          <div className="relative z-10 flex-shrink-0">
                            {milestone.status === 'completed' ? (
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                            ) : milestone.status === 'in_progress' ? (
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-[#4a4a4a] rounded-full flex items-center justify-center">
                                <Circle className="w-6 h-6 text-[#a0a0a0]" />
                              </div>
                            )}
                          </div>

                          {/* Milestone Content */}
                          <div className="flex-1 pb-8">
                            <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-[#e0e0e0] mb-2">
                                      {milestone.title}
                                    </h3>
                                    {milestone.description && (
                                      <p className="text-[#a0a0a0] mb-3">
                                        {milestone.description}
                                      </p>
                                    )}
                                  </div>
                                  <Badge 
                                    className={
                                      milestone.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                      milestone.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                      milestone.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }
                                  >
                                    {milestone.status === 'completed' ? '完了' :
                                     milestone.status === 'in_progress' ? '進行中' :
                                     milestone.status === 'cancelled' ? 'キャンセル' :
                                     '予定'}
                                  </Badge>
                                </div>

                                {/* Progress Bar */}
                                {milestone.progress_percentage !== null && (
                                  <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm text-[#a0a0a0]">進捗</span>
                                      <span className="text-sm text-[#e0e0e0]">{milestone.progress_percentage}%</span>
                                    </div>
                                    <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          milestone.status === 'completed' ? 'bg-green-500' :
                                          milestone.status === 'in_progress' ? 'bg-blue-500' :
                                          'bg-gray-500'
                                        }`}
                                        style={{ width: `${milestone.progress_percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Dates */}
                                <div className="flex items-center gap-6 text-sm">
                                  {milestone.due_date && (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-[#a0a0a0]" />
                                      <span className="text-[#a0a0a0]">
                                        予定: {new Date(milestone.due_date).toLocaleDateString('ja-JP')}
                                      </span>
                                    </div>
                                  )}
                                  {milestone.completed_date && (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                      <span className="text-green-400">
                                        完了: {new Date(milestone.completed_date).toLocaleDateString('ja-JP')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-md mx-4 border border-[#3a3a3a]">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#e0e0e0] mb-2">
                追加開発依頼を送信しました
              </h3>
              <p className="text-[#a0a0a0] mb-6">
                開発チームが内容を確認します。
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="bg-[#0066cc] text-white hover:bg-[#0052a3]"
              >
                確認
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* フルスクリーン動画モーダル */}
      {isVideoModalOpen && product.video_url && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div 
            className="relative max-w-6xl w-full aspect-video bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {product.video_url.includes('youtube.com') || product.video_url.includes('vimeo.com') ? (
              <iframe
                src={product.video_url}
                title={`${product.title} - Demo Video`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                controls
                autoPlay
                className="w-full h-full"
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can play')}
              >
                <source src={product.video_url} type="video/mp4" />
                <source src={product.video_url} type="video/webm" />
                <source src={product.video_url} type="video/quicktime" />
                お使いのブラウザは動画再生に対応していません。
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  )
}