'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { 
  ArrowRight, 
  Users, 
  Star,
  DollarSign,
  MessageSquare,
  Lightbulb,
  Rocket,
  Wallet,
  Clock,
  Smartphone,
  FileText,
  Info,
  Settings,
  ClipboardList,
  HelpCircle
} from 'lucide-react'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'
import { Footer } from '@/components/common/Footer'
import { ScrollHandler } from '@/components/ScrollHandler'

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) return

    // Check authentication
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      // First check if user has enough credits
      const checkResponse = await fetch('/api/chat/sessions', {
        method: 'GET'
      })
      
      if (checkResponse.status === 401) {
        router.push('/auth/login')
        return
      }
      
      const checkData = await checkResponse.json()
      
      if (!checkData.canStart) {
        alert(`クレジットが不足しています。\nAIエージェントチャットの開始には${checkData.creditCost}クレジットが必要です。\n現在のクレジット: ${checkData.currentCredits}`)
        return
      }
      
      // Create new chat session with credit deduction
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: input.length > 50 ? input.substring(0, 50) + '...' : input,
          initialMessage: input
        })
      })
      
      if (response.status === 402) {
        const data = await response.json()
        alert(`クレジットが不足しています。\n必要クレジット: ${data.required}\n現在のクレジット: ${data.current}`)
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Chat session creation failed:', response.status, errorData)
        throw new Error(`Failed to create chat session: ${errorData.error || response.statusText}`)
      }
      
      const { session } = await response.json()
      
      if (session) {
        // Navigate to the new chat
        router.push(`/agents/${session.id}`)
      }
    } catch (error) {
      console.error('Error creating chat session:', error)
      alert('チャットの開始に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <ScrollHandler />
      {/* ヘッダー */}
      <header className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/EnBld_logo_icon_monochrome.svg"
                alt="EMBLD Icon"
                className="h-10 w-10"
              />
              <span className="text-2xl font-black text-black">EMBLD</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8 mr-8">
              <Link 
                href="#service" 
                className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-gray-600 hover:text-black transition-all font-medium"
              >
                <Info className="w-4 h-4" />
                サービス紹介
              </Link>
              <Link 
                href="#features" 
                className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-gray-600 hover:text-black transition-all font-medium"
              >
                <Settings className="w-4 h-4" />
                サービス特徴
              </Link>
              <Link 
                href="#how-it-works" 
                className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-gray-600 hover:text-black transition-all font-medium"
              >
                <ClipboardList className="w-4 h-4" />
                利用手順
              </Link>
              <Link 
                href="#faq" 
                className="flex items-center gap-2 pb-1 border-b-2 border-transparent text-gray-600 hover:text-black transition-all font-medium"
              >
                <HelpCircle className="w-4 h-4" />
                FAQ
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/home"
                className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg transition-all border border-gray-200"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="relative z-10">

      {/* ヒーローセクション - Manusスタイル */}
      <section className="pt-12 pb-20 bg-white min-h-screen flex items-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* メインヘッドライン */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            アイデアをアプリビジネスに<br />
            変えるAIエージェント
          </h1>
          
          {/* サブヘッドライン */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
          EMBLDは、あなたのアイデアを収益性、実現可能性、法務リスクなどを考慮し収益の上がるアプリビジネスへ仕上げるAIエージェントです。
          </p>
          
          {/* プロンプトバー */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="flex items-start gap-4 p-6">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="欲しいアプリを一言で書いてください。"
                    className="flex-1 text-lg bg-transparent border-0 focus:outline-none placeholder-gray-400 text-black resize-none overflow-hidden leading-relaxed"
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rows={1}
                    style={{
                      minHeight: '1.5rem',
                      height: 'auto'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                  <button 
                    className={`p-3 rounded-full text-white transition-colors ${
                      isLoading || !input.trim() 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800'
                    }`}
                    onClick={handleSubmit}
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5 rotate-90" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        

      </section>

      {/* サービス紹介セクション */}
      <section id="service" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              サービス紹介
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            あなたのアイデアがアプリビジネスに。
          </h2>
          
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            EMBLDは、あなたのアイデアや不満、欲求をもとにアプリビジネスへとつなげる<br/>要件定義書を作成するAIエージェントです。<br/>
            提出した要件定義書が承認されれば、EMBLDチームが無償で開発から保守・運用まで担当。<br/>
            完成したアプリから生まれた収益の70%をあなたに還元します。
          </p>

          {/* 動画プレースホルダー */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8 shadow-lg">
              <div className="aspect-video bg-white rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-2"></div>
                  </div>
                  <p className="text-gray-600">サービス紹介動画</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* サービス特徴セクション */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              サービス特徴
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            EMBLDの4つの強み
          </h2>

          {/* 4つの特徴を2×2のグリッドで表示 */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* 特徴1: アイデアから収益化までワンストップ */}
            <div className="bg-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                アイデアから収益化までワンストップ
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                EMBLDは、アイデアの段階からリリース後の収益化までを一気通貫でサポートします。
                思いつきを入力するだけで、AIが要件定義書を作成し、開発・運用までスムーズに進みます。
              </p>
            </div>

            {/* 特徴2: AIがリスクと収益性を診断 */}
            <div className="bg-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                AIがリスクと収益性を診断
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                法務リスク・収益性・実現可能性をAIが自動でチェック。
                ただの「思いつき」ではなく、ビジネスとして成立する形に整えます。
              </p>
            </div>

            {/* 特徴3: 無償で開発、収益を還元 */}
            <div className="bg-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                無償で開発、収益を還元
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                承認されたアイデアは、EMBLDチームが開発費ゼロで開発を担当。
                完成したアプリの収益の70%はアイデア提供者に還元されます。
              </p>
            </div>

            {/* 特徴4: 誰でも使える */}
            <div className="bg-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                誰でも使える
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                エンジニアにとっては「要件定義書ジェネレーター」として、
                非エンジニアにとっては「アイデアをアプリに変える仕組み」として。
                知識がなくても誰でも挑戦できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 利用手順セクション */}
      <section id="how-it-works" className="py-20 relative overflow-hidden bg-white">
        {/* 波形の背景パターン */}
        <div className="absolute inset-0 z-0">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 800">
            {/* 全体に渡る灰色の太い波 - 数を減らして超極太に */}
            <g opacity="0.3">
              {/* 超極太の波を5本だけ配置 */}
              <path fill="none" stroke="#e5e7eb" strokeWidth="300" d="M-100,100 Q200,50 500,100 T1100,100 Q1400,50 1700,100"/>
              <path fill="none" stroke="#f3f4f6" strokeWidth="280" d="M-100,300 Q200,250 500,300 T1100,300 Q1400,250 1700,300"/>
              <path fill="none" stroke="#e5e7eb" strokeWidth="300" d="M-100,500 Q200,450 500,500 T1100,500 Q1400,450 1700,500"/>
              <path fill="none" stroke="#f3f4f6" strokeWidth="280" d="M-100,700 Q200,650 500,700 T1100,700 Q1400,650 1700,700"/>
            </g>
          </svg>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-4">
            <span className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              利用手順
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            EMBLDの使い方
          </h2>

          <div className="max-w-5xl mx-auto space-y-24 mb-16">
            {/* ステップ1 - 左寄せ */}
            <ScrollFadeIn delay={50}>
              <div className="flex justify-start">
                <div className="w-full max-w-3xl">
                  <div className="w-56 h-56 mx-auto mb-0 relative z-10">
                    <img 
                      src="/images/Shiny Happy - Sitting.svg"
                      alt="アイデアを投稿"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="rounded-b-3xl p-10 pt-16 -mt-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                      1. アイデアを入力
                    </h3>
                    <p className="text-xl font-semibold text-gray-800 text-center mb-3">
                      「こんなサービスがあれば良いのに」を入力する
                    </p>
                    <p className="text-lg text-gray-600 text-center leading-relaxed">
                      簡単なアイデアを入力してください。
                      その簡単なアイデアを企画案になるまで、
                      自社開発のAIエージェントがアイデアを収益性の高い企画書に磨き上げます。
                    </p>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>

            {/* ステップ2 - 右寄せ */}
            <ScrollFadeIn delay={50}>
              <div className="flex justify-end">
                <div className="w-full max-w-3xl">
                  <div className="w-56 h-56 mx-auto mb-0 relative z-10">
                    <img 
                      src="/images/Shiny Happy - Stats and Graphs.svg"
                      alt="アイデアのブラッシュアップ"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="rounded-b-3xl p-10 pt-16 -mt-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                      2. 企画書を提出
                    </h3>
                    <p className="text-xl font-semibold text-gray-800 text-center mb-3">
                      EMBLDチームに開発を依頼する
                    </p>
                    <p className="text-lg text-gray-600 text-center leading-relaxed">
                      企画書を提出し、EMBLDチームに開発を依頼します。<br/>
                      審査の後、承認されれば開発が始まります。<br/>
                      もちろん、作成した企画書をもとに自身で開発することも可能です。
                    </p>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>

            {/* ステップ3 - 左寄せ */}
            <ScrollFadeIn delay={50}>
              <div className="flex justify-start">
                <div className="w-full max-w-3xl">
                  <div className="w-56 h-56 mx-auto mb-0 relative z-10">
                    <img 
                      src="/images/Shiny Happy - Socializing.svg"
                      alt="サービスのテスト"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="rounded-b-3xl p-10 pt-16 -mt-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                      3. アプリの改善
                    </h3>
                    <p className="text-xl font-semibold text-gray-800 text-center mb-3">
                      開発されたアプリを改善
                    </p>
                    <p className="text-lg text-gray-600 text-center leading-relaxed">
                      EMBLDチームによるアプリの開発が完了すると、
                      ユーザーのフィードバックをもとにアプリを改善します。
                      あなたの意見をもとにより良いアプリに仕上げます。
                    </p>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>

            {/* ステップ4 - 右寄せ */}
            <ScrollFadeIn delay={50}>
              <div className="flex justify-end">
                <div className="w-full max-w-3xl">
                  <div className="w-56 h-56 mx-auto mb-0 relative z-10">
                    <img 
                      src="/images/Shiny Happy - Home Vacation.svg"
                      alt="収益を受け取る"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="rounded-b-3xl p-10 pt-16 -mt-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                      4. 収益を受け取る
                    </h3>
                    <p className="text-xl font-semibold text-gray-800 text-center mb-3">
                      アプリ収益の70%が還元
                    </p>
                    <p className="text-lg text-gray-600 text-center leading-relaxed">
                      アプリがリリースされ収益が発生すると、
                      その70%があなたに還元されます。<br/>
                      あなたが寝ている間も収益が発生します。
                    </p>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* CTA セクション - 登録を促す */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            今すぐアイデアを収益化しよう
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            アイデアを入力して、
            あなたのアイデアが収益を生み出す瞬間を体験してください。
          </p>
          
          <Link
            href="/home"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ セクション */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              FAQ
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            よくある質問
          </h2>
          
          <div className="space-y-6">
            {/* Q1 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. EMBLDはどんなサービスですか？
              </h3>
              <p className="text-gray-600">
                A. EMBLDは、あなたのアイデアを要件定義書に変換するAIエージェントです。
                作成された要件定義書が承認されれば、EMBLDチームが無償で開発・運用を行い、
                アプリから生まれる収益の70%をアイデア提供者に還元します。
              </p>
            </div>
            
            {/* Q2 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 要件定義書の作成に費用はかかりますか？
              </h3>
              <p className="text-gray-600">
                A. 基本的な要件定義書の作成は無料です。
                AIエージェントとのチャットには一定のクレジットを消費しますが、
                初回登録時に無料クレジットが付与されます。
              </p>
            </div>
            
            {/* Q3 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 要件定義書はどのように審査されますか？
              </h3>
              <p className="text-gray-600">
                A. AIが法務リスク・収益性・実現可能性を自動診断した後、
                EMBLDチームが市場性や技術的な観点から最終審査を行います。
                審査結果は通常1週間以内にお知らせします。
              </p>
            </div>
            
            {/* Q4 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 収益の70%はどのように支払われますか？
              </h3>
              <p className="text-gray-600">
                A. アプリから収益が発生した場合、その70%が毎月自動的にあなたの指定口座に振り込まれます。
                振込手数料はEMBLDが負担します。
                最低支払い金額は5,000円からとなります。
              </p>
            </div>
            
            {/* Q5 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 作成した要件定義書を自分で開発に使うことはできますか？
              </h3>
              <p className="text-gray-600">
                A. はい、可能です。AIが作成した要件定義書は自由にダウンロード・利用できます。
                自身での開発や、他の開発チームへの依頼にもご活用いただけます。
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">その他のご質問は</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              お問い合わせページへ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <Footer />
      </div>
    </div>
  )
}