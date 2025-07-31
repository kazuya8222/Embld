import Link from 'next/link'
import { Grid3X3, Twitter, Github, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ブランド情報 */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Grid3X3 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Embld</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              アイデアと開発者をマッチングし、実現したアプリの収益を共有するプラットフォーム
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* サービス */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              サービス
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/ideas/new" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  アイデアを投稿
                </Link>
              </li>
              <li>
                <Link href="/apps" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  完成アプリ一覧
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  プレミアムプラン
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  開発者として参加
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              サポート
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  ヘルプセンター
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  お問い合わせ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  よくある質問
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  料金について
                </a>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              法的情報
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  特定商取引法
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  運営会社
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2025 Embld. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}