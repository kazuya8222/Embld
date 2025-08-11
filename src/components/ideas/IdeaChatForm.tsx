'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
// DB 書き込みはサーバーアクション経由に変更
import { saveIdeaFromAI } from '@/app/actions/ideas'
import { cn } from '@/lib/utils/cn'
import { Send, Bot, User, Loader2, CheckCircle, FileText } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type ChatStep = 'service_overview' | 'persona' | 'problem' | 'solution' | 'confirmation' | 'revise' | 'generate_plan' | 'completed'

interface IdeaChatFormProps {
  initialData?: any
  ideaId?: string
}

export function IdeaChatForm({ initialData, ideaId }: IdeaChatFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！新しいアイデアを一緒に作り上げていきましょう。\n\nまず、サービスの概要を教えてください。どのようなサービスを考えていますか？',
      timestamp: new Date()
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<ChatStep>('service_overview')
  const [generatedPlan, setGeneratedPlan] = useState('')
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageContent: string, stepOverride?: ChatStep) => {
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
          step: stepOverride ?? currentStep
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
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // ステップの進行を管理（明示されたステップを優先）
      const stepUsed = stepOverride ?? currentStep
      switch (stepUsed) {
        case 'service_overview':
          setCurrentStep('persona')
          break
        case 'persona':
          setCurrentStep('problem')
          break
        case 'problem':
          setCurrentStep('solution')
          break
        case 'solution':
          setCurrentStep('confirmation')
          break
        case 'confirmation':
          // ペルソナ/課題/解決策の確認段階 - 2択ボタンで処理
          break
        case 'revise':
          setCurrentStep('confirmation')
          break
        case 'generate_plan':
          setGeneratedPlan(data.response)
          setCurrentStep('completed')
          break
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
      // 生成中で失敗した場合は入力可能なステップへ戻す
      if ((stepOverride ?? currentStep) === 'generate_plan') {
        setCurrentStep('solution')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmation = (isConfirmed: boolean) => {
    if (isConfirmed) {
      setCurrentStep('generate_plan')
      sendMessage('はい、問題ありません。企画書を生成してください。', 'generate_plan')
    } else {
      setCurrentStep('revise')
      sendMessage('いいえ、修正が必要です。どの部分を修正したいか教えてください。', 'revise')
    }
  }

  const extractDataFromPlan = (plan: string) => {
    const userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content)
    
    // 基本的な情報を企画書から抽出
    const lines = plan.split('\n')
    let title = 'AI生成企画書'
    let problem = ''
    let solution = ''
    let target_users = ''
    
    // 最初のユーザーメッセージをサービス概要として使用
    if (userMessages[0]) {
      title = userMessages[0].slice(0, 50) // 最初の50文字をタイトルに
    }
    
    // 企画書からペルソナ、課題、解決策を抽出
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.includes('ターゲットユーザー') || line.includes('ペルソナ')) {
        target_users = lines[i + 1]?.trim() || ''
      } else if (line.includes('課題') || line.includes('Problem')) {
        problem = lines[i + 1]?.trim() || ''
      } else if (line.includes('解決策') || line.includes('価値提案') || line.includes('Value Prop')) {
        solution = lines[i + 1]?.trim() || ''
      }
    }
    
    return {
      user_id: user?.id || '',
      title: title || 'AI生成企画書',
      problem: problem || userMessages[2] || '',
      solution: solution || userMessages[3] || '',
      target_users: target_users || userMessages[1] || '',
      category: 'その他',
      tags: ['AI生成', '企画書'],
      sketch_urls: [],
      // 企画書の全文を追加フィールドとして保存
      service_name: title,
      service_description: plan.slice(0, 500),
      background_problem: problem,
      main_target: target_users,
      value_proposition: solution,
    }
  }

  const handleSavePlan = async () => {
    if (!user || !generatedPlan) {
      return
    }

    setIsLoading(true)

    try {
      const dataToSubmit = extractDataFromPlan(generatedPlan)
      const res = await saveIdeaFromAI(dataToSubmit, ideaId)
      if (!res.ok || !res.id) {
        console.error('Save error:', res.error)
      } else {
        router.push(`/ideas/${res.id}`)
      }
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'service_overview':
        return 'サービス概要の確認'
      case 'persona':
        return 'ターゲットユーザーの明確化'
      case 'problem':
        return '課題の特定'
      case 'solution':
        return '解決策の検討'
      case 'confirmation':
        return '内容の確認'
      case 'revise':
        return '内容の修正'
      case 'generate_plan':
        return '企画書生成中'
      case 'completed':
        return '企画書完成'
      default:
        return 'アイデア作成中'
    }
  }

  const isConfirmationStep = currentStep === 'confirmation'
  const isGeneratingPlan = currentStep === 'generate_plan'
  const isCompleted = currentStep === 'completed'

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {ideaId ? 'アイデアを編集' : 'アイデア作成アシスタント'}
              </h1>
              <p className="text-sm text-gray-600">{getStepTitle()}</p>
            </div>
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-3xl",
                message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user'
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
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
                    ? 'bg-blue-600 text-white ml-12'
                    : 'bg-gray-100 text-gray-900 mr-12'
                )}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
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
          
          {/* 確認ボタン */}
          {isConfirmationStep && !isLoading && (
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => handleConfirmation(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                はい、問題ありません
              </button>
              <button
                onClick={() => handleConfirmation(false)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                修正が必要です
              </button>
            </div>
          )}

          {/* 企画書表示 */}
          {isCompleted && generatedPlan && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">生成された企画書</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800">{generatedPlan}</div>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleSavePlan}
                  disabled={isLoading}
                  className={cn(
                    "px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading ? '保存中...' : 'この企画書で投稿する'}
                </button>
                <button
                  onClick={() => {
                    setCurrentStep('solution')
                    setGeneratedPlan('')
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  修正する
                </button>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">考え中...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        {!isCompleted && !isConfirmationStep && (
          <div className="p-6 border-t bg-gray-50">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isGeneratingPlan ? "企画書を生成中です..." : "メッセージを入力してください..."}
                disabled={isLoading || isGeneratingPlan}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isGeneratingPlan}
                className={cn(
                  "px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2",
                  (!input.trim() || isLoading || isGeneratingPlan) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                送信
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}