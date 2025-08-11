'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { saveIdeaFromAI } from '@/app/actions/ideas'
import { cn } from '@/lib/utils/cn'
import { Send, Bot, User, Loader2, CheckCircle, FileText, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'

interface ChatStep {
  id: string
  question: string
  placeholder: string
  key: keyof ChatData
  isOptional?: boolean
}

interface ChatData {
  title: string
  problem: string
  solution: string
  target_users: string
  service_name: string
  service_description: string
  value_proposition: string
  core_features: string
  monetization_method: string
  differentiators: string
}

interface IdeaChatFormProps {
  initialData?: any
  ideaId?: string
}

export function IdeaChatForm({ initialData, ideaId }: IdeaChatFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  
  // ステップ定義
  const chatSteps: ChatStep[] = [
    {
      id: 'title',
      question: 'あなたのアイデアを一言で表現してください',
      placeholder: 'サービス名やアイデアのタイトルを入力',
      key: 'title'
    },
    {
      id: 'problem',
      question: 'どのような課題を解決したいですか？',
      placeholder: '解決したい問題や困りごとを詳しく教えてください',
      key: 'problem'
    },
    {
      id: 'target_users',
      question: '誰のための解決策ですか？',
      placeholder: 'ターゲットユーザーを具体的に教えてください',
      key: 'target_users'
    },
    {
      id: 'solution',
      question: 'どのような方法で解決しますか？',
      placeholder: 'あなたの解決策やアプローチを教えてください',
      key: 'solution'
    },
    {
      id: 'service_name',
      question: 'サービスの正式名称を教えてください',
      placeholder: 'サービス名を入力してください',
      key: 'service_name',
      isOptional: true
    },
    {
      id: 'service_description',
      question: 'サービスの詳細を教えてください',
      placeholder: 'サービスの機能や特徴を詳しく説明してください',
      key: 'service_description',
      isOptional: true
    },
    {
      id: 'value_proposition',
      question: 'ユーザーにとっての価値は何ですか？',
      placeholder: 'このサービスがユーザーに提供する価値を教えてください',
      key: 'value_proposition',
      isOptional: true
    },
    {
      id: 'core_features',
      question: '主要な機能を教えてください',
      placeholder: 'コア機能や重要な機能を箇条書きで教えてください',
      key: 'core_features',
      isOptional: true
    },
    {
      id: 'monetization_method',
      question: 'どのように収益化しますか？',
      placeholder: 'サブスク、広告、手数料など収益モデルを教えてください',
      key: 'monetization_method',
      isOptional: true
    },
    {
      id: 'differentiators',
      question: '他との違いや独自性は何ですか？',
      placeholder: '競合との差別化ポイントを教えてください',
      key: 'differentiators',
      isOptional: true
    }
  ]
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [chatData, setChatData] = useState<ChatData>({
    title: '',
    problem: '',
    solution: '',
    target_users: '',
    service_name: '',
    service_description: '',
    value_proposition: '',
    core_features: '',
    monetization_method: '',
    differentiators: ''
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  
  const currentStep = chatSteps[currentStepIndex]
  const isLastStep = currentStepIndex === chatSteps.length - 1
  const isFirstStep = currentStepIndex === 0
  
  useEffect(() => {
    // フォーカスを入力欄に移す
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentStepIndex])

  const handleNext = () => {
    if (!input.trim()) {
      if (currentStep.isOptional) {
        // オプションの場合はスキップ可能
        goToNextStep()
      }
      return
    }

    // データを保存
    setChatData(prev => ({
      ...prev,
      [currentStep.key]: input.trim()
    }))

    setInput('')
    goToNextStep()
  }

  const goToNextStep = () => {
    if (isLastStep) {
      setShowSummary(true)
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      // 現在の入力を保存してから前に戻る
      if (input.trim()) {
        setChatData(prev => ({
          ...prev,
          [currentStep.key]: input.trim()
        }))
      }
      
      setCurrentStepIndex(prev => prev - 1)
      // 前のステップのデータを入力欄に復元
      const prevStep = chatSteps[currentStepIndex - 1]
      setInput(chatData[prevStep.key] || '')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleNext()
  }

  const handleSavePlan = async () => {
    if (!user) {
      return
    }

    setIsLoading(true)

    try {
      // ChatDataをideaテーブルの形式に変換
      const dataToSubmit = {
        user_id: user.id,
        title: chatData.title || 'AI生成アイデア',
        problem: chatData.problem,
        solution: chatData.solution,
        target_users: chatData.target_users,
        category: 'その他',
        tags: ['AI生成'],
        sketch_urls: [],
        status: 'open' as const,
        // 詳細項目
        service_name: chatData.service_name || chatData.title,
        service_description: chatData.service_description,
        value_proposition: chatData.value_proposition,
        core_features: chatData.core_features ? [{ title: 'コア機能', description: chatData.core_features }] : [],
        monetization_method: chatData.monetization_method,
        differentiators: chatData.differentiators,
        // その他デフォルト値
        background_problem: chatData.problem,
        main_target: chatData.target_users,
      }

      const res = await saveIdeaFromAI(dataToSubmit, ideaId)
      if (!res.ok || !res.id) {
        console.error('Save error:', res.error)
        alert('保存に失敗しました')
      } else {
        router.push(`/ideas/${res.id}`)
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">アイデアが完成しました！</h1>
              <p className="text-gray-600">入力内容を確認して投稿してください</p>
            </div>

            <div className="space-y-6 mb-8">
              {chatSteps.map((step, index) => {
                const value = chatData[step.key]
                if (!value && step.isOptional) return null
                
                return (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{step.question}</h3>
                    <p className="text-gray-700">{value || '未入力'}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSummary(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                修正する
              </button>
              <button
                onClick={handleSavePlan}
                disabled={isLoading}
                className={cn(
                  "flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    投稿中...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    アイデアを投稿
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentStepIndex + 1} / {chatSteps.length}
            </span>
            <span className="text-sm text-gray-500">
              {currentStep.isOptional ? '任意' : '必須'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStepIndex + 1) / chatSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
          {/* AIアバター */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AIアシスタント</h3>
              <p className="text-sm text-gray-500">あなたのアイデアを整理します</p>
            </div>
          </div>

          {/* 質問 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              {currentStep.question}
            </h2>
          </div>

          {/* 入力フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentStep.placeholder}
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                autoComplete="off"
              />
            </div>

            {/* ボタン */}
            <div className="flex gap-3">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  戻る
                </button>
              )}
              
              <button
                type="submit"
                disabled={!input.trim() && !currentStep.isOptional}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium",
                  (!input.trim() && !currentStep.isOptional)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    完了
                  </>
                ) : (
                  <>
                    次へ
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              
              {currentStep.isOptional && (
                <button
                  type="button"
                  onClick={() => {
                    setInput('')
                    goToNextStep()
                  }}
                  className="px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  スキップ
                </button>
              )}
            </div>
          </form>
        </div>

        {/* キーボードショートカット案内 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Enterで次へ進みます
          </p>
        </div>
      </div>
    </div>
  )
}