'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { saveIdeaFromAI } from '@/app/actions/ideas'
import { cn } from '@/lib/utils/cn'
import { Send, Bot, User, Loader2, CheckCircle, FileText, Target, Lightbulb, Zap, Sparkles, RefreshCw, ThumbsUp, Edit3 } from 'lucide-react'

interface ThreeFrameData {
  persona: string
  problem: string
  service: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  updates?: {
    persona?: string
    problem?: string
    service?: string
  }
}

interface IdeaChatFormProps {
  initialData?: any
  ideaId?: string
}

export function IdeaChatForm({ initialData, ideaId }: IdeaChatFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 3枠のデータ管理
  const [threeFrames, setThreeFrames] = useState<ThreeFrameData>({
    persona: '',
    problem: '',
    service: ''
  })
  
  // チャット履歴
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🚀 アイデアを一緒に発展させましょう！\n\nあなたの考えているサービスや解決したい課題について、何でも教えてください。AIが入力内容を分析して、**ペルソナ・課題・サービス内容**の3つの視点から最適化していきます。',
      timestamp: new Date()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState('')
  const [pendingUpdates, setPendingUpdates] = useState<{ persona?: string; problem?: string; service?: string } | null>(null)
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/idea-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          currentFrames: threeFrames,
          mode: 'analyze_and_update'
        }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        updates: data.updates
      }

      setMessages(prev => [...prev, assistantMessage])

      // アップデート提案がある場合は保留状態に
      if (data.updates) {
        setPendingUpdates(data.updates)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'すみません、エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const applyUpdates = () => {
    if (pendingUpdates) {
      setThreeFrames(prev => ({
        persona: pendingUpdates.persona || prev.persona,
        problem: pendingUpdates.problem || prev.problem,
        service: pendingUpdates.service || prev.service
      }))
      setPendingUpdates(null)
      
      // 承認メッセージを追加
      const confirmMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '✅ アップデートを反映しました！さらに改善したい点や追加したい情報があれば教えてください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, confirmMessage])
    }
  }

  const rejectUpdates = () => {
    setPendingUpdates(null)
    
    const rejectMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: '承知しました。現在の内容を維持します。他に追加したい情報や修正したい点があれば教えてください。',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, rejectMessage])
  }

  const generatePlan = async () => {
    if (!threeFrames.persona || !threeFrames.problem || !threeFrames.service) {
      alert('ペルソナ、課題、サービス内容をすべて入力してから企画書を生成してください。')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/idea-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          currentFrames: threeFrames,
          mode: 'generate_plan'
        }),
      })

      if (!response.ok) {
        throw new Error('企画書生成に失敗しました')
      }

      const data = await response.json()
      setGeneratedPlan(data.response)
      setShowPlan(true)

    } catch (error) {
      console.error('企画書生成エラー:', error)
      alert('企画書の生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSavePlan = async () => {
    if (!user || !generatedPlan) {
      return
    }

    setIsLoading(true)

    try {
      // 企画書からデータを抽出
      const lines = generatedPlan.split('\n')
      let title = ''
      let serviceDescription = ''
      let monetization = ''
      
      // タイトルを抽出（最初の行または「サービス名」の次の行）
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.includes('サービス名') || line.includes('タイトル')) {
          title = lines[i + 1]?.trim() || ''
          break
        }
      }
      
      // サービス説明と収益化を抽出
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.includes('サービス概要') || line.includes('概要')) {
          serviceDescription = lines[i + 1]?.trim() || ''
        } else if (line.includes('収益化') || line.includes('マネタイズ')) {
          monetization = lines[i + 1]?.trim() || ''
        }
      }

      const dataToSubmit = {
        user_id: user.id,
        title: title || 'AI生成アイデア',
        problem: threeFrames.problem,
        solution: threeFrames.service,
        target_users: threeFrames.persona,
        category: 'その他',
        tags: ['AI生成', '対話式企画書'],
        sketch_urls: [],
        status: 'open' as const,
        // 詳細項目
        service_name: title,
        service_description: serviceDescription,
        value_proposition: threeFrames.service,
        background_problem: threeFrames.problem,
        main_target: threeFrames.persona,
        monetization_method: monetization,
        // 企画書全文を保存
        catch_copy: title,
        initial_flow: generatedPlan.slice(0, 1000) // 最初の1000文字
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

  // 企画書表示画面
  if (showPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">企画書が完成しました！</h1>
              <p className="text-gray-600">AIが生成した企画書を確認して投稿してください</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {generatedPlan}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPlan(false)}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI企画書作成</h1>
          <p className="text-gray-600">対話を通じてあなたのアイデアを最適化し、収益性の高い企画書を作成します</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 3枠カード */}
          <div className="lg:col-span-2 space-y-4">
            {/* ペルソナカード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ペルソナ</h3>
                {pendingUpdates?.persona && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">アップデート提案</span>
                )}
              </div>
              <div className="min-h-[80px] p-4 bg-gray-50 rounded-lg">
                {pendingUpdates?.persona ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">現在: {threeFrames.persona || '未入力'}</div>
                    <div className="text-sm text-blue-600 font-medium">提案: {pendingUpdates.persona}</div>
                  </div>
                ) : (
                  <p className="text-gray-700">{threeFrames.persona || 'ターゲットユーザーを明確にしましょう'}</p>
                )}
              </div>
            </div>

            {/* 課題カード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">課題</h3>
                {pendingUpdates?.problem && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">アップデート提案</span>
                )}
              </div>
              <div className="min-h-[80px] p-4 bg-gray-50 rounded-lg">
                {pendingUpdates?.problem ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">現在: {threeFrames.problem || '未入力'}</div>
                    <div className="text-sm text-blue-600 font-medium">提案: {pendingUpdates.problem}</div>
                  </div>
                ) : (
                  <p className="text-gray-700">{threeFrames.problem || '解決したい課題を整理しましょう'}</p>
                )}
              </div>
            </div>

            {/* サービス内容カード */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">サービス内容</h3>
                {pendingUpdates?.service && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">アップデート提案</span>
                )}
              </div>
              <div className="min-h-[80px] p-4 bg-gray-50 rounded-lg">
                {pendingUpdates?.service ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">現在: {threeFrames.service || '未入力'}</div>
                    <div className="text-sm text-blue-600 font-medium">提案: {pendingUpdates.service}</div>
                  </div>
                ) : (
                  <p className="text-gray-700">{threeFrames.service || 'どのような解決策を提供しますか？'}</p>
                )}
              </div>
            </div>

            {/* アップデート承認ボタン */}
            {pendingUpdates && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">AIからの改善提案があります</h4>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={applyUpdates}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    適用する
                  </button>
                  <button
                    onClick={rejectUpdates}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    却下
                  </button>
                </div>
              </div>
            )}

            {/* 企画書生成ボタン */}
            {threeFrames.persona && threeFrames.problem && threeFrames.service && !pendingUpdates && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-bold text-blue-900 mb-2">企画書を生成できます！</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    3つの要素が揃いました。収益性を重視した企画書を生成しますか？
                  </p>
                  <button
                    onClick={generatePlan}
                    disabled={isLoading}
                    className={cn(
                      "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        企画書を生成
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* チャットエリア */}
          <div className="bg-white rounded-xl shadow-lg flex flex-col h-[600px]">
            {/* チャットヘッダー */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI アシスタント</h3>
                  <p className="text-sm text-gray-500">
                    {isLoading ? 'タイピング中...' : 'オンライン'}
                  </p>
                </div>
              </div>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 max-w-[80%]",
                    message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                    )}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-lg flex-1",
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div
                      className={cn(
                        "text-xs mt-2 opacity-70",
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      )}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">分析中...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="アイデアについて何でも話してください..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
                    (!input.trim() || isLoading) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}