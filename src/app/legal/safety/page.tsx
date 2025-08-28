import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '安全とコンテンツポリシー - EMBLD',
  description: 'EMBLDの安全とコンテンツポリシー'
}

export default function SafetyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-white">安全とコンテンツポリシー</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">第1章　基本方針</h2>
            <p className="text-gray-300 leading-relaxed">
              EMBLDは、すべてのユーザーが安全で快適にサービスを利用できる環境を提供することを目指しています。
              本ポリシーは、プラットフォーム上でのコンテンツの作成、共有、および利用に関するガイドラインを定めています。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">第2章　禁止コンテンツ</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第1条（違法コンテンツ）</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>日本国内外の法律に違反するコンテンツ</li>
              <li>知的財産権を侵害するコンテンツ</li>
              <li>個人情報やプライバシーを不当に侵害するコンテンツ</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第2条（有害コンテンツ）</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>暴力的、脅迫的、または攻撃的なコンテンツ</li>
              <li>差別的、憎悪的なコンテンツ</li>
              <li>詐欺や虚偽の情報を含むコンテンツ</li>
              <li>スパムや迷惑行為に該当するコンテンツ</li>
              <li>成人向けコンテンツ（性的なもの、暴力的なもの等）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">第3章　ユーザー行動規範</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第3条（尊重と配慮）</h3>
            <p className="text-gray-300 leading-relaxed">
              すべてのユーザーは、他のユーザーを尊重し、建設的なコミュニケーションを心がけてください。
              異なる意見や立場を持つ人々との対話においても、礼儀正しい態度を保ってください。
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第4条（正確性の確保）</h3>
            <p className="text-gray-300 leading-relaxed">
              アイデアや情報を共有する際は、可能な限り正確で検証可能な内容を提供してください。
              不確実な情報については、その旨を明示してください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">第4章　報告と対処</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第5条（違反の報告）</h3>
            <p className="text-gray-300 leading-relaxed">
              本ポリシーに違反するコンテンツや行為を発見した場合は、各コンテンツの報告機能を使用するか、
              お問い合わせフォームから報告してください。
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第6条（対処措置）</h3>
            <p className="text-gray-300 mb-3">違反が確認された場合、以下の措置を講じる場合があります：</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>コンテンツの削除または非表示</li>
              <li>ユーザーへの警告</li>
              <li>一時的なアカウント停止</li>
              <li>アカウントの永久停止</li>
              <li>必要に応じて法執行機関への報告</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">第5章　プライバシーとセキュリティ</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第7条（個人情報の保護）</h3>
            <p className="text-gray-300 leading-relaxed">
              ユーザーの個人情報は適切に保護されます。
              詳細については、プライバシーポリシーをご確認ください。
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第8条（アカウントセキュリティ）</h3>
            <p className="text-gray-300 leading-relaxed">
              ユーザーは自身のアカウントのセキュリティを維持する責任があります。
              強固なパスワードの使用、不審なアクティビティの報告にご協力ください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">第6章　知的財産権</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第9条（権利の帰属）</h3>
            <p className="text-gray-300 leading-relaxed">
              投稿されるアイデアやコンテンツの知的財産権は、投稿者に帰属します。
              ただし、プラットフォームの運営に必要な範囲で、EMBLDに使用権が付与されます。
              他者の知的財産権を尊重し、適切な許可なく使用しないでください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">第7章　ポリシーの更新</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6 text-white">第10条（更新手続）</h3>
            <p className="text-gray-300 leading-relaxed">
              本ポリシーは、サービスの改善や法的要件の変更に応じて更新される場合があります。
              重要な変更については、事前にユーザーに通知いたします。
            </p>
          </section>

          <p className="text-sm text-gray-400 mt-12">
            ご不明な点がございましたら、<a href="/contact" className="underline hover:text-white transition-colors">お問い合わせフォーム</a>よりご連絡ください。
          </p>
      </div>
    </div>
  )
}