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
        {/* Animated background dots */}
        <div className="absolute inset-0">
          <div className="stars"></div>
          <div className="twinkling"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* メインヘッドライン */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            アイデアをアプリビジネスに<br />
            変えるAIエージェント
          </h1>
          
          {/* サブヘッドライン */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            EMBLDは、アイデアを収益へつなぐAIプラットフォームです。
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
                    className="flex-1 text-lg bg-transparent border-0 focus:outline-none placeholder-gray-500 text-black resize-none overflow-hidden leading-relaxed"
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
        
        {/* CSS アニメーション */}
        <style jsx>{`
          .stars {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 120%;
            transform: rotate(-45deg);
            background-image: 
              radial-gradient(2px 2px at 20px 30px, rgba(0,0,0,0.3), transparent),
              radial-gradient(2px 2px at 40px 70px, rgba(0,0,0,0.25), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(0,0,0,0.35), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(0,0,0,0.3), transparent),
              radial-gradient(2px 2px at 160px 30px, rgba(0,0,0,0.25), transparent);
            background-repeat: repeat;
            background-size: 200px 100px;
            animation: move-stars 20s linear infinite;
          }
          
          .twinkling {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 120%;
            transform: rotate(-45deg);
            background-image: 
              radial-gradient(1px 1px at 25px 25px, rgba(0,0,0,0.4), transparent),
              radial-gradient(1px 1px at 50px 75px, rgba(0,0,0,0.3), transparent),
              radial-gradient(1px 1px at 75px 25px, rgba(0,0,0,0.35), transparent),
              radial-gradient(1px 1px at 100px 75px, rgba(0,0,0,0.25), transparent);
            background-repeat: repeat;
            background-size: 150px 100px;
            animation: move-twinkling 30s linear infinite;
          }
          
          @keyframes move-stars {
            from { 
              transform: rotate(-45deg) translateY(0px); 
            }
            to { 
              transform: rotate(-45deg) translateY(-2000px); 
            }
          }
          
          @keyframes move-twinkling {
            from { 
              transform: rotate(-45deg) translateY(0px); 
            }
            to { 
              transform: rotate(-45deg) translateY(-1000px); 
            }
          }
        `}</style>
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
            あなたのアイデアがサービスに。
          </h2>
          
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            サービスで発生した収益があなたに還元されます。
            アイデアを投稿すると、他のユーザによって評価・改善案提出が行われます。
            <br />
            それらを基に、β版開発が行われ、リリース前のテスト・改善まで行います。
            <br />
            以上が完了したら、リリースし、収益化が始まります。サービスにより発生した収益を分配します。
            <br />
            サービス開発は、優秀なエンジニアが担当するので、開発の質に関しては心配不要です。
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
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            質の高いサービス開発に簡単に参画
          </h2>
          
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto text-lg">
            誰でも簡単に、質の高いサービス開発に参画できる仕組みを提供しています
          </p>

          {/* 3つの特徴を横並びで表示 */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 特徴1: 短時間でアイデアを投稿 */}
            <div className="bg-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32">
                  <img 
                    src="/images/Shiny Happy - Soda.svg"
                    alt="隙間時間にアイデアを投稿"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                隙間時間にアイデアを投稿
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                隙間時間で気軽に投稿できます。
                <br />
                通勤時間や休憩時間を有効活用しましょう。
              </p>
            </div>

                        {/* 特徴2: 自社開発AIがサービス化をサポート */}
            <div className="bg-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32">
                  <img 
                    src="/images/Shiny Happy - Graph.svg"
                    alt="AIがサービス化をサポート"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                AIがサービス化をサポート
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                 AIがアイデアの質を向上。あなたの思いつきを企画案レベルまでブラッシュアップします。誰でも質の高い提案が可能に。
              </p>
            </div>

            {/* 特徴3: 開発は優秀なエンジニアが担当 */}
            <div className="bg-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32">
                  <img 
                    src="/images/Shiny Happy - Lamp.svg"
                    alt="開発は優秀なエンジニアが担当"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                開発は優秀なエンジニアが担当
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                サービスの使用感はプロのエンジニアが担保。技術的な心配は不要で、アイデアに集中できる環境を提供します。
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
            エンビルドの使い方
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
                      1. アイデアを投稿
                    </h3>
                    <p className="text-xl font-semibold text-gray-800 text-center mb-3">
                      「こんなサービスがあれば良いのに」を投稿する
                    </p>
                    <p className="text-lg text-gray-600 text-center leading-relaxed">
                      簡単なアイデアを投稿してください。
                      その簡単なアイデアを企画案になるまで、
                      自社開発のAIがサポートします。
                      みんながわかる形にすることを目指します。
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
                      2. アイデアのブラッシュアップ
                    </h3>
                    <p className="text-xl font-semibold text-gray-800 text-center mb-3">
                      他ユーザーの評価や改善案をもらう
                    </p>
                    <p className="text-lg text-gray-600 text-center leading-relaxed">
                      投稿されたアイデアは、コミュニティ内で
                      共有されます。他のユーザーからの
                      評価や改善案を受け取り、
                      より良いアイデアに磨き上げます。
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
                      3. サービスのテスト
                    </h3>
                    <p className="text-xl font-semibold text-gray-800 text-center mb-3">
                      開発されたサービスをテスト
                    </p>
                    <p className="text-lg text-gray-600 text-center leading-relaxed">
                      開発されたサービスのテストをし、
                      使用感からさらなるブラッシュアップを
                      行います。実際に使ってみて、
                      より使いやすいサービスに改善します。
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
                      サービス収益の30%が還元
                    </p>
                    <p className="text-lg text-gray-600 text-center leading-relaxed">
                      アプリがリリースされ収益が発生すると、
                      その30%があなたに還元されます。
                      毎月自動的に振り込まれ、
                      振込手数料も0円です。
                    </p>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          </div>

          <p className="text-center text-sm text-gray-500">
            ※一部のアイデアは市場性や技術的な観点から採用されない場合もあります。
          </p>
        </div>
      </section>

      {/* CTA セクション - 登録を促す */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            今すぐアイデアを収益化しよう
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            アイデアを投稿して、
            あなたのアイデアが収益を生み出す瞬間を体験してください。
          </p>
          
          <Link
            href="/home"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 border border-gray-200"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-gray-600 mt-4">
            ※クレジットカード不要・月額費用なし
          </p>
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
                Q. アイデアを投稿するのに費用はかかりますか？
              </h3>
              <p className="text-gray-600">
                A. いいえ、アイデアの投稿は完全無料です。月額費用や初期費用は一切かかりません。
                収益が発生した場合のみ、その30%を還元する仕組みです。
              </p>
            </div>
            
            {/* Q2 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. どんなアイデアでも投稿できますか？
              </h3>
              <p className="text-gray-600">
                A. 基本的にはどんなアイデアでも投稿可能です。
                ただし、法令に違反するものや公序良俗に反するものは採用されません。
                また、技術的に実現困難なものや市場性が見込めないものは開発されない場合があります。
              </p>
            </div>
            
            {/* Q3 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. アイデアが採用されなかった場合はどうなりますか？
              </h3>
              <p className="text-gray-600">
                A. アイデアが採用されなかった場合でも、費用は一切発生しません。
                また、フィードバックを参考に改善して再投稿することも可能です。
                何度でも挑戦できます。
              </p>
            </div>
            
            {/* Q4 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 収益の支払いはどのように行われますか？
              </h3>
              <p className="text-gray-600">
                A. サービスから収益が発生した場合、その30%が毎月自動的にあなたの指定口座に振り込まれます。
                振込手数料は弊社が負担するため、0円です。
                最低支払い金額は1,000円からとなります。
              </p>
            </div>
            
            {/* Q5 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 開発の進捗は確認できますか？
              </h3>
              <p className="text-gray-600">
                A. はい、マイページから開発の進捗状況をリアルタイムで確認できます。
                また、重要な節目では通知も送られるため、
                常に最新の状況を把握できます。
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