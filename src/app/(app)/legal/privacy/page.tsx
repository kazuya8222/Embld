import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー - Embld',
  description: 'Embldのプライバシーポリシー'
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
      
      <p className="text-gray-600 mb-8">最終更新日: 2025年1月31日</p>

      <div className="prose prose-gray max-w-none">
        <h2 className="text-2xl font-bold mt-8 mb-4">1. はじめに</h2>
        <p>Embld（以下、「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. 収集する情報</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3">2.1 アカウント情報</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>メールアドレス</li>
          <li>ユーザー名</li>
          <li>Googleアカウントから提供される基本情報（Google認証使用時）</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">2.2 投稿コンテンツ</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>アイデアの投稿内容</li>
          <li>コメント</li>
          <li>アプリ情報</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. 情報の使用目的</h2>
        <p>収集した情報は、サービスの提供・改善、ユーザーサポートのために使用します。</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. 情報の保護</h2>
        <p>SSL/TLS暗号化通信を使用し、適切なセキュリティ対策を実施しています。</p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. 第三者サービス</h2>
        <p>当サービスは以下の第三者サービスを使用しています：</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Supabase（認証・データベース）</li>
          <li>Stripe（決済処理）</li>
          <li>Google OAuth（認証）</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. お問い合わせ</h2>
        <p>プライバシーに関するお問い合わせは、メールにてご連絡ください。</p>
      </div>
    </div>
  )
}