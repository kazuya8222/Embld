'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Footer() {
  const router = useRouter()

  const handleFaqClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push('/help')
  }
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 py-12">
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
              <li><Link href="/ideas/new" className="text-gray-400 hover:text-white transition-colors">企画書作成</Link></li>
              <li><Link href="/owners" className="text-gray-400 hover:text-white transition-colors">プロダクト一覧</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">サポート</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" onClick={handleFaqClick} className="text-gray-400 hover:text-white transition-colors cursor-pointer">FAQ</a></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">お問い合わせ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-3">ポリシー</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors">利用規約</Link></li>
              <li><Link href="/legal/safety" className="text-gray-400 hover:text-white transition-colors">安全とコンテンツポリシー</Link></li>
              <li><Link href="/legal/cookies" className="text-gray-400 hover:text-white transition-colors">Cookieを管理</Link></li>
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