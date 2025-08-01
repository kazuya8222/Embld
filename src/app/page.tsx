import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
  FileText
} from 'lucide-react'
import { ScrollFadeIn } from '@/components/ScrollFadeIn'

export default async function LandingPage() {
  // サーバーサイドで認証状態をチェック
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // ログイン済みの場合はホームへリダイレクト
  if (session) {
    redirect('/home')
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/EnBld_logo_icon_monochrome.svg"
                alt="EMBLD Icon"
                className="h-10 w-10"
              />
              <span className="text-2xl font-black text-gray-900">EMBLD</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8 mr-8">
              <Link href="#service" className="text-gray-600 hover:text-gray-900 font-medium">サービス紹介</Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium">サービス特徴</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">利用手順</Link>
              <Link href="#faq" className="text-gray-600 hover:text-gray-900 font-medium">FAQ</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg transition-all"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション - シンプルな背景 */}
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 左側：テキストコンテンツ */}
            <div>

              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                アイデアが収入に<br />
                個人開発時代の<br />
                新しい稼ぎ方を実現
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                アイデアを投稿するだけで、サービス収益の30%が還元されます。<br />
                サービス化に上限はありません。素晴らしいアイデアはいくつでもサービス化いたします。
              </p>
              
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                アイデアを投稿する
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* 右側：イラスト */}
            <div className="relative">
              <div className="relative aspect-square">
                <img 
                  src="/images/Shiny Happy - Party Time.svg"
                  alt="エンビルドで収益化を実現"
                  className="w-full h-full object-contain floating-animation scale-110"
                />
              </div>
              {/* 装飾的な要素 */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-100 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* サービス紹介セクション */}
      <section id="service" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
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
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              サービス特徴
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            選考なしで収益化と即開発。
            <br />
            最短15分でアイデア投稿完了
          </h2>
          
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            アイデア投稿は初回最短15分、2回目以降は最短5分で完了します。
            <br />
            ※面接や書類選考が不要なので、アイデアが採用されれば即座に開発が開始されます。審査結果を待つ必要もありません。
          </p>

          {/* 特徴の図解 */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* 左側：応募 */}
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                    <FileText className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">アイデア投稿</p>
                </div>
                
                {/* 矢印 */}
                <div className="flex items-center justify-center">
                  <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2">
                    <span>エンビルド</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                
                {/* 右側：マッチング */}
                <div className="text-center md:col-start-2">
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                    <Users className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">開発開始</p>
                </div>
              </div>
              
              {/* 下部の説明 */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-bold text-gray-700">履歴書</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-bold text-gray-700">面接</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-bold text-gray-700">合否待ち</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-8">
            ※一部のアイデアは市場性や技術的な観点から採用されない場合もあります。
            <br />
            また、類似のアプリがすでに開発中の場合もあります。
          </p>
        </div>
      </section>

      {/* 利用手順セクション */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              利用手順
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            エンビルドの使い方
          </h2>

          <div className="max-w-3xl mx-auto space-y-20 mb-16">
            {/* ステップ1 - 左寄せ */}
            <ScrollFadeIn delay={50}>
              <div className="flex justify-start">
                <div className="w-full max-w-lg">
                  <div className="p-8">
                    <div className="w-44 h-44 mx-auto mb-6">
                      <img 
                        src="/images/Shiny Happy - Sitting.svg"
                        alt="アイデアを投稿"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                      1. アイデアを投稿
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 text-center mb-2">
                      「こんなサービスがあれば良いのに」を投稿する
                    </p>
                    <p className="text-base text-gray-600 text-center leading-relaxed">
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
                <div className="w-full max-w-lg">
                  <div className="p-8">
                    <div className="w-44 h-44 mx-auto mb-6">
                      <img 
                        src="/images/Shiny Happy - Stats and Graphs.svg"
                        alt="アイデアのブラッシュアップ"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                      2. アイデアのブラッシュアップ
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 text-center mb-2">
                      他ユーザーの評価や改善案をもらう
                    </p>
                    <p className="text-base text-gray-600 text-center leading-relaxed">
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
                <div className="w-full max-w-lg">
                  <div className="p-8">
                    <div className="w-44 h-44 mx-auto mb-6">
                      <img 
                        src="/images/Shiny Happy - Party Time.svg"
                        alt="サービスのテスト"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                      3. サービスのテスト
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 text-center mb-2">
                      開発されたサービスをテスト
                    </p>
                    <p className="text-base text-gray-600 text-center leading-relaxed">
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
                <div className="w-full max-w-lg">
                  <div className="p-8">
                    <div className="w-44 h-44 mx-auto mb-6">
                      <img 
                        src="/images/Shiny Happy - Home Vacation.svg"
                        alt="収益を受け取る"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                      4. 収益を受け取る
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 text-center mb-2">
                      サービス収益の30%が還元
                    </p>
                    <p className="text-base text-gray-600 text-center leading-relaxed">
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-teal-400 to-blue-500"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            今すぐアイデアを収益化しよう
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            登録は無料。アイデアを投稿して、
            あなたのアイデアが収益を生み出す瞬間を体験してください。
          </p>
          
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-white/70 mt-4">
            ※クレジットカード不要・月額費用なし
          </p>
        </div>
      </section>

      {/* FAQ セクション */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
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
              href="#"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              お問い合わせページへ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/images/EnBld_logo_icon_monochrome.svg"
                  alt="EMBLD Icon"
                  className="h-10 w-10 brightness-0 invert"
                />
                <span className="text-2xl font-black text-white">EMBLD</span>
              </div>
              <p className="text-sm">
                アイデアと開発者をつなぐ
                収益シェアプラットフォーム
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">サービス</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/ideas/new" className="hover:text-white">アイデア投稿</Link></li>
                <li><Link href="/apps" className="hover:text-white">完成アプリ一覧</Link></li>
                <li><Link href="/premium" className="hover:text-white">プレミアムプラン</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">サポート</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">ヘルプセンター</a></li>
                <li><a href="#" className="hover:text-white">お問い合わせ</a></li>
                <li><a href="#" className="hover:text-white">よくある質問</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">法的情報</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/legal/privacy" className="hover:text-white">プライバシーポリシー</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white">利用規約</Link></li>
                <li><a href="#" className="hover:text-white">特定商取引法</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 EmBld. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}