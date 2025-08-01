import Link from 'next/link'

export function Footer() {
  return (
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
  )
}