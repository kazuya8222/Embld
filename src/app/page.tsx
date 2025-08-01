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
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">使い方</Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium">特徴</Link>
              <Link href="#faq" className="text-gray-600 hover:text-gray-900 font-medium">こんな人におすすめ</Link>
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
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded-full">アイデア投稿</span>
                <span className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded-full">収益シェア</span>
                <span className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded-full">AI支援</span>
                <span className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded-full">マーケティング</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                あなたのアイデアが<br />
                毎月の収入に変わる<br />
                <span className="text-blue-600">収益30%</span>を永続的に！
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                エンビルドなら、アイデアを投稿するだけで<br />
                開発・運営・収益化まですべてお任せ。売上の30%が永続的に還元されます。
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
            時間や技術がなくても収益化できる
          </h2>
          
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            エンビルドではすぐに働ける優秀な開発者を探せるので、「急にアイデアが浮かんだ」
            <br />
            「時間がない」そんな悩みを持つ方でも効率的に収益化できます。
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

      {/* 使い方セクション */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              サービス使い方
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            エンビルドの使い方
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* ステップ1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8">
                <div className="w-32 h-32 mx-auto">
                  <img 
                    src="/images/Shiny Happy - Sitting.svg"
                    alt="アイデアを投稿"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  1. アイデアを投稿
                </h3>
                <p className="text-gray-600">
                  あなたの経験や気付きから生まれた
                  アイデアを投稿します。企画や要件定義は
                  AIがサポートするので、思いついたことを
                  そのまま投稿できます。
                </p>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8">
                <div className="w-32 h-32 mx-auto">
                  <img 
                    src="/images/Shiny Happy - Stats and Graphs.svg"
                    alt="エンビルドが開発"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  2. エンビルドが開発
                </h3>
                <p className="text-gray-600">
                  エンビルドがアイデアを分析し、実現可能な
                  仕様に落とし込みます。開発から
                  リリースまで、すべてエンビルドが
                  責任を持って実行します。
                </p>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8">
                <div className="w-32 h-32 mx-auto">
                  <img 
                    src="/images/Shiny Happy - Home Vacation.svg"
                    alt="収益を受け取る"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  3. 収益を受け取る
                </h3>
                <p className="text-gray-600">
                  アプリがリリースされ収益が発生すると、
                  その30%があなたに還元されます。
                  毎月自動的に振り込まれ、
                  振込手数料も0円です。
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            ※一部のアイデアは市場性や技術的な観点から採用されない場合もあります。
          </p>
        </div>
      </section>

      {/* 特徴セクション - 青い背景 */}
      <section id="features" className="py-20 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              サービス特徴
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            選考なしで収益化と即開発。
            <br />
            最短15分でアイデア投稿完了
          </h2>
          
          <p className="text-center text-blue-100 mb-16 max-w-3xl mx-auto">
            アイデア投稿は初回最短15分、2回目以降は最短5分で完了します。
            <br />
            ※面接や書類選考が不要なので、アイデアが採用されれば即座に開発が開始されます。審査結果を待つ必要もありません。
          </p>

          {/* 特徴の図解 */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* 左側：応募 */}
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold">アイデア投稿</p>
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
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold">開発開始</p>
                </div>
              </div>
              
              {/* 下部の説明 */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-blue-700 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-bold">履歴書</p>
                </div>
                <div className="bg-blue-700 rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-bold">面接</p>
                </div>
                <div className="bg-blue-700 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-bold">合否待ち</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-xs text-blue-200 mt-8">
            ※一部のアイデアは市場性や技術的な観点から採用されない場合もあります。
            <br />
            また、類似のアプリがすでに開発中の場合もあります。
          </p>
        </div>
      </section>

      {/* こんな人におすすめセクション */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              サービス特徴2
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            優れたアイデアから優先的に開発をスタート
          </h2>
          
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            投稿されたアイデアは、市場性・実現可能性・収益性を基準に評価され、
            <br />
            優れたものから順次開発を開始。開発状況は随時お知らせします。
          </p>

          {/* スマートフォンのモックアップ */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="aspect-[9/16] bg-gray-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-16 h-16 text-gray-400" />
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            こんな人におすすめ
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {/* カード1 */}
            <div className="bg-green-500 text-white rounded-2xl p-8 text-center">
              <p className="text-lg font-bold mb-6">
                &ldquo;本業以外の収入源が
                <br />
                欲しいけど時間がない&rdquo;
              </p>
              <div className="w-32 h-40 bg-white/20 rounded-lg mx-auto flex items-center justify-center">
                <Users className="w-16 h-16 text-white/60" />
              </div>
            </div>

            {/* カード2 */}
            <div className="bg-blue-500 text-white rounded-2xl p-8 text-center">
              <p className="text-lg font-bold mb-6">
                &ldquo;アイデアはあるけど
                <br />
                開発スキルがない&rdquo;
              </p>
              <div className="w-32 h-40 bg-white/20 rounded-lg mx-auto flex items-center justify-center">
                <Lightbulb className="w-16 h-16 text-white/60" />
              </div>
            </div>

            {/* カード3 */}
            <div className="bg-green-500 text-white rounded-2xl p-8 text-center">
              <p className="text-lg font-bold mb-6">
                &ldquo;将来の資産として
                <br />
                継続的な収入が欲しい&rdquo;
              </p>
              <div className="w-32 h-40 bg-white/20 rounded-lg mx-auto flex items-center justify-center">
                <Wallet className="w-16 h-16 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-teal-400 to-blue-500"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            いつでもすぐにアイデアを収益化できる
          </h2>
          
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            サービストップはこちら
            <ArrowRight className="w-5 h-5" />
          </Link>
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