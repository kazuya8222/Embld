'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { directSupabase } from '@/lib/supabase/direct-client'
import { useAuth } from '@/components/auth/AuthProvider'
import { CATEGORIES, CoreFeature } from '@/types'
import { cn } from '@/lib/utils/cn'
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  AlertCircle,
  Users,
  Lightbulb,
  Zap,
  Clock,
  DollarSign,
  Palette,
  CheckCircle,
  Smartphone,
  TrendingUp,
  Plus
} from 'lucide-react'

interface IdeaFormProps {
  initialData?: any
  ideaId?: string
}

export function IdeaForm({ initialData, ideaId }: IdeaFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(0)
  
  // 既存データが企画書形式かどうか判定
  const hasProjectPlanData = initialData && (
    initialData.service_name || initialData.catch_copy || initialData.service_description ||
    initialData.background_problem || initialData.main_target || initialData.value_proposition ||
    initialData.core_features?.length > 0
  )
  
  const [formType, setFormType] = useState<'simple' | 'detailed'>(
    hasProjectPlanData ? 'detailed' : 'simple'
  )
  const [showTypeSelection, setShowTypeSelection] = useState(!initialData)
  
  const [formData, setFormData] = useState({
    // 基本項目（シンプル版）
    title: initialData?.title || '',
    problem: initialData?.problem || '',
    solution: initialData?.solution || '',
    target_users: initialData?.target_users || '',
    category: initialData?.category || '',
    tags: initialData?.tags || [] as string[],
    
    // 企画書項目（詳細版）
    service_name: initialData?.service_name || '',
    catch_copy: initialData?.catch_copy || '',
    service_description: initialData?.service_description || '',
    background_problem: initialData?.background_problem || '',
    current_solution_problems: initialData?.current_solution_problems || '',
    main_target: initialData?.main_target || '',
    usage_scene: initialData?.usage_scene || '',
    value_proposition: initialData?.value_proposition || '',
    differentiators: initialData?.differentiators || '',
    core_features: initialData?.core_features || [] as CoreFeature[],
    nice_to_have_features: initialData?.nice_to_have_features || '',
    initial_flow: initialData?.initial_flow || '',
    important_operations: initialData?.important_operations || '',
    monetization_method: initialData?.monetization_method || '',
    price_range: initialData?.price_range || '',
    free_paid_boundary: initialData?.free_paid_boundary || '',
    similar_services: initialData?.similar_services || '',
    design_atmosphere: initialData?.design_atmosphere || '',
    reference_urls: initialData?.reference_urls || '',
    expected_release: initialData?.expected_release || '',
    priority_points: initialData?.priority_points || '',
    device_type: initialData?.device_type || '',
    external_services: initialData?.external_services || '',
    one_month_goal: initialData?.one_month_goal || '',
    success_metrics: initialData?.success_metrics || '',
  })
  
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // コンポーネントの初期化とクリーンアップ
  useEffect(() => {
    // 状態を初期化
    setLoading(false)
    setError('')
    
    // クリーンアップ関数
    return () => {
      setLoading(false)
      setError('')
    }
  }, [initialData, ideaId])

  const steps = [
    { id: 'overview', title: 'サービス概要', icon: FileText },
    { id: 'background', title: '背景・課題', icon: AlertCircle },
    { id: 'target', title: 'ターゲット', icon: Users },
    { id: 'value', title: '提供価値', icon: Lightbulb },
    { id: 'features', title: '主要機能', icon: Zap },
    { id: 'flow', title: '利用フロー', icon: Clock },
    { id: 'revenue', title: '収益モデル', icon: DollarSign },
    { id: 'reference', title: '参考イメージ', icon: Palette },
    { id: 'other', title: 'その他', icon: CheckCircle },
    { id: 'tech', title: '技術的な希望', icon: Smartphone },
    { id: 'success', title: '成功イメージ', icon: TrendingUp },
    { id: 'confirm', title: '内容確認', icon: CheckCircle },
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5 && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_tag: string, i: number) => i !== index)
    }))
  }

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      core_features: [...prev.core_features, { title: '', description: '' }]
    }))
  }

  const handleUpdateFeature = (index: number, field: 'title' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      core_features: prev.core_features.map((feature: CoreFeature, i: number) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }))
  }

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      core_features: prev.core_features.filter((_feature: CoreFeature, i: number) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      const currentData = encodeURIComponent(JSON.stringify(formData))
      const redirectUrl = ideaId ? `/ideas/${ideaId}/edit` : '/ideas/new'
      router.push(`/auth/login?redirect=${redirectUrl}&data=${currentData}`)
      return
    }

    // バリデーションチェック
    const missingFields = []
    
    if (formType === 'simple') {
      if (!formData.title?.trim()) missingFields.push('タイトル')
      if (!formData.problem?.trim()) missingFields.push('解決したい課題')
      if (!formData.solution?.trim()) missingFields.push('解決方法')
      if (!formData.category?.trim()) missingFields.push('カテゴリ')
    } else {
      // 企画書フォームのバリデーション
      if (!formData.service_name?.trim()) missingFields.push('サービス名')
      if (!formData.catch_copy?.trim()) missingFields.push('キャッチコピー')
      if (!formData.background_problem?.trim()) missingFields.push('背景・課題')
      if (!formData.main_target?.trim()) missingFields.push('メインターゲット')
      if (!formData.value_proposition?.trim()) missingFields.push('提供価値')
      if (!formData.category?.trim()) missingFields.push('カテゴリ')
    }
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      setError(`必須項目が入力されていません: ${missingFields.join(', ')}`)
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Form submission started', { formType, user: user?.id })
      
      const dataToSubmit = formType === 'simple' 
        ? {
            user_id: user.id,
            title: formData.title,
            problem: formData.problem,
            solution: formData.solution,
            target_users: formData.target_users || null,
            category: formData.category,
            tags: formData.tags,
            sketch_urls: [],
          }
        : {
            user_id: user.id,
            title: formData.service_name || formData.title,
            problem: formData.background_problem || formData.problem,
            solution: formData.value_proposition || formData.solution,
            target_users: formData.main_target || formData.target_users || null,
            category: formData.category,
            tags: formData.tags,
            sketch_urls: [],
            // 企画書フィールド
            service_name: formData.service_name,
            catch_copy: formData.catch_copy,
            service_description: formData.service_description,
            background_problem: formData.background_problem,
            current_solution_problems: formData.current_solution_problems,
            main_target: formData.main_target,
            usage_scene: formData.usage_scene,
            value_proposition: formData.value_proposition,
            differentiators: formData.differentiators,
            core_features: formData.core_features.filter((f: CoreFeature) => f.title && f.description),
            nice_to_have_features: formData.nice_to_have_features,
            initial_flow: formData.initial_flow,
            important_operations: formData.important_operations,
            monetization_method: formData.monetization_method,
            price_range: formData.price_range,
            free_paid_boundary: formData.free_paid_boundary,
            similar_services: formData.similar_services,
            design_atmosphere: formData.design_atmosphere,
            reference_urls: formData.reference_urls,
            expected_release: formData.expected_release,
            priority_points: formData.priority_points,
            device_type: formData.device_type,
            external_services: formData.external_services,
            one_month_goal: formData.one_month_goal,
            success_metrics: formData.success_metrics,
          }

      console.log('Data to submit:', dataToSubmit)

      // 環境とSupabase設定の確認
      console.log('=== Debug Info ===')
      console.log('User ID:', user.id)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      console.log('Form Type:', formType)
      console.log('==================')

      console.log('Using direct client for database operation...')
      console.log('Data to insert:', dataToSubmit)
      
      const startTime = Date.now()
      
      try {
        let result
        if (ideaId) {
          console.log('Updating existing idea with direct client...')
          result = await directSupabase.update('ideas', dataToSubmit, { id: ideaId })
        } else {
          console.log('Inserting new idea with direct client...')
          result = await directSupabase.insert('ideas', dataToSubmit)
        }

        const endTime = Date.now()
        console.log(`Direct operation completed in ${endTime - startTime}ms`)

        if (result.error) {
          console.error('Direct operation error:', result.error)
          setError(`エラー: ${result.error.message}`)
        } else {
          console.log('Direct operation successful:', result.data)
          const targetId = ideaId || result.data?.id
          if (targetId) {
            router.push(`/ideas/${targetId}`)
          } else {
            setError('投稿は成功しましたが、IDが取得できませんでした。')
          }
        }
        
      } catch (directError: any) {
        const endTime = Date.now()
        console.error(`Direct operation failed after ${endTime - startTime}ms:`, directError)
        setError(`投稿失敗: ${directError.message}`)
      }
    } catch (err: any) {
      console.error('Submission error:', err)
      const errorMessage = err?.message || '投稿に失敗しました。ネットワーク接続を確認してください。'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleTempSave = async () => {
    if (!user) {
      setError('一時保存するにはログインが必要です')
      return
    }

    setSaving(true)
    setSaveMessage('')
    setError('')

    try {
      const dataToSave = formType === 'simple' 
        ? {
            user_id: user.id,
            title: formData.title || 'Untitled',
            problem: formData.problem,
            solution: formData.solution,
            target_users: formData.target_users || null,
            category: formData.category,
            tags: formData.tags,
            sketch_urls: [],
            status: 'draft', // 一時保存フラグ
          }
        : {
            user_id: user.id,
            title: formData.service_name || formData.title || 'Untitled',
            problem: formData.background_problem || formData.problem,
            solution: formData.value_proposition || formData.solution,
            target_users: formData.main_target || formData.target_users || null,
            category: formData.category,
            tags: formData.tags,
            sketch_urls: [],
            status: 'draft', // 一時保存フラグ
            // 企画書フィールド
            service_name: formData.service_name,
            catch_copy: formData.catch_copy,
            service_description: formData.service_description,
            background_problem: formData.background_problem,
            current_solution_problems: formData.current_solution_problems,
            main_target: formData.main_target,
            usage_scene: formData.usage_scene,
            value_proposition: formData.value_proposition,
            differentiators: formData.differentiators,
            core_features: formData.core_features.filter((f: CoreFeature) => f.title && f.description),
            nice_to_have_features: formData.nice_to_have_features,
            initial_flow: formData.initial_flow,
            important_operations: formData.important_operations,
            monetization_method: formData.monetization_method,
            price_range: formData.price_range,
            free_paid_boundary: formData.free_paid_boundary,
            similar_services: formData.similar_services,
            design_atmosphere: formData.design_atmosphere,
            reference_urls: formData.reference_urls,
            expected_release: formData.expected_release,
            priority_points: formData.priority_points,
            device_type: formData.device_type,
            external_services: formData.external_services,
            one_month_goal: formData.one_month_goal,
            success_metrics: formData.success_metrics,
          }

      let result
      if (ideaId) {
        result = await directSupabase.update('ideas', dataToSave, { id: ideaId })
      } else {
        result = await directSupabase.insert('ideas', dataToSave)
      }

      if (result.error) {
        setError(`一時保存エラー: ${result.error.message}`)
      } else {
        setSaveMessage('一時保存しました')
        setTimeout(() => setSaveMessage(''), 3000) // 3秒後にメッセージを消す
      }
    } catch (err: any) {
      setError(`一時保存失敗: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (showTypeSelection && !initialData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            投稿タイプを選択してください
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setFormType('simple')
                setShowTypeSelection(false)
              }}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors text-left group"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <Lightbulb className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">シンプル投稿</h2>
                <p className="text-gray-600">
                  アイデアの概要を簡単に投稿できます。必要最小限の情報だけで、すぐに投稿可能です。
                </p>
              </div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  3分で投稿完了
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  必須項目は4つだけ
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  後から詳細を追加可能
                </li>
              </ul>
            </button>

            <button
              onClick={() => {
                setFormType('detailed')
                setShowTypeSelection(false)
              }}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors text-left group"
            >
              <div className="mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">企画書形式</h2>
                <p className="text-gray-600">
                  詳細な企画書フォーマットで、アイデアを体系的に整理して投稿できます。
                </p>
              </div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  10項目の詳細入力
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  開発チームに伝わりやすい
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  実現可能性が高まる
                </li>
              </ul>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (formType === 'simple') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {ideaId ? 'アイデアを編集' : '新しいアイデアを投稿'}
            </h1>
            {!user && (
              <p className="text-sm text-gray-600">
                フォームに入力後、投稿ボタンを押すとログイン画面に移動します（入力内容は保持されます）
              </p>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="アプリのタイトルを入力してください（50文字以内）"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.title.length}/50
              </div>
            </div>

            <div>
              <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
                解決したい問題 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="problem"
                name="problem"
                value={formData.problem}
                onChange={handleInputChange}
                required
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="どのような問題を解決したいですか？（500文字以内）"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.problem.length}/500
              </div>
            </div>

            <div>
              <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-2">
                解決策・アイデア <span className="text-red-500">*</span>
              </label>
              <textarea
                id="solution"
                name="solution"
                value={formData.solution}
                onChange={handleInputChange}
                required
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="どのような機能やアプローチで解決しますか？（500文字以内）"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.solution.length}/500
              </div>
            </div>

            <div>
              <label htmlFor="target_users" className="block text-sm font-medium text-gray-700 mb-2">
                ターゲットユーザー
              </label>
              <input
                type="text"
                id="target_users"
                name="target_users"
                value={formData.target_users}
                onChange={handleInputChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="誰が使うアプリですか？（200文字以内、任意）"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.target_users.length}/200
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">カテゴリを選択してください</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグ（最大5個）
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="タグを入力してEnterで追加"
                    disabled={formData.tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || formData.tags.length >= 5}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    追加
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="hover:text-primary-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            {saveMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                {saveMessage}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              {user && (
                <button
                  type="button"
                  onClick={handleTempSave}
                  disabled={saving}
                  className={cn(
                    "px-6 py-3 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors",
                    saving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {saving ? '保存中...' : '一時保存'}
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.problem || !formData.solution || !formData.category}
                className={cn(
                  "px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? '投稿中...' : user ? (ideaId ? '更新する' : 'アイデアを投稿') : 'ログインして投稿'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // 詳細版（企画書形式）
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // サービス概要
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-2">
                サービス名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="service_name"
                name="service_name"
                value={formData.service_name}
                onChange={handleInputChange}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="サービスの名前を入力してください"
              />
            </div>

            <div>
              <label htmlFor="catch_copy" className="block text-sm font-medium text-gray-700 mb-2">
                キャッチコピー
              </label>
              <input
                type="text"
                id="catch_copy"
                name="catch_copy"
                value={formData.catch_copy}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="サービスを一言で表現"
              />
            </div>

            <div>
              <label htmlFor="service_description" className="block text-sm font-medium text-gray-700 mb-2">
                サービスの説明 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="service_description"
                name="service_description"
                value={formData.service_description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="サービスの概要を3行程度で説明してください"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ・ジャンル <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">カテゴリを選択してください</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 1: // 背景・課題
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="background_problem" className="block text-sm font-medium text-gray-700 mb-2">
                解決したい問題 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="background_problem"
                name="background_problem"
                value={formData.background_problem}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="どのような問題を解決したいですか？具体的に記述してください"
              />
            </div>

            <div>
              <label htmlFor="current_solution_problems" className="block text-sm font-medium text-gray-700 mb-2">
                現状の解決方法とその問題点
              </label>
              <textarea
                id="current_solution_problems"
                name="current_solution_problems"
                value={formData.current_solution_problems}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="現在どのように解決されているか、その方法の問題点は何か"
              />
            </div>
          </div>
        )

      case 2: // ターゲットユーザー
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="main_target" className="block text-sm font-medium text-gray-700 mb-2">
                メインターゲット <span className="text-red-500">*</span>
              </label>
              <textarea
                id="main_target"
                name="main_target"
                value={formData.main_target}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="具体的な人物像（年齢、職業、ライフスタイルなど）"
              />
            </div>

            <div>
              <label htmlFor="usage_scene" className="block text-sm font-medium text-gray-700 mb-2">
                想定利用シーン
              </label>
              <textarea
                id="usage_scene"
                name="usage_scene"
                value={formData.usage_scene}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="いつ、どこで、どのように使うか"
              />
            </div>
          </div>
        )

      case 3: // 提供価値
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="value_proposition" className="block text-sm font-medium text-gray-700 mb-2">
                このサービスで実現したいこと <span className="text-red-500">*</span>
              </label>
              <textarea
                id="value_proposition"
                name="value_proposition"
                value={formData.value_proposition}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="ユーザーにどのような価値を提供するか"
              />
            </div>

            <div>
              <label htmlFor="differentiators" className="block text-sm font-medium text-gray-700 mb-2">
                既存サービスとの違い
              </label>
              <textarea
                id="differentiators"
                name="differentiators"
                value={formData.differentiators}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="競合サービスと比べて何が違うか"
              />
            </div>
          </div>
        )

      case 4: // 主要機能
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                核となる機能（3〜5個程度）
              </label>
              <div className="space-y-4">
                {formData.core_features.map((feature: CoreFeature, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-gray-700">機能 {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="機能名"
                    />
                    <textarea
                      value={feature.description}
                      onChange={(e) => handleUpdateFeature(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="機能の説明"
                    />
                  </div>
                ))}
                {formData.core_features.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    機能を追加
                  </button>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="nice_to_have_features" className="block text-sm font-medium text-gray-700 mb-2">
                あったらいいなと思う機能
              </label>
              <textarea
                id="nice_to_have_features"
                name="nice_to_have_features"
                value={formData.nice_to_have_features}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="必須ではないが、あると嬉しい機能"
              />
            </div>
          </div>
        )

      case 5: // 利用フロー
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="initial_flow" className="block text-sm font-medium text-gray-700 mb-2">
                初回利用時の流れ
              </label>
              <textarea
                id="initial_flow"
                name="initial_flow"
                value={formData.initial_flow}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="ユーザーが初めて使うときの手順"
              />
            </div>

            <div>
              <label htmlFor="important_operations" className="block text-sm font-medium text-gray-700 mb-2">
                最も重要な操作の手順
              </label>
              <textarea
                id="important_operations"
                name="important_operations"
                value={formData.important_operations}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="核となる機能の具体的な操作方法"
              />
            </div>
          </div>
        )

      case 6: // 収益モデル
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="monetization_method" className="block text-sm font-medium text-gray-700 mb-2">
                マネタイズ方法
              </label>
              <textarea
                id="monetization_method"
                name="monetization_method"
                value={formData.monetization_method}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="広告、サブスクリプション、課金など"
              />
            </div>

            <div>
              <label htmlFor="price_range" className="block text-sm font-medium text-gray-700 mb-2">
                想定価格帯
              </label>
              <input
                type="text"
                id="price_range"
                name="price_range"
                value={formData.price_range}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="無料、月額500円など"
              />
            </div>

            <div>
              <label htmlFor="free_paid_boundary" className="block text-sm font-medium text-gray-700 mb-2">
                無料/有料の境界線
              </label>
              <textarea
                id="free_paid_boundary"
                name="free_paid_boundary"
                value={formData.free_paid_boundary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="どこまで無料で、どこから有料にするか"
              />
            </div>
          </div>
        )

      case 7: // 参考イメージ
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="similar_services" className="block text-sm font-medium text-gray-700 mb-2">
                似ているサービス・アプリ
              </label>
              <textarea
                id="similar_services"
                name="similar_services"
                value={formData.similar_services}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="参考になる既存サービス"
              />
            </div>

            <div>
              <label htmlFor="design_atmosphere" className="block text-sm font-medium text-gray-700 mb-2">
                デザインの雰囲気
              </label>
              <textarea
                id="design_atmosphere"
                name="design_atmosphere"
                value={formData.design_atmosphere}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="シンプル、ポップ、ビジネスライクなど"
              />
            </div>

            <div>
              <label htmlFor="reference_urls" className="block text-sm font-medium text-gray-700 mb-2">
                参考URL
              </label>
              <textarea
                id="reference_urls"
                name="reference_urls"
                value={formData.reference_urls}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="参考になるWebサイトやアプリのURL（改行で区切る）"
              />
            </div>
          </div>
        )

      case 8: // その他
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="expected_release" className="block text-sm font-medium text-gray-700 mb-2">
                想定リリース時期
              </label>
              <input
                type="text"
                id="expected_release"
                name="expected_release"
                value={formData.expected_release}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="できるだけ早く、3ヶ月以内など"
              />
            </div>

            <div>
              <label htmlFor="priority_points" className="block text-sm font-medium text-gray-700 mb-2">
                特に重視したいポイント
              </label>
              <textarea
                id="priority_points"
                name="priority_points"
                value={formData.priority_points}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="使いやすさ、デザイン、機能の充実など"
              />
            </div>
          </div>
        )

      case 9: // 技術的な希望
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="device_type" className="block text-sm font-medium text-gray-700 mb-2">
                使用デバイス
              </label>
              <input
                type="text"
                id="device_type"
                name="device_type"
                value={formData.device_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="スマホアプリ、Webアプリ、両方など"
              />
            </div>

            <div>
              <label htmlFor="external_services" className="block text-sm font-medium text-gray-700 mb-2">
                必要な外部サービス
              </label>
              <textarea
                id="external_services"
                name="external_services"
                value={formData.external_services}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="決済、SNS連携、地図機能など"
              />
            </div>
          </div>
        )

      case 10: // 成功イメージ
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="one_month_goal" className="block text-sm font-medium text-gray-700 mb-2">
                リリース後1ヶ月の理想的な状態
              </label>
              <textarea
                id="one_month_goal"
                name="one_month_goal"
                value={formData.one_month_goal}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="どのような状態になっていれば成功と言えるか"
              />
            </div>

            <div>
              <label htmlFor="success_metrics" className="block text-sm font-medium text-gray-700 mb-2">
                数値目標
              </label>
              <textarea
                id="success_metrics"
                name="success_metrics"
                value={formData.success_metrics}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="ユーザー数、利用頻度など具体的な数値"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグ（最大5個）
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="タグを入力してEnterで追加"
                    disabled={formData.tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || formData.tags.length >= 5}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    追加
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="hover:text-primary-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 11: // 内容確認
        return (
          <div className="space-y-6">
            {!showFinalConfirmation ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">投稿前の内容確認</h3>
                  </div>
                  <p className="text-blue-800 mb-4">
                    入力された内容を確認してください。問題がなければ「確認完了」ボタンを押してください。
                  </p>
                  <div className="text-sm text-blue-700">
                    <p>• 必須項目が正しく入力されているか確認してください</p>
                    <p>• 投稿後も編集は可能です</p>
                    <p>• 投稿すると他のユーザーが閲覧できるようになります</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">入力内容の概要</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">サービス名:</span>
                      <span className="text-gray-900">{formData.service_name || 'Untitled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">カテゴリ:</span>
                      <span className="text-gray-900">{formData.category || '未選択'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">キャッチコピー:</span>
                      <span className="text-gray-900">{formData.catch_copy || '未入力'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">主要機能数:</span>
                      <span className="text-gray-900">{formData.core_features.length}個</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">タグ数:</span>
                      <span className="text-gray-900">{formData.tags.length}個</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">投稿の最終確認</h3>
                </div>
                <p className="text-green-800 mb-4">
                  本当にアイデアを投稿しますか？投稿するとすぐに他のユーザーが閲覧できるようになります。
                </p>
                <div className="text-sm text-green-700">
                  <p>• 投稿後も内容の編集は可能です</p>
                  <p>• 投稿をキャンセルしたい場合は「戻る」ボタンを押してください</p>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.service_name && formData.service_description && formData.category
      case 1:
        return formData.background_problem
      case 2:
        return formData.main_target
      case 3:
        return formData.value_proposition
      default:
        return true
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        {/* ステップインジケーター */}
        <div className="px-8 py-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {ideaId ? 'アイデアを編集（企画書形式）' : '新しいアイデアを投稿（企画書形式）'}
          </h1>
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center",
                    index !== steps.length - 1 && "flex-1"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                      currentStep === index
                        ? "bg-primary-50 text-primary-600"
                        : currentStep > index
                        ? "text-green-600 hover:bg-gray-50"
                        : "text-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
                  </button>
                  {index !== steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        currentStep > index ? "bg-green-500" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* フォームコンテンツ */}
        <form 
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // 確認ページ以外でのEnterキー送信を防ぐ
            if (e.key === 'Enter' && currentStep !== steps.length - 1) {
              e.preventDefault()
            }
          }}
        >
          <div className="px-8 py-6 min-h-[400px]">
            {renderStepContent()}
          </div>

          {error && (
            <div className="mx-8 mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {saveMessage && (
            <div className="mx-8 mb-6 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              {saveMessage}
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="px-8 py-6 border-t bg-gray-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (currentStep === steps.length - 1 && showFinalConfirmation) {
                  setShowFinalConfirmation(false)
                } else if (currentStep > 0) {
                  setCurrentStep(currentStep - 1)
                } else {
                  router.back()
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep > 0 ? '前へ' : 'キャンセル'}
            </button>

            <div className="flex items-center gap-4">
              {user && (
                <button
                  type="button"
                  onClick={handleTempSave}
                  disabled={saving}
                  className={cn(
                    "px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors text-sm",
                    saving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {saving ? '保存中...' : '一時保存'}
                </button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isCurrentStepValid()}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors",
                    !isCurrentStepValid() && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {currentStep === steps.length - 2 ? '内容確認へ' : '次へ'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  {!showFinalConfirmation ? (
                    <button
                      type="button"
                      onClick={() => setShowFinalConfirmation(true)}
                      disabled={!isCurrentStepValid()}
                      className={cn(
                        "px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-semibold",
                        !isCurrentStepValid() && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      確認完了
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowFinalConfirmation(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        戻る
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                          "px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold",
                          loading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {loading ? '投稿中...' : user ? (ideaId ? 'アイデアを更新' : 'アイデアを投稿') : 'ログインして投稿'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}