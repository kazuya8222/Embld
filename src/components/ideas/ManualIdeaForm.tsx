'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { saveIdeaFromAI } from '@/app/actions/ideas'
import { cn } from '@/lib/utils/cn'
import { 
  FileText, 
  Plus, 
  X, 
  Save, 
  Loader2, 
  Lightbulb, 
  Users, 
  Target, 
  Zap,
  DollarSign,
  Calendar
} from 'lucide-react'
import { CATEGORIES } from '@/types'

interface CoreFeature {
  title: string
  description: string
}

export function ManualIdeaForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // 基本情報
  const [title, setTitle] = useState('')
  const [problem, setProblem] = useState('')
  const [solution, setSolution] = useState('')
  const [targetUsers, setTargetUsers] = useState('')
  const [category, setCategory] = useState<string>('その他')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  
  // 詳細企画書フィールド
  const [serviceName, setServiceName] = useState('')
  const [catchCopy, setCatchCopy] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [backgroundProblem, setBackgroundProblem] = useState('')
  const [currentSolutionProblems, setCurrentSolutionProblems] = useState('')
  const [mainTarget, setMainTarget] = useState('')
  const [usageScene, setUsageScene] = useState('')
  const [valueProposition, setValueProposition] = useState('')
  const [differentiators, setDifferentiators] = useState('')
  const [coreFeatures, setCoreFeatures] = useState<CoreFeature[]>([])
  const [niceToHaveFeatures, setNiceToHaveFeatures] = useState('')
  const [initialFlow, setInitialFlow] = useState('')
  const [importantOperations, setImportantOperations] = useState('')
  const [monetizationMethod, setMonetizationMethod] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [freePaidBoundary, setFreePaidBoundary] = useState('')
  const [similarServices, setSimilarServices] = useState('')
  const [designAtmosphere, setDesignAtmosphere] = useState('')
  const [referenceUrls, setReferenceUrls] = useState('')
  const [expectedRelease, setExpectedRelease] = useState('')
  const [priorityPoints, setPriorityPoints] = useState('')
  const [deviceType, setDeviceType] = useState('')
  const [externalServices, setExternalServices] = useState('')
  const [oneMonthGoal, setOneMonthGoal] = useState('')
  const [successMetrics, setSuccessMetrics] = useState('')

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addCoreFeature = () => {
    setCoreFeatures([...coreFeatures, { title: '', description: '' }])
  }

  const updateCoreFeature = (index: number, field: keyof CoreFeature, value: string) => {
    const updated = [...coreFeatures]
    updated[index][field] = value
    setCoreFeatures(updated)
  }

  const removeCoreFeature = (index: number) => {
    setCoreFeatures(coreFeatures.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !title.trim() || !problem.trim() || !solution.trim()) {
      alert('必須項目を入力してください')
      return
    }

    const payload = {
      user_id: user.id,
      title: title.trim(),
      problem: problem.trim(),
      solution: solution.trim(),
      target_users: targetUsers.trim(),
      category,
      tags,
      sketch_urls: [],
      status: 'open' as const,
      // 詳細企画書フィールド
      service_name: serviceName.trim() || title.trim(),
      catch_copy: catchCopy.trim(),
      service_description: serviceDescription.trim(),
      background_problem: backgroundProblem.trim() || problem.trim(),
      current_solution_problems: currentSolutionProblems.trim(),
      main_target: mainTarget.trim() || targetUsers.trim(),
      usage_scene: usageScene.trim(),
      value_proposition: valueProposition.trim() || solution.trim(),
      differentiators: differentiators.trim(),
      core_features: coreFeatures.filter(f => f.title.trim()),
      nice_to_have_features: niceToHaveFeatures.trim(),
      initial_flow: initialFlow.trim(),
      important_operations: importantOperations.trim(),
      monetization_method: monetizationMethod.trim(),
      price_range: priceRange.trim(),
      free_paid_boundary: freePaidBoundary.trim(),
      similar_services: similarServices.trim(),
      design_atmosphere: designAtmosphere.trim(),
      reference_urls: referenceUrls.trim(),
      expected_release: expectedRelease.trim(),
      priority_points: priorityPoints.trim(),
      device_type: deviceType.trim(),
      external_services: externalServices.trim(),
      one_month_goal: oneMonthGoal.trim(),
      success_metrics: successMetrics.trim(),
    }

    startTransition(async () => {
      try {
        const result = await saveIdeaFromAI(payload)
        if (result.ok && result.id) {
          router.push(`/ideas/${result.id}`)
        } else {
          alert('保存に失敗しました: ' + (result.error || '不明なエラー'))
        }
      } catch (error) {
        console.error('Save error:', error)
        alert('保存に失敗しました')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <FileText className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">手動入力</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            アイデアを詳細に記入
          </h1>
          <p className="text-lg text-gray-600">
            必要な項目を入力してあなたのアイデアを投稿しましょう
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* 基本情報セクション */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">基本情報</h2>
              <span className="text-sm text-red-500">*必須</span>
            </div>

            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                アイデアタイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="あなたのアイデアを一言で表現してください"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {/* 課題 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                解決したい課題 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="どのような課題や問題を解決したいですか？"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {/* 解決策 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                解決策・価値提案 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="どのような方法で課題を解決しますか？"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {/* ターゲットユーザー */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ターゲットユーザー
              </label>
              <input
                type="text"
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
                placeholder="誰に向けたサービスですか？"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* タグ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグ
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="タグを入力"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 詳細情報セクション */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <Target className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">詳細企画書</h2>
              <span className="text-sm text-gray-500">任意</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* サービス名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  サービス名
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="サービスの正式名称"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* キャッチコピー */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キャッチコピー
                </label>
                <input
                  type="text"
                  value={catchCopy}
                  onChange={(e) => setCatchCopy(e.target.value)}
                  placeholder="魅力的な一言で表現"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* サービス説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サービス詳細説明
              </label>
              <textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="サービスの詳細な説明"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 差別化要因 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                差別化要因・独自性
              </label>
              <textarea
                value={differentiators}
                onChange={(e) => setDifferentiators(e.target.value)}
                placeholder="他のサービスとの違いや独自の強み"
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* コア機能 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  コア機能
                </label>
                <button
                  type="button"
                  onClick={addCoreFeature}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  機能追加
                </button>
              </div>
              <div className="space-y-3">
                {coreFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateCoreFeature(index, 'title', e.target.value)}
                        placeholder="機能名"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={feature.description}
                        onChange={(e) => updateCoreFeature(index, 'description', e.target.value)}
                        placeholder="機能の説明"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCoreFeature(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* マネタイズ情報 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <DollarSign className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">収益化</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    収益化方法
                  </label>
                  <input
                    type="text"
                    value={monetizationMethod}
                    onChange={(e) => setMonetizationMethod(e.target.value)}
                    placeholder="サブスク、広告、手数料など"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    価格帯
                  </label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="月額500円、年額5000円など"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* その他の詳細項目 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  類似サービス
                </label>
                <textarea
                  value={similarServices}
                  onChange={(e) => setSimilarServices(e.target.value)}
                  placeholder="競合となる既存サービス"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対応デバイス
                </label>
                <input
                  type="text"
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  placeholder="Web、iOS、Android など"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  リリース予定
                </label>
                <input
                  type="text"
                  value={expectedRelease}
                  onChange={(e) => setExpectedRelease(e.target.value)}
                  placeholder="2024年内、6ヶ月後など"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  成功指標
                </label>
                <input
                  type="text"
                  value={successMetrics}
                  onChange={(e) => setSuccessMetrics(e.target.value)}
                  placeholder="ユーザー数、売上など"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isPending || !title.trim() || !problem.trim() || !solution.trim()}
              className={cn(
                "flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium",
                (isPending || !title.trim() || !problem.trim() || !solution.trim()) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isPending ? '投稿中...' : 'アイデアを投稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}