import Link from 'next/link'
import { 
  ArrowRight, 
  Check, 
  TrendingUp, 
  Shield, 
  Users, 
  Sparkles,
  ChevronRight,
  Star,
  DollarSign,
  Zap,
  MessageSquare,
  Award
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Embld</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">

          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            アイデアが<span className="text-primary-600">収益</span>に変わる
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            「こんなアプリがあったらいいな」を投稿するだけ。
            Embldがあなたのアイデアを実現し、
            アプリ収益の<span className="font-bold text-gray-900">20%があなたに還元</span>されます。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg"
            >
              無料でアイデアを投稿する
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-gray-700 px-6 py-3 font-medium hover:text-primary-600 transition-colors"
            >
              仕組みを詳しく見る
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            ※ クレジットカード不要・完全無料でスタート
          </p>
        </div>

        {/* 実績数値 */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-600 mb-2">20%</p>
            <p className="text-gray-600">収益還元率</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-600 mb-2">¥0</p>
            <p className="text-gray-600">初期費用・月額費用</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-600 mb-2">100%</p>
            <p className="text-gray-600">アイデアの権利保護</p>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              なぜEmbldが選ばれるのか？
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                リスクゼロで始められる
              </h3>
              <p className="text-gray-600 mb-4">
                初期費用や月額料金は一切不要。アイデア投稿も完全無料です。
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">登録料・月額費なし</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">アイデア投稿無制限</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">隠れたコストなし</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                確実な収益保証
              </h3>
              <p className="text-gray-600 mb-4">
                契約で定められた収益の20%は必ずあなたのものに。透明性の高い収益分配。
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">契約書で保証</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">月次レポート提供</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">振込手数料も無料</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Embldが実現
              </h3>
              <p className="text-gray-600 mb-4">
                アイデアをブラッシュアップし、開発からリリースまで完全サポート。
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">市場調査サポート</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">UI/UXデザイン支援</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-600">マーケティング支援</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 仕組み説明 */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              どうやって収益化するのか
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-700">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">アイデア投稿</h3>
              <p className="text-sm text-gray-600">
                日常で感じた「こんなアプリがあったら」を投稿
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-700">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">企画・設計</h3>
              <p className="text-sm text-gray-600">
                Embldがアイデアを分析し、実現可能な企画に
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-700">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">開発・リリース</h3>
              <p className="text-sm text-gray-600">
                Embldがアプリを開発し、ストアにリリース
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-700">4</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">収益受取</h3>
              <p className="text-sm text-gray-600">
                アプリ収益の20%が毎月あなたの口座に振り込まれる
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 成功事例 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              実際の成功事例
            </h2>
            <p className="text-lg text-gray-600">
              アイデア投稿者の生の声をお聞きください
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                「家計簿アプリのアイデアを投稿して半年。今では月15万円の副収入になっています。本業以外の収入源ができて、生活に余裕が生まれました。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">田中 健太さん</p>
                  <p className="text-sm text-gray-600">30代・会社員</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                「専業主婦の私でも、料理レシピ管理アプリのアイデアで月8万円の収入。子供の教育費の足しになって本当に助かっています。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">佐藤 美咲さん</p>
                  <p className="text-sm text-gray-600">40代・主婦</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                「学生時代に投稿した勉強管理アプリが大ヒット。今では月20万円以上の収入があり、起業の資金にしています。」
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">鈴木 翔太さん</p>
                  <p className="text-sm text-gray-600">20代・起業家</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              よくある質問
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                Q. 本当に無料で始められますか？
              </h3>
              <p className="text-gray-600">
                A. はい、登録・アイデア投稿・収益受取まで、すべて完全無料です。隠れた費用は一切ありません。
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                Q. どんなアイデアでも投稿できますか？
              </h3>
              <p className="text-gray-600">
                A. 日常生活で「こんなアプリがあったら便利」と思うアイデアなら何でも投稿可能です。技術的な知識は不要です。
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                Q. 収益はいつから受け取れますか？
              </h3>
              <p className="text-gray-600">
                A. アプリがリリースされ、収益が発生した月の翌月末から振込が開始されます。その後は毎月自動的に振り込まれます。
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                Q. アイデアが盗まれる心配はありませんか？
              </h3>
              <p className="text-gray-600">
                A. すべてのアイデアは利用規約と法的保護のもとで管理されています。また、開発者との契約も弊社が仲介します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            アイデアを持っているなら、今すぐ始めよう
          </h2>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-primary-100 mt-4 text-sm">
            登録は1分で完了・クレジットカード不要
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary-600 text-white p-2 rounded-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-white">Embld</span>
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
            <p>&copy; 2025 Embld. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}