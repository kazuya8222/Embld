import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 - Embld',
  description: 'Embldの利用規約'
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">利用規約</h1>
      
      <p className="text-gray-600 mb-8">最終更新日: 2025年1月31日</p>

      <div className="prose prose-gray max-w-none">
        <h2 className="text-2xl font-bold mt-8 mb-4">1. 利用規約の適用</h2>
        <p>本利用規約は、Embldの利用に関する条件を定めるものです。</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. 利用登録</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>13歳以上の方のみ利用可能です</li>
          <li>正確な情報を提供してください</li>
          <li>アカウントの管理は利用者の責任です</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. 禁止事項</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>法令違反行為</li>
          <li>他者の権利侵害</li>
          <li>虚偽情報の投稿</li>
          <li>スパム行為</li>
          <li>システムへの不正アクセス</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. 投稿コンテンツ</h2>
        <p>投稿したアイデアは公開され、他のユーザーが閲覧・実装できます。</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. プレミアムプラン</h2>
        <p>月額500円（税込）で詳細な分析機能を利用できます。</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. 免責事項</h2>
        <p>サービスの中断、ユーザー間のトラブル等について、当サービスは責任を負いません。</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. 規約の変更</h2>
        <p>本規約は予告なく変更されることがあります。</p>
      </div>
    </div>
  )
}