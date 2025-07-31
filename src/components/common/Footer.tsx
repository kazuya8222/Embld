export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サービス情報 */}
          <div>
            <h3 className="text-white font-semibold mb-3">Embld</h3>
            <p className="text-sm text-gray-400">
              アイデアと開発者をつなぐプラットフォーム
            </p>
            <p className="text-sm text-yellow-400 mt-2">
              収益の20%をアイデア投稿者に還元
            </p>
          </div>

          {/* リンク */}
          <div>
            <h4 className="text-white font-semibold mb-3">サービス</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/ideas/new" className="hover:text-white transition-colors">
                  アイデアを投稿
                </a>
              </li>
              <li>
                <a href="/apps" className="hover:text-white transition-colors">
                  完成アプリ一覧
                </a>
              </li>
              <li>
                <a href="/premium" className="hover:text-white transition-colors">
                  プレミアムプラン
                </a>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h4 className="text-white font-semibold mb-3">法的情報</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/legal/privacy" className="hover:text-white transition-colors">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="/legal/terms" className="hover:text-white transition-colors">
                  利用規約
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© 2025 Embld. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}