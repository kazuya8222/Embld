import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowRight, 
  Users, 
  Sparkles,
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
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-2 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">EmBld</span>
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

      {/* ヒーローセクション - 青と緑のグラデーション背景 */}
      <section className="pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-teal-400 to-green-500"></div>
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 200" className="w-full">
            <path fill="#ffffff" d="M0,160L48,144C96,128,192,96,288,85.3C384,75,480,85,576,101.3C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"></path>
          </svg>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              EmBld
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              EmBldは「時間がない」や「技術がない」人のための
              <br />
              アイデア収益化サービスです。
            </p>

            {/* イラストプレースホルダー */}
            <div className="max-w-4xl mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
              <div className="flex justify-center items-center space-x-4 md:space-x-8">
                {/* 人物イラストのプレースホルダー */}
                <div className="text-center">
                  <div className="w-24 h-32 md:w-32 md:h-40 bg-white/30 rounded-lg mb-2 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white/60" />
                  </div>
                  <p className="text-sm text-white/80">アイデアを持つ人</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-32 md:w-32 md:h-40 bg-white/30 rounded-lg mb-2 flex items-center justify-center">
                    <Smartphone className="w-12 h-12 text-white/60" />
                  </div>
                  <p className="text-sm text-white/80">開発者</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-32 md:w-32 md:h-40 bg-white/30 rounded-lg mb-2 flex items-center justify-center">
                    <Rocket className="w-12 h-12 text-white/60" />
                  </div>
                  <p className="text-sm text-white/80">起業家</p>
                </div>
              </div>
            </div>
          </div>

          {/* QRコードとアプリダウンロードカード */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                <Sparkles className="w-4 h-4" />
                <span>お仕事の最新情報を見逃さない</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                EmBldの<br />アプリができました！
              </h3>
              <p className="text-sm text-gray-600 mb-4">右のQRから今すぐダウンロード</p>
              {/* QRコードプレースホルダー */}
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-gray-500 text-xs">QRコード</span>
              </div>
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
            EmBldではすぐに働ける優秀な開発者を探せるので、「急にアイデアが浮かんだ」
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
            EmBldの使い方
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* ステップ1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Lightbulb className="w-16 h-16 text-blue-600" />
              </div>
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

            {/* ステップ2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-32 h-32 bg-green-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Users className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                2. EmBldが開発
              </h3>
              <p className="text-gray-600">
                EmBldがアイデアを分析し、実現可能な
                仕様に落とし込みます。開発から
                リリースまで、すべてEmBldが
                責任を持って実行します。
              </p>
            </div>

            {/* ステップ3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-32 h-32 bg-orange-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <DollarSign className="w-16 h-16 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                3. 収益を受け取る
              </h3>
              <p className="text-gray-600">
                アプリがリリースされ収益が発生すると、
                その20%があなたに還元されます。
                毎月自動的に振り込まれ、
                振込手数料も0円です。
              </p>
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
                    <span>EmBld</span>
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
            あなたのアイデアの進捗をEmBldでお知らせ
          </h2>
          
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            投稿したアイデアの開発状況や収益レポートをEmBldでお知らせします。
            <br />
            さらに、あなたの興味分野に合わせた新機能やキャンペーンもご案内。EmBldを使うほど便利でお得にご利用いただけます。
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
                "急にアイデアが浮かんだ
                <br />
                ので、明日実現したい"
              </p>
              <div className="w-32 h-40 bg-white/20 rounded-lg mx-auto flex items-center justify-center">
                <Users className="w-16 h-16 text-white/60" />
              </div>
            </div>

            {/* カード2 */}
            <div className="bg-blue-500 text-white rounded-2xl p-8 text-center">
              <p className="text-lg font-bold mb-6">
                "ランチタイムの
                <br />
                3時間だけ実現したい"
              </p>
              <div className="w-32 h-40 bg-white/20 rounded-lg mx-auto flex items-center justify-center">
                <Clock className="w-16 h-16 text-white/60" />
              </div>
            </div>

            {/* カード3 */}
            <div className="bg-green-500 text-white rounded-2xl p-8 text-center">
              <p className="text-lg font-bold mb-6">
                "カード使いすぎちゃった！
                <br />
                もう少しお金がほしい"
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
        <div className="absolute top-0 left-0 w-full">
          <svg viewBox="0 0 1440 100" className="w-full">
            <path fill="#f9fafb" d="M0,64L48,58.7C96,53,192,43,288,37.3C384,32,480,32,576,37.3C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        
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
                <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-2 rounded-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-white">EmBld</span>
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