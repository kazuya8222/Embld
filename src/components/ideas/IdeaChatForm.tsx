'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { Send, Bot, User, Loader2, CheckCircle, FileText } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type ChatStep = 'service_overview' | 'persona' | 'problem' | 'solution' | 'confirmation' | 'revise' | 'generate_plan' | 'plan_confirmation' | 'plan_revision' | 'completed'

interface IdeaChatFormProps {
  initialData?: any
  ideaId?: string
}

export function IdeaChatForm({ initialData, ideaId }: IdeaChatFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // ユーザー状態をデバッグ
  console.log('Current auth user in component:', user)
  
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

  // ステップ変更を監視
  useEffect(() => {
    console.log('Step changed to:', currentStep)
    console.log('Generated plan exists:', !!generatedPlan)
  }, [currentStep, generatedPlan])

  const sendMessage = async (messageContent: string, overrideStep?: ChatStep) => {
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

    // ステップのオーバーライドがある場合はそれを使用、なければ現在のステップを使用
    const stepToUse = overrideStep || currentStep

    try {
      const requestBody = {
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        step: stepToUse
      }
      
      console.log('Sending API request:', {
        step: stepToUse,
        currentStep: currentStep,
        messagesCount: requestBody.messages.length,
        lastMessage: requestBody.messages[requestBody.messages.length - 1]
      })

      const response = await fetch('/api/idea-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        console.error('API request failed:', response.status, response.statusText)
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // ステップの進行を管理
      console.log('Processing step transition from:', stepToUse)
      switch (stepToUse) {
        case 'service_overview':
          console.log('Moving to persona step')
          setCurrentStep('persona')
          break
        case 'persona':
          console.log('Moving to problem step')
          setCurrentStep('problem')
          break
        case 'problem':
          console.log('Moving to solution step')
          setCurrentStep('solution')
          break
        case 'solution':
          console.log('Moving to confirmation step')
          setCurrentStep('confirmation')
          break
        case 'confirmation':
          console.log('Staying in confirmation step - waiting for user choice')
          // ペルソナ/課題/解決策の確認段階 - 2択ボタンで処理
          break
        case 'revise':
          console.log('Moving back to confirmation step')
          setCurrentStep('confirmation')
          break
        case 'generate_plan':
          console.log('Plan generated, moving to plan_confirmation step')
          console.log('Generated plan length:', data.response?.length)
          console.log('Generated plan content:', data.response?.substring(0, 100) + '...')
          if (data.response) {
            setGeneratedPlan(data.response)
            setCurrentStep('plan_confirmation')
          } else {
            console.error('No response content received from API')
          }
          break
        case 'plan_revision':
          console.log('Plan revised, moving to plan_confirmation step')
          setGeneratedPlan(data.response)
          setCurrentStep('plan_confirmation')
          break
      }
      console.log('Step transition completed, new step should be:', 
        stepToUse === 'generate_plan' ? 'plan_confirmation' : 
        stepToUse === 'plan_revision' ? 'plan_confirmation' : 
        'other')

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

  const handleConfirmation = (isConfirmed: boolean) => {
    if (isConfirmed) {
      setCurrentStep('generate_plan')
      sendMessage('はい、問題ありません。企画書を生成してください。', 'generate_plan')
    } else {
      setCurrentStep('revise')
      sendMessage('いいえ、修正が必要です。どの部分を修正したいか教えてください。', 'revise')
    }
  }

  const handlePlanConfirmation = (isConfirmed: boolean) => {
    console.log('handlePlanConfirmation called with:', isConfirmed)
    if (isConfirmed) {
      // 企画書が承認されたので、投稿処理を実行
      console.log('Calling handleSavePlan...')
      handleSavePlan()
    } else {
      setCurrentStep('plan_revision')
      sendMessage('修正が必要です。どの部分を修正したいか具体的に教えてください。', 'plan_revision')
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
    console.log('handleSavePlan called')
    console.log('User from AuthProvider:', user)
    console.log('Generated plan exists:', !!generatedPlan)
    console.log('Generated plan length:', generatedPlan?.length)
    
    // ローカルストレージの詳細な状況を確認
    if (typeof window !== 'undefined') {
      console.log('=== LocalStorage Debug ===')
      console.log('All localStorage keys:', Object.keys(localStorage))
      const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'))
      console.log('Supabase related keys:', supabaseKeys)
      
      // Supabaseの認証トークンを直接確認
      supabaseKeys.forEach(key => {
        const value = localStorage.getItem(key)
        console.log(`${key}:`, value ? `exists (length: ${value.length})` : 'null')
      })
      
      // セッションストレージも確認
      console.log('SessionStorage keys:', Object.keys(sessionStorage))
      console.log('=========================')
    }
    
    // Cookieの状況も確認
    if (typeof window !== 'undefined') {
      console.log('Document cookies:', document.cookie)
      const supabaseCookies = document.cookie.split('; ').filter(c => c.includes('supabase'))
      console.log('Supabase cookies:', supabaseCookies)
    }
    
    // Supabaseクライアントの認証状態を確認
    console.log('Checking supabase auth...')
    
    // 新しいクライアントインスタンスを作成（強制的に新規作成）
    const supabase = createClient(true)
    console.log('Supabase client created')
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Supabase session:', { session, sessionError })
      
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      console.log('Supabase user:', { currentUser, authError })
    } catch (error) {
      console.error('Error getting auth info:', error)
    }
    
    // currentUserが定義されていない可能性があるため、スコープ外で定義
    let currentUser = null
    try {
      const authResult = await supabase.auth.getUser()
      currentUser = authResult.data.user
    } catch (error) {
      console.error('Failed to get current user:', error)
    }
    
    // ユーザーがいない場合は処理を中断
    if (!currentUser && !user) {
      console.error('No authenticated user found')
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'ログインが必要です。ログインしてから再度お試しください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsLoading(false)
      return
    }
    
    if (!generatedPlan) {
      console.log('No generated plan')
      return
    }

    setIsLoading(true)

    try {
      // 実際のユーザーIDを使用
      const actualUserId = currentUser?.id || user?.id
      console.log('Using user ID:', actualUserId)

      const dataToSubmit = {
        ...extractDataFromPlan(generatedPlan),
        user_id: actualUserId // 確実にuser_idを設定
      }
      console.log('Data to submit:', dataToSubmit)

      let result
      if (ideaId) {
        result = await supabase
          .from('ideas')
          .update(dataToSubmit)
          .eq('id', ideaId)
          .eq('user_id', actualUserId)
          .select()
          .single()
      } else {
        result = await supabase
          .from('ideas')
          .insert(dataToSubmit)
          .select()
          .single()
      }

      console.log('Database operation result:', result)

      if (result.error) {
        console.error('Save error:', result.error)
        // エラーメッセージを表示
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `エラーが発生しました: ${result.error.message}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      } else {
        setCurrentStep('completed')
        const targetId = ideaId || result.data?.id
        setTimeout(() => {
          if (targetId) {
            router.push(`/ideas/${targetId}`)
          }
        }, 2000) // 2秒後にリダイレクト
      }
    } catch (error) {
      console.error('Save failed:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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
      case 'plan_confirmation':
        return '企画書の確認'
      case 'plan_revision':
        return '企画書の修正'
      case 'completed':
        return 'アイデア投稿完了'
      default:
        return 'アイデア作成中'
    }
  }

  const isConfirmationStep = currentStep === 'confirmation'
  const isPlanConfirmationStep = currentStep === 'plan_confirmation'
  const isGeneratingPlan = currentStep === 'generate_plan'
  const isCompleted = currentStep === 'completed'

  // デバッグ用
  console.log('Current step:', currentStep)
  console.log('isPlanConfirmationStep:', isPlanConfirmationStep)
  console.log('generatedPlan exists:', !!generatedPlan)

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
          
          {/* 最初の確認ボタン */}
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

          {/* 企画書確認ボタン */}
          {(isPlanConfirmationStep || (generatedPlan && (currentStep === 'generate_plan' || currentStep === 'plan_revision'))) && !isLoading && generatedPlan && (
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => handlePlanConfirmation(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                この内容で投稿する
              </button>
              <button
                onClick={() => handlePlanConfirmation(false)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                修正が必要です
              </button>
            </div>
          )}

          {/* 企画書表示 */}
          {(isPlanConfirmationStep || currentStep === 'plan_revision') && generatedPlan && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">生成された企画書</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800">{generatedPlan}</div>
              </div>
            </div>
          )}

          {/* 投稿完了メッセージ */}
          {isCompleted && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">アイデアの投稿が完了しました！</h3>
              </div>
              <p className="text-green-800">
                企画書が正常に投稿されました。2秒後にアイデア詳細ページにリダイレクトします。
              </p>
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
        {!isCompleted && !isConfirmationStep && !isPlanConfirmationStep && (
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