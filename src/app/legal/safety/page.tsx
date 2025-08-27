import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '安全とコンテンツポリシー | EMBLD',
  description: 'EMBLDの安全とコンテンツポリシーについて',
}

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            安全とコンテンツポリシー
          </h1>
          
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              1. 基本方針
            </h2>
            <p className="text-gray-600 mb-4">
              EMBLDは、すべてのユーザーが安全で快適にサービスを利用できる環境を提供することを目指しています。
              本ポリシーは、プラットフォーム上でのコンテンツの作成、共有、および利用に関するガイドラインを定めています。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              2. 禁止コンテンツ
            </h2>
            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
              2.1 違法コンテンツ
            </h3>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>日本国内外の法律に違反するコンテンツ</li>
              <li>知的財産権を侵害するコンテンツ</li>
              <li>個人情報やプライバシーを不当に侵害するコンテンツ</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
              2.2 有害コンテンツ
            </h3>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>暴力的、脅迫的、または攻撃的なコンテンツ</li>
              <li>差別的、憎悪的なコンテンツ</li>
              <li>詐欺や虚偽の情報を含むコンテンツ</li>
              <li>スパムや迷惑行為に該当するコンテンツ</li>
              <li>成人向けコンテンツ（性的なもの、暴力的なもの等）</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              3. ユーザー行動規範
            </h2>
            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
              3.1 尊重と配慮
            </h3>
            <p className="text-gray-600 mb-4">
              すべてのユーザーは、他のユーザーを尊重し、建設的なコミュニケーションを心がけてください。
              異なる意見や立場を持つ人々との対話においても、礼儀正しい態度を保ってください。
            </p>

            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
              3.2 正確性の確保
            </h3>
            <p className="text-gray-600 mb-4">
              アイデアや情報を共有する際は、可能な限り正確で検証可能な内容を提供してください。
              不確実な情報については、その旨を明示してください。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              4. 報告と対処
            </h2>
            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
              4.1 違反の報告
            </h3>
            <p className="text-gray-600 mb-4">
              本ポリシーに違反するコンテンツや行為を発見した場合は、各コンテンツの報告機能を使用するか、
              お問い合わせフォームから報告してください。
            </p>

            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
              4.2 対処措置
            </h3>
            <p className="text-gray-600 mb-4">
              違反が確認された場合、以下の措置を講じる場合があります：
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>コンテンツの削除または非表示</li>
              <li>ユーザーへの警告</li>
              <li>一時的なアカウント停止</li>
              <li>アカウントの永久停止</li>
              <li>必要に応じて法執行機関への報告</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              5. プライバシーとセキュリティ
            </h2>
            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
              5.1 個人情報の保護
            </h3>
            <p className="text-gray-600 mb-4">
              ユーザーの個人情報は適切に保護されます。
              詳細については、プライバシーポリシーをご確認ください。
            </p>

            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
              5.2 アカウントセキュリティ
            </h3>
            <p className="text-gray-600 mb-4">
              ユーザーは自身のアカウントのセキュリティを維持する責任があります。
              強固なパスワードの使用、不審なアクティビティの報告にご協力ください。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              6. 知的財産権
            </h2>
            <p className="text-gray-600 mb-4">
              投稿されるアイデアやコンテンツの知的財産権は、投稿者に帰属します。
              ただし、プラットフォームの運営に必要な範囲で、EMBLDに使用権が付与されます。
              他者の知的財産権を尊重し、適切な許可なく使用しないでください。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              7. ポリシーの更新
            </h2>
            <p className="text-gray-600 mb-4">
              本ポリシーは、サービスの改善や法的要件の変更に応じて更新される場合があります。
              重要な変更については、事前にユーザーに通知いたします。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              8. お問い合わせ
            </h2>
            <p className="text-gray-600 mb-4">
              本ポリシーに関するご質問やご意見がございましたら、
              お問い合わせフォームよりご連絡ください。
            </p>

            <div className="bg-gray-100 rounded-lg p-6 mt-8">
              <p className="text-sm text-gray-600">
                最終更新日: 2025年8月23日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}