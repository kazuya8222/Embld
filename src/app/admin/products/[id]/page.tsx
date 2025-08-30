'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  DollarSign,
  BarChart3,
  Plus,
  FileText,
  Milestone,
  Save,
  Eye,
  Users,
  TrendingUp,
  Star,
  MessageSquare,
  CheckCircle,
  Circle,
  Calendar,
  Edit,
  Trash2,
  Upload,
  X,
  Monitor
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminProductDetailPage() {
  const params = useParams()
  const { user, userProfile, loading } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [developmentRequests, setDevelopmentRequests] = useState<any[]>([])
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaving, setIsSaving] = useState(false)

  // Analytics editing states
  const [editingAnalytics, setEditingAnalytics] = useState(false)
  const [analyticsForm, setAnalyticsForm] = useState({
    total_views: 0,
    unique_users: 0,
    engagement_rate: 0,
    average_rating: 0,
    download_count: 0,
    monthly_active_users: 0,
    retention_rate_7d: 0,
    avg_session_minutes: 0
  })

  // Release management states
  const [showNewReleaseForm, setShowNewReleaseForm] = useState(false)
  const [editingRelease, setEditingRelease] = useState<string | null>(null)
  const [newReleaseForm, setNewReleaseForm] = useState({
    version: '',
    title: '',
    description: '',
    changelog: '',
    is_major: false
  })
  const [editReleaseForm, setEditReleaseForm] = useState({
    version: '',
    title: '',
    description: '',
    changelog: '',
    is_major: false
  })

  // Milestone management states
  const [showNewMilestoneForm, setShowNewMilestoneForm] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null)
  const [editingProgress, setEditingProgress] = useState<{ [key: string]: number }>({})
  const [newMilestoneForm, setNewMilestoneForm] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    progress_percentage: 0
  })
  const [editMilestoneForm, setEditMilestoneForm] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    progress_percentage: 0
  })

  // Product editing states
  const [editingProduct, setEditingProduct] = useState(false)
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    overview: '',
    status: 'development',
    web_url: '',
    app_store_url: '',
    google_play_url: '',
    github_url: '',
    documentation_url: '',
    pricing_model: 'free',
    base_price: 0,
    featured_image: '',
    video_url: '',
    tech_stack: [] as string[],
    target_audience: '',
    key_features: [] as string[],
    is_public: false
  })
  const [dragActive, setDragActive] = useState(false)

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
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('product_analytics')
        .select('*')
        .eq('product_id', params.id)
        .single()

      console.log('Analytics data fetch result:', { analyticsData, analyticsError })
      console.log('Product ID:', params.id)
      console.log('User info:', user)

      // 分析データが存在しない場合は作成
      let finalAnalyticsData = analyticsData
      if (!analyticsData) {
        console.log('Creating new analytics data for product:', params.id)
        const { data: newAnalyticsData, error: createError } = await supabase
          .from('product_analytics')
          .insert({
            product_id: params.id,
            total_views: 0,
            unique_users: 0,
            engagement_rate: 0,
            average_rating: 0,
            download_count: 0,
            monthly_active_users: 0,
            retention_rate_7d: 0,
            avg_session_minutes: 0
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating analytics data:', createError)
        } else {
          finalAnalyticsData = newAnalyticsData
          console.log('Created new analytics data:', finalAnalyticsData)
        }
      }

      setProduct(product)
      setRevenueData(revenueData || [])
      setAnalyticsData(finalAnalyticsData)
      
      // Analytics form を初期化
      if (finalAnalyticsData) {
        setAnalyticsForm({
          total_views: finalAnalyticsData.total_views || 0,
          unique_users: finalAnalyticsData.unique_users || 0,
          engagement_rate: finalAnalyticsData.engagement_rate || 0,
          average_rating: finalAnalyticsData.average_rating || 0,
          download_count: finalAnalyticsData.download_count || 0,
          monthly_active_users: finalAnalyticsData.monthly_active_users || 0,
          retention_rate_7d: finalAnalyticsData.retention_rate_7d || 0,
          avg_session_minutes: finalAnalyticsData.avg_session_minutes || 0
        })
      }

      // Product form を初期化
      setProductForm({
        title: product.title || '',
        description: product.description || '',
        overview: product.overview || '',
        status: product.status || 'development',
        web_url: product.web_url || '',
        app_store_url: product.app_store_url || '',
        google_play_url: product.google_play_url || '',
        github_url: product.github_url || '',
        documentation_url: product.documentation_url || '',
        pricing_model: product.pricing_model || 'free',
        base_price: product.base_price || 0,
        featured_image: product.featured_image || '',
        video_url: product.video_url || '',
        tech_stack: product.tech_stack || [],
        target_audience: product.target_audience || '',
        key_features: product.key_features || [],
        is_public: product.is_public || false
      })
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
        .select(`
          *,
          users (
            email
          )
        `)
        .eq('product_id', params.id)
        .order('created_at', { ascending: false })

      if (!error) {
        setDevelopmentRequests(requests || [])
      }
    } catch (error) {
      console.error('Error fetching development requests:', error)
    }
  }

  const updateAnalytics = async () => {
    if (!analyticsData) {
      console.log('No analytics data found for update')
      alert('分析データが読み込まれていません')
      return
    }

    console.log('Updating analytics data:', analyticsForm)
    console.log('Analytics data ID:', analyticsData.id)
    console.log('Current user:', user)

    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from('product_analytics')
        .update(analyticsForm)
        .eq('id', analyticsData.id)
        .select()

      console.log('Update result:', { data, error })

      if (!error) {
        setAnalyticsData({ ...analyticsData, ...analyticsForm })
        setEditingAnalytics(false)
        alert('分析データを更新しました')
      } else {
        console.error('Update error:', error)
        alert(`更新に失敗しました: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating analytics:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('development_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (!error) {
        await fetchDevelopmentRequests()
        alert('ステータスを更新しました')
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating request status:', error)
      alert('エラーが発生しました')
    }
  }

  const createRelease = async () => {
    if (!newReleaseForm.version || !newReleaseForm.title) {
      alert('バージョンとタイトルは必須です')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('product_releases')
        .insert({
          product_id: params.id,
          version: newReleaseForm.version,
          title: newReleaseForm.title,
          description: newReleaseForm.description,
          changelog: newReleaseForm.changelog,
          is_major: newReleaseForm.is_major,
          release_date: new Date().toISOString()
        })

      if (!error) {
        await fetchProduct()
        setShowNewReleaseForm(false)
        setNewReleaseForm({
          version: '',
          title: '',
          description: '',
          changelog: '',
          is_major: false
        })
        alert('リリースを作成しました')
      } else {
        alert('作成に失敗しました')
      }
    } catch (error) {
      console.error('Error creating release:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const startEditRelease = (release: any) => {
    setEditReleaseForm({
      version: release.version,
      title: release.title,
      description: release.description || '',
      changelog: release.changelog || '',
      is_major: release.is_major
    })
    setEditingRelease(release.id)
  }

  const updateRelease = async (releaseId: string) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('product_releases')
        .update({
          version: editReleaseForm.version,
          title: editReleaseForm.title,
          description: editReleaseForm.description,
          changelog: editReleaseForm.changelog,
          is_major: editReleaseForm.is_major
        })
        .eq('id', releaseId)

      if (!error) {
        await fetchProduct()
        setEditingRelease(null)
        alert('リリース情報を更新しました')
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating release:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteRelease = async (releaseId: string) => {
    if (!confirm('このリリースを削除しますか？')) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('product_releases')
        .delete()
        .eq('id', releaseId)

      if (!error) {
        await fetchProduct()
        alert('リリースを削除しました')
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('Error deleting release:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const createMilestone = async () => {
    if (!newMilestoneForm.title) {
      alert('タイトルは必須です')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('product_milestones')
        .insert({
          product_id: params.id,
          title: newMilestoneForm.title,
          description: newMilestoneForm.description,
          due_date: newMilestoneForm.due_date || null,
          status: newMilestoneForm.status,
          progress_percentage: newMilestoneForm.progress_percentage
        })

      if (!error) {
        await fetchProduct()
        setShowNewMilestoneForm(false)
        setNewMilestoneForm({
          title: '',
          description: '',
          due_date: '',
          status: 'pending',
          progress_percentage: 0
        })
        alert('マイルストーンを作成しました')
      } else {
        alert('作成に失敗しました')
      }
    } catch (error) {
      console.error('Error creating milestone:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const updateMilestoneProgress = async (milestoneId: string, progress: number, status: string) => {
    try {
      const updateData: any = {
        progress_percentage: progress,
        status: status
      }

      if (status === 'completed' && progress === 100) {
        updateData.completed_date = new Date().toISOString()
      }

      const { error } = await supabase
        .from('product_milestones')
        .update(updateData)
        .eq('id', milestoneId)

      if (!error) {
        await fetchProduct()
        alert('マイルストーンを更新しました')
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating milestone:', error)
      alert('エラーが発生しました')
    }
  }

  const startEditMilestone = (milestone: any) => {
    setEditMilestoneForm({
      title: milestone.title,
      description: milestone.description || '',
      due_date: milestone.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : '',
      status: milestone.status,
      progress_percentage: milestone.progress_percentage
    })
    setEditingMilestone(milestone.id)
  }

  const updateMilestone = async (milestoneId: string) => {
    if (!editMilestoneForm.title) {
      alert('タイトルは必須です')
      return
    }

    setIsSaving(true)
    try {
      const updateData: any = {
        title: editMilestoneForm.title,
        description: editMilestoneForm.description,
        status: editMilestoneForm.status,
        progress_percentage: editMilestoneForm.progress_percentage
      }

      if (editMilestoneForm.due_date) {
        updateData.due_date = new Date(editMilestoneForm.due_date).toISOString()
      }

      if (editMilestoneForm.status === 'completed' && editMilestoneForm.progress_percentage === 100) {
        updateData.completed_date = new Date().toISOString()
      }

      const { error } = await supabase
        .from('product_milestones')
        .update(updateData)
        .eq('id', milestoneId)

      if (!error) {
        await fetchProduct()
        setEditingMilestone(null)
        alert('マイルストーンを更新しました')
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating milestone text:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteMilestone = async (milestoneId: string) => {
    if (!confirm('このマイルストーンを削除しますか？')) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('product_milestones')
        .delete()
        .eq('id', milestoneId)

      if (!error) {
        await fetchProduct()
        alert('マイルストーンを削除しました')
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('Error deleting milestone:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const updateProduct = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('products')
        .update(productForm)
        .eq('id', params.id)

      if (!error) {
        await fetchProduct()
        setEditingProduct(false)
        alert('プロダクト情報を更新しました')
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('video/')) {
        // Handle video file upload
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setProductForm(prev => ({ ...prev, video_url: result }))
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('image/')) {
        // Handle image file upload
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setProductForm(prev => ({ ...prev, featured_image: result }))
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const addTechStack = () => {
    setProductForm(prev => ({
      ...prev,
      tech_stack: [...prev.tech_stack, '']
    }))
  }

  const updateTechStack = (index: number, value: string) => {
    setProductForm(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.map((tech, i) => i === index ? value : tech)
    }))
  }

  const removeTechStack = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((_, i) => i !== index)
    }))
  }

  const addKeyFeature = () => {
    setProductForm(prev => ({
      ...prev,
      key_features: [...prev.key_features, '']
    }))
  }

  const updateKeyFeature = (index: number, value: string) => {
    setProductForm(prev => ({
      ...prev,
      key_features: prev.key_features.map((feature, i) => i === index ? value : feature)
    }))
  }

  const removeKeyFeature = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      key_features: prev.key_features.filter((_, i) => i !== index)
    }))
  }

  // Loading and auth checks
  if (loading || loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900">Loading...</div>
      </div>
    )
  }

  if (!userProfile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセス権限がありません</h1>
          <Link href="/admin">
            <Button>管理画面に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">プロダクトが見つかりません</h1>
          <Link href="/admin/products">
            <Button>プロダクト一覧に戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="text-gray-600">プロダクト管理</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              className={
                product.status === 'launched' ? 'bg-green-100 text-green-800' :
                product.status === 'development' ? 'bg-blue-100 text-blue-800' :
                product.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }
            >
              {product.status === 'launched' ? 'リリース済み' :
               product.status === 'development' ? '開発中' :
               product.status === 'testing' ? 'テスト中' :
               product.status}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-gray-700">
              概要
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-gray-700">
              <DollarSign className="w-4 h-4 mr-1" />
              収益
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-gray-700">
              <BarChart3 className="w-4 h-4 mr-1" />
              分析
            </TabsTrigger>
            <TabsTrigger value="development" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-gray-700">
              <Plus className="w-4 h-4 mr-1" />
              開発依頼
            </TabsTrigger>
            <TabsTrigger value="releases" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-gray-700">
              <FileText className="w-4 h-4 mr-1" />
              リリース
            </TabsTrigger>
            <TabsTrigger value="milestones" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-gray-700">
              <Milestone className="w-4 h-4 mr-1" />
              マイルストーン
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">プロダクト情報</CardTitle>
                {!editingProduct ? (
                  <Button 
                    onClick={() => setEditingProduct(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    編集
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={updateProduct}
                      disabled={isSaving}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? '保存中...' : '保存'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditingProduct(false)
                        // Reset form to original values
                        setProductForm({
                          title: product.title || '',
                          description: product.description || '',
                          overview: product.overview || '',
                          status: product.status || 'development',
                          web_url: product.web_url || '',
                          app_store_url: product.app_store_url || '',
                          google_play_url: product.google_play_url || '',
                          github_url: product.github_url || '',
                          documentation_url: product.documentation_url || '',
                          pricing_model: product.pricing_model || 'free',
                          base_price: product.base_price || 0,
                          featured_image: product.featured_image || '',
                          video_url: product.video_url || '',
                          tech_stack: product.tech_stack || [],
                          target_audience: product.target_audience || '',
                          key_features: product.key_features || [],
                          is_public: product.is_public || false
                        })
                      }}
                      size="sm"
                    >
                      キャンセル
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">基本情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">タイトル</label>
                      <Input 
                        value={productForm.title} 
                        onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900" 
                        disabled={!editingProduct}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">ステータス</label>
                      <Select 
                        value={productForm.status} 
                        onValueChange={(value) => setProductForm(prev => ({ ...prev, status: value }))}
                        disabled={!editingProduct}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">開発中</SelectItem>
                          <SelectItem value="testing">テスト中</SelectItem>
                          <SelectItem value="launched">リリース済み</SelectItem>
                          <SelectItem value="discontinued">終了</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">説明</label>
                    <Textarea 
                      value={productForm.description} 
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 min-h-[120px]" 
                      disabled={!editingProduct}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">概要</label>
                    <Textarea 
                      value={productForm.overview} 
                      onChange={(e) => setProductForm(prev => ({ ...prev, overview: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 min-h-[120px]" 
                      disabled={!editingProduct}
                      placeholder="プロダクトの詳細な概要を入力してください"
                    />
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">メディア</h3>
                  
                  {/* Video Upload */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">デモ動画</label>
                    {editingProduct ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {productForm.video_url ? (
                          <div className="space-y-2">
                            <video 
                              src={productForm.video_url} 
                              controls 
                              className="w-full max-w-md mx-auto rounded-lg"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setProductForm(prev => ({ ...prev, video_url: '' }))}
                            >
                              動画を削除
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div className="text-sm text-gray-600">
                              <p>動画ファイルをドラッグ&ドロップまたは</p>
                              <Input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                id="video-upload"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = (e) => {
                                      const result = e.target?.result as string
                                      setProductForm(prev => ({ ...prev, video_url: result }))
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                              <label htmlFor="video-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                ファイルを選択
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      productForm.video_url ? (
                        <video 
                          src={productForm.video_url} 
                          controls 
                          className="w-full max-w-md rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-8 border border-gray-200 rounded-lg">
                          <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">動画が設定されていません</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">メイン画像</label>
                    {editingProduct ? (
                      <div>
                        <Input
                          type="url"
                          value={productForm.featured_image}
                          onChange={(e) => setProductForm(prev => ({ ...prev, featured_image: e.target.value }))}
                          placeholder="画像URL"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        {productForm.featured_image && (
                          <img 
                            src={productForm.featured_image} 
                            alt="Featured" 
                            className="w-32 h-20 object-cover rounded-lg mt-2"
                          />
                        )}
                      </div>
                    ) : (
                      productForm.featured_image ? (
                        <img 
                          src={productForm.featured_image} 
                          alt="Featured" 
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center py-4 border border-gray-200 rounded-lg">
                          <p className="text-gray-600 text-sm">画像が設定されていません</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* URLs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">URL情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">WebサイトURL</label>
                      <Input 
                        type="url"
                        value={productForm.web_url} 
                        onChange={(e) => setProductForm(prev => ({ ...prev, web_url: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900" 
                        disabled={!editingProduct}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">GitHubURL</label>
                      <Input 
                        type="url"
                        value={productForm.github_url} 
                        onChange={(e) => setProductForm(prev => ({ ...prev, github_url: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900" 
                        disabled={!editingProduct}
                        placeholder="https://github.com/user/repo"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">App Store URL</label>
                      <Input 
                        type="url"
                        value={productForm.app_store_url} 
                        onChange={(e) => setProductForm(prev => ({ ...prev, app_store_url: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900" 
                        disabled={!editingProduct}
                        placeholder="https://apps.apple.com/..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Google Play URL</label>
                      <Input 
                        type="url"
                        value={productForm.google_play_url} 
                        onChange={(e) => setProductForm(prev => ({ ...prev, google_play_url: e.target.value }))}
                        className="bg-white border-gray-300 text-gray-900" 
                        disabled={!editingProduct}
                        placeholder="https://play.google.com/store/apps/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">価格設定</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">価格モデル</label>
                      <Select 
                        value={productForm.pricing_model} 
                        onValueChange={(value) => setProductForm(prev => ({ ...prev, pricing_model: value }))}
                        disabled={!editingProduct}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">無料</SelectItem>
                          <SelectItem value="freemium">フリーミアム</SelectItem>
                          <SelectItem value="subscription">サブスクリプション</SelectItem>
                          <SelectItem value="one_time">買い切り</SelectItem>
                          <SelectItem value="custom">カスタム</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">基本価格 (円)</label>
                      <Input 
                        type="text"
                        inputMode="numeric"
                        value={productForm.base_price} 
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          setProductForm(prev => ({ ...prev, base_price: parseInt(value) || 0 }))
                        }}
                        className="bg-white border-gray-300 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        disabled={!editingProduct}
                      />
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">技術スタック</h3>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTechStack}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        追加
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {productForm.tech_stack.map((tech, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={tech}
                          onChange={(e) => updateTechStack(index, e.target.value)}
                          placeholder="技術名 (例: React, Node.js)"
                          className="bg-white border-gray-300 text-gray-900"
                          disabled={!editingProduct}
                        />
                        {editingProduct && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTechStack(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {productForm.tech_stack.length === 0 && (
                      <p className="text-gray-500 text-sm">技術スタックが設定されていません</p>
                    )}
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">主要機能</h3>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addKeyFeature}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        追加
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {productForm.key_features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateKeyFeature(index, e.target.value)}
                          placeholder="機能説明"
                          className="bg-white border-gray-300 text-gray-900"
                          disabled={!editingProduct}
                        />
                        {editingProduct && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeKeyFeature(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {productForm.key_features.length === 0 && (
                      <p className="text-gray-500 text-sm">主要機能が設定されていません</p>
                    )}
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">その他の設定</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">ターゲット層</label>
                    <Textarea 
                      value={productForm.target_audience} 
                      onChange={(e) => setProductForm(prev => ({ ...prev, target_audience: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900" 
                      disabled={!editingProduct}
                      placeholder="想定するターゲットユーザーを記述してください"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={productForm.is_public}
                      onChange={(e) => setProductForm(prev => ({ ...prev, is_public: e.target.checked }))}
                      disabled={!editingProduct}
                      className="rounded"
                    />
                    <label htmlFor="is_public" className="text-sm text-gray-700">
                      公開設定 (チェックすると一般ユーザーに表示されます)
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab - Placeholder */}
          <TabsContent value="revenue" className="space-y-6 mt-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">収益ダッシュボード</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">収益データの管理機能は準備中です</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">プロダクト分析データ</CardTitle>
                {!editingAnalytics ? (
                  <Button 
                    onClick={() => setEditingAnalytics(true)}
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    編集
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={updateAnalytics}
                      disabled={isSaving}
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? '保存中...' : '保存'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditingAnalytics(false)
                        if (analyticsData) {
                          setAnalyticsForm({
                            total_views: analyticsData.total_views || 0,
                            unique_users: analyticsData.unique_users || 0,
                            engagement_rate: analyticsData.engagement_rate || 0,
                            average_rating: analyticsData.average_rating || 0,
                            download_count: analyticsData.download_count || 0,
                            monthly_active_users: analyticsData.monthly_active_users || 0,
                            retention_rate_7d: analyticsData.retention_rate_7d || 0,
                            avg_session_minutes: analyticsData.avg_session_minutes || 0
                          })
                        }
                      }}
                      size="sm"
                    >
                      キャンセル
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'total_views', label: '総ビュー数', icon: Eye },
                    { key: 'unique_users', label: 'ユニークユーザー', icon: Users },
                    { key: 'download_count', label: 'ダウンロード数', icon: TrendingUp },
                    { key: 'monthly_active_users', label: '月間アクティブユーザー', icon: Users },
                  ].map((field) => (
                    <Card key={field.key} className="bg-gray-50 border-gray-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <field.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">{field.label}</span>
                        </div>
                        {editingAnalytics ? (
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={analyticsForm[field.key as keyof typeof analyticsForm]}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '')
                              setAnalyticsForm({
                                ...analyticsForm,
                                [field.key]: parseInt(value) || 0
                              })
                            }}
                            className="bg-white border border-gray-200 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        ) : (
                          <div className="text-xl font-bold text-gray-900">
                            {analyticsData?.[field.key]?.toLocaleString() || '0'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {[
                    { key: 'engagement_rate', label: 'エンゲージメント率 (%)', icon: BarChart3 },
                    { key: 'average_rating', label: '平均評価', icon: Star },
                    { key: 'retention_rate_7d', label: '7日リテンション率 (%)', icon: TrendingUp },
                    { key: 'avg_session_minutes', label: '平均セッション時間 (分)', icon: BarChart3 },
                  ].map((field) => (
                    <Card key={field.key} className="bg-gray-50 border-gray-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <field.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">{field.label}</span>
                        </div>
                        {editingAnalytics ? (
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={analyticsForm[field.key as keyof typeof analyticsForm]}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '')
                              setAnalyticsForm({
                                ...analyticsForm,
                                [field.key]: parseFloat(value) || 0
                              })
                            }}
                            className="bg-white border border-gray-200 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        ) : (
                          <div className="text-xl font-bold text-gray-900">
                            {analyticsData?.[field.key] || '0'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Development Requests Tab */}
          <TabsContent value="development" className="space-y-6 mt-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">追加開発依頼一覧</CardTitle>
              </CardHeader>
              <CardContent>
                {developmentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">開発依頼はありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {developmentRequests.map((request) => (
                      <Card key={request.id} className="bg-gray-50 border-gray-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {request.title}
                              </h4>
                              <p className="text-sm text-gray-500 mb-3">
                                依頼者: {request.users?.email} | {new Date(request.created_at).toLocaleDateString('ja-JP')}
                              </p>
                            </div>
                            <Select
                              value={request.status}
                              onValueChange={(value) => updateRequestStatus(request.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-white border border-gray-200 text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">検討中</SelectItem>
                                <SelectItem value="approved">承認済み</SelectItem>
                                <SelectItem value="rejected">却下</SelectItem>
                                <SelectItem value="in_progress">実装中</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {request.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Releases Tab */}
          <TabsContent value="releases" className="space-y-6 mt-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">リリース管理</CardTitle>
                <Button
                  onClick={() => setShowNewReleaseForm(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規リリース
                </Button>
              </CardHeader>
              <CardContent>
                {showNewReleaseForm && (
                  <Card className="bg-gray-50 border-gray-300 mb-6">
                    <CardHeader>
                      <CardTitle className="text-gray-900">新規リリース作成</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">バージョン</label>
                          <Input
                            placeholder="v1.0.0"
                            value={newReleaseForm.version}
                            onChange={(e) => setNewReleaseForm({
                              ...newReleaseForm,
                              version: e.target.value
                            })}
                            className="bg-white border border-gray-200 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">タイトル</label>
                          <Input
                            placeholder="新機能追加"
                            value={newReleaseForm.title}
                            onChange={(e) => setNewReleaseForm({
                              ...newReleaseForm,
                              title: e.target.value
                            })}
                            className="bg-white border border-gray-200 text-gray-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">説明</label>
                        <Textarea
                          placeholder="リリースの概要説明"
                          value={newReleaseForm.description}
                          onChange={(e) => setNewReleaseForm({
                            ...newReleaseForm,
                            description: e.target.value
                          })}
                          className="bg-white border border-gray-200 text-gray-900"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">変更履歴</label>
                        <Textarea
                          placeholder="- 新機能: XXXを追加&#10;- 修正: YYYのバグを修正&#10;- 改善: ZZZのパフォーマンスを向上"
                          value={newReleaseForm.changelog}
                          onChange={(e) => setNewReleaseForm({
                            ...newReleaseForm,
                            changelog: e.target.value
                          })}
                          className="bg-white border border-gray-200 text-gray-900"
                          rows={5}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_major"
                          checked={newReleaseForm.is_major}
                          onChange={(e) => setNewReleaseForm({
                            ...newReleaseForm,
                            is_major: e.target.checked
                          })}
                          className="rounded"
                        />
                        <label htmlFor="is_major" className="text-sm text-gray-600">メジャーリリース</label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={createRelease}
                          disabled={isSaving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? '作成中...' : 'リリース作成'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowNewReleaseForm(false)
                            setNewReleaseForm({
                              version: '',
                              title: '',
                              description: '',
                              changelog: '',
                              is_major: false
                            })
                          }}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Releases List */}
                {product?.product_releases && product.product_releases.length > 0 ? (
                  <div className="space-y-4">
                    {product.product_releases
                      .sort((a: any, b: any) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
                      .map((release: any) => (
                      <Card key={release.id} className="bg-gray-50 border-gray-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{release.version}</h3>
                                  {release.is_major && (
                                    <Badge className="bg-orange-500/20 text-orange-400">メジャー</Badge>
                                  )}
                                </div>
                                <h4 className="text-gray-900 mb-1">{release.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(release.release_date).toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditRelease(release)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteRelease(release.id)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {editingRelease === release.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">バージョン</label>
                                  <Input
                                    value={editReleaseForm.version}
                                    onChange={(e) => setEditReleaseForm(prev => ({ ...prev, version: e.target.value }))}
                                    className="bg-white border-gray-300 text-gray-900"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">タイトル</label>
                                  <Input
                                    value={editReleaseForm.title}
                                    onChange={(e) => setEditReleaseForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="bg-white border-gray-300 text-gray-900"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">説明</label>
                                <Textarea
                                  value={editReleaseForm.description}
                                  onChange={(e) => setEditReleaseForm(prev => ({ ...prev, description: e.target.value }))}
                                  className="bg-white border-gray-300 text-gray-900"
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">変更履歴</label>
                                <Textarea
                                  value={editReleaseForm.changelog}
                                  onChange={(e) => setEditReleaseForm(prev => ({ ...prev, changelog: e.target.value }))}
                                  className="bg-white border-gray-300 text-gray-900"
                                  rows={4}
                                />
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`major-${release.id}`}
                                  checked={editReleaseForm.is_major}
                                  onChange={(e) => setEditReleaseForm(prev => ({ ...prev, is_major: e.target.checked }))}
                                  className="mr-2"
                                />
                                <label htmlFor={`major-${release.id}`} className="text-sm text-gray-700">メジャーリリース</label>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updateRelease(release.id)}
                                  disabled={isSaving}
                                  size="sm"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {isSaving ? '保存中...' : '保存'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingRelease(null)}
                                  size="sm"
                                >
                                  キャンセル
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {release.description && (
                                <div className="mb-4">
                                  <p className="text-gray-800">{release.description}</p>
                                </div>
                              )}
                              
                              {release.changelog && (
                                <div className="bg-white rounded-lg p-4">
                                  <h5 className="text-sm font-medium text-gray-900 mb-2">変更履歴:</h5>
                                  <div className="text-sm text-gray-800 whitespace-pre-line">
                                    {release.changelog}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  !showNewReleaseForm && (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">リリース情報がありません</p>
                      <Button
                        onClick={() => setShowNewReleaseForm(true)}
                        variant="outline"
                      >
                        最初のリリースを作成
                      </Button>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6 mt-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">マイルストーン管理</CardTitle>
                <Button
                  onClick={() => setShowNewMilestoneForm(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規マイルストーン
                </Button>
              </CardHeader>
              <CardContent>
                {showNewMilestoneForm && (
                  <Card className="bg-gray-50 border-gray-300 mb-6">
                    <CardHeader>
                      <CardTitle className="text-gray-900">新規マイルストーン作成</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">タイトル</label>
                          <Input
                            placeholder="機能開発完了"
                            value={newMilestoneForm.title}
                            onChange={(e) => setNewMilestoneForm({
                              ...newMilestoneForm,
                              title: e.target.value
                            })}
                            className="bg-white border border-gray-200 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">期限</label>
                          <Input
                            type="date"
                            value={newMilestoneForm.due_date}
                            onChange={(e) => setNewMilestoneForm({
                              ...newMilestoneForm,
                              due_date: e.target.value
                            })}
                            className="bg-white border border-gray-200 text-gray-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">説明</label>
                        <Textarea
                          placeholder="マイルストーンの詳細説明"
                          value={newMilestoneForm.description}
                          onChange={(e) => setNewMilestoneForm({
                            ...newMilestoneForm,
                            description: e.target.value
                          })}
                          className="bg-white border border-gray-200 text-gray-900"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">ステータス</label>
                          <Select
                            value={newMilestoneForm.status}
                            onValueChange={(value) => setNewMilestoneForm({
                              ...newMilestoneForm,
                              status: value
                            })}
                          >
                            <SelectTrigger className="bg-white border border-gray-200 text-gray-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">未着手</SelectItem>
                              <SelectItem value="in_progress">進行中</SelectItem>
                              <SelectItem value="completed">完了</SelectItem>
                              <SelectItem value="cancelled">キャンセル</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 mb-2 block">進捗 (%)</label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={newMilestoneForm.progress_percentage}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '')
                              const numValue = parseInt(value) || 0
                              const clampedValue = Math.min(Math.max(numValue, 0), 100)
                              setNewMilestoneForm({
                                ...newMilestoneForm,
                                progress_percentage: clampedValue
                              })
                            }}
                            className="bg-white border border-gray-200 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={createMilestone}
                          disabled={isSaving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? '作成中...' : 'マイルストーン作成'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowNewMilestoneForm(false)
                            setNewMilestoneForm({
                              title: '',
                              description: '',
                              due_date: '',
                              status: 'pending',
                              progress_percentage: 0
                            })
                          }}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Milestones List */}
                {product?.product_milestones && product.product_milestones.length > 0 ? (
                  <div className="space-y-6">
                    <div className="relative">
                      {/* Vertical timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
                      
                      {product.product_milestones
                        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((milestone: any, index: number) => (
                        <div key={milestone.id} className="relative pl-10 pb-8">
                          {/* Timeline node */}
                          <div className={`absolute left-2 top-2 w-4 h-4 rounded-full border-2 ${
                            milestone.status === 'completed' ? 'bg-green-500 border-green-500' :
                            milestone.status === 'in_progress' ? 'bg-blue-500 border-blue-500' :
                            milestone.status === 'cancelled' ? 'bg-red-500 border-red-500' :
                            'bg-gray-50 border-[#5a5a5a]'
                          }`} />
                          
                          <Card className="bg-gray-50 border-gray-300">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  {editingMilestone === milestone.id ? (
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">タイトル</label>
                                        <Input
                                          value={editMilestoneForm.title}
                                          onChange={(e) => setEditMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                                          className="bg-white border-gray-300 text-gray-900"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">説明</label>
                                        <Textarea
                                          value={editMilestoneForm.description}
                                          onChange={(e) => setEditMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                                          className="bg-white border-gray-300 text-gray-900"
                                          rows={3}
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 mb-2 block">期限</label>
                                          <Input
                                            type="date"
                                            value={editMilestoneForm.due_date}
                                            onChange={(e) => setEditMilestoneForm(prev => ({ ...prev, due_date: e.target.value }))}
                                            className="bg-white border-gray-300 text-gray-900"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 mb-2 block">ステータス</label>
                                          <Select
                                            value={editMilestoneForm.status}
                                            onValueChange={(value) => setEditMilestoneForm(prev => ({ ...prev, status: value }))}
                                          >
                                            <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pending">未着手</SelectItem>
                                              <SelectItem value="in_progress">進行中</SelectItem>
                                              <SelectItem value="completed">完了</SelectItem>
                                              <SelectItem value="cancelled">キャンセル</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => updateMilestone(milestone.id)}
                                          disabled={isSaving}
                                          size="sm"
                                        >
                                          <Save className="w-4 h-4 mr-2" />
                                          {isSaving ? '保存中...' : '保存'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingMilestone(null)}
                                          size="sm"
                                        >
                                          キャンセル
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {milestone.title}
                                      </h3>
                                      {milestone.description && (
                                        <p className="text-gray-800 mb-3">{milestone.description}</p>
                                      )}
                                      <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {milestone.due_date ? 
                                            new Date(milestone.due_date).toLocaleDateString('ja-JP') : 
                                            '期限未設定'
                                          }
                                        </div>
                                        {milestone.completed_date && (
                                          <div>
                                            完了日: {new Date(milestone.completed_date).toLocaleDateString('ja-JP')}
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-start gap-2">
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
                                     '未着手'}
                                  </Badge>
                                  {editingMilestone !== milestone.id && (
                                    <div className="flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startEditMilestone(milestone)}
                                        className="text-gray-600 hover:text-gray-900 p-1 h-auto"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteMilestone(milestone.id)}
                                        className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 h-auto"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-gray-600">進捗</span>
                                  <span className="text-sm text-gray-900">{milestone.progress_percentage}%</span>
                                </div>
                                <div className="w-full bg-white rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      milestone.status === 'completed' ? 'bg-green-500' :
                                      milestone.status === 'in_progress' ? 'bg-blue-500' :
                                      milestone.status === 'cancelled' ? 'bg-red-500' :
                                      'bg-gray-500'
                                    }`}
                                    style={{ width: `${milestone.progress_percentage}%` }}
                                  />
                                </div>
                              </div>

                              {/* Progress controls */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={editingProgress[milestone.id] !== undefined ? editingProgress[milestone.id] : milestone.progress_percentage}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, '')
                                      const progress = parseInt(value) || 0
                                      const clampedProgress = Math.min(Math.max(progress, 0), 100)
                                      setEditingProgress(prev => ({ ...prev, [milestone.id]: clampedProgress }))
                                    }}
                                    onBlur={(e) => {
                                      const currentProgress = editingProgress[milestone.id] !== undefined ? editingProgress[milestone.id] : milestone.progress_percentage
                                      if (currentProgress !== milestone.progress_percentage) {
                                        let status = milestone.status
                                        if (currentProgress === 100 && status !== 'completed') {
                                          status = 'completed'
                                        } else if (currentProgress > 0 && currentProgress < 100 && status === 'pending') {
                                          status = 'in_progress'
                                        } else if (currentProgress === 0 && status === 'in_progress') {
                                          status = 'pending'
                                        }
                                        updateMilestoneProgress(milestone.id, currentProgress, status)
                                        setEditingProgress(prev => {
                                          const newState = { ...prev }
                                          delete newState[milestone.id]
                                          return newState
                                        })
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.currentTarget.blur()
                                      }
                                    }}
                                    className="w-20 bg-white border border-gray-200 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <span className="text-sm text-gray-600">%</span>
                                </div>
                                <Select
                                  value={milestone.status}
                                  onValueChange={(value) => updateMilestoneProgress(milestone.id, milestone.progress_percentage, value)}
                                >
                                  <SelectTrigger className="w-32 bg-white border border-gray-200 text-gray-900">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">未着手</SelectItem>
                                    <SelectItem value="in_progress">進行中</SelectItem>
                                    <SelectItem value="completed">完了</SelectItem>
                                    <SelectItem value="cancelled">キャンセル</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  !showNewMilestoneForm && (
                    <div className="text-center py-8">
                      <Milestone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">マイルストーンがありません</p>
                      <Button
                        onClick={() => setShowNewMilestoneForm(true)}
                        variant="outline"
                      >
                        最初のマイルストーンを作成
                      </Button>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}