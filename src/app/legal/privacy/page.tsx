import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー - EmBld',
  description: 'EmBldのプライバシーポリシー'
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-white">プライバシーポリシー</h1>
        
        <p className="text-gray-400 mb-12">最終更新日: 2025年1月31日</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. はじめに</h2>
            <p className="text-gray-300 leading-relaxed">
              EmBld（以下、「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. 収集する情報</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6 text-white">2.1 アカウント情報</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>メールアドレス</li>
              <li>ユーザー名</li>
              <li>Googleアカウントから提供される基本情報（Google認証使用時）</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6 text-white">2.2 投稿コンテンツ</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>アイデアの投稿内容</li>
              <li>コメント</li>
              <li>アプリ情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. 情報の使用目的</h2>
            <p className="text-gray-300 leading-relaxed">
              収集した情報は、サービスの提供・改善、ユーザーサポートのために使用します。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. 情報の保護</h2>
            <p className="text-gray-300 leading-relaxed">
              SSL/TLS暗号化通信を使用し、適切なセキュリティ対策を実施しています。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. 第三者サービス</h2>
            <p className="text-gray-300 mb-3">当サービスは以下の第三者サービスを使用しています：</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Supabase（認証・データベース）</li>
              <li>Stripe（決済処理）</li>
              <li>Google OAuth（認証）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. お問い合わせ</h2>
            <p className="text-gray-300 leading-relaxed">
              ご不明な点がございましたら、<a href="/contact" className="underline hover:text-white transition-colors">お問い合わせフォーム</a>よりご連絡ください。
            </p>
          </section>
      </div>
    </div>
  )
}