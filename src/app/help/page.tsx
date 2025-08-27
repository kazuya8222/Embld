'use client'

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const faqData = [
  {
    question: 'EmBldとは何ですか？',
    answer: 'EmBldは、アプリのアイデアを投稿し、開発者と繋がることができるプラットフォームです。アイデア投稿者は売上の30%を受け取ることができます。'
  },
  {
    question: 'アイデアを投稿するにはどうすればよいですか？',
    answer: 'ホーム画面から「プロダクト」ページに移動し、新しいアイデアを投稿できます。AIアシスタントがアイデアの改善をお手伝いします。'
  },
  {
    question: '料金はかかりますか？',
    answer: 'アイデアの投稿は無料です。アプリが実際に開発・販売された場合のみ、売上の30%をお支払いします。'
  },
  {
    question: 'どのような種類のアイデアを投稿できますか？',
    answer: 'モバイルアプリ、Webアプリ、デスクトップアプリなど、さまざまな種類のソフトウェアのアイデアを投稿できます。'
  },
  {
    question: 'アイデアの著作権はどうなりますか？',
    answer: 'アイデアの著作権は投稿者に帰属します。開発者との契約時に詳細な権利関係を明確にします。'
  },
  {
    question: '開発者とどのように連絡を取れますか？',
    answer: 'プラットフォーム内のメッセージ機能を通じて、開発者と安全にやり取りできます。'
  }
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#3a3a3a] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors flex items-center justify-between"
      >
        <span className="text-[#e0e0e0] font-medium">{question}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-[#a0a0a0]" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#a0a0a0]" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-[#1a1a1a]">
          <p className="text-[#c0c0c0] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#e0e0e0] mb-4">ヘルプ</h1>
          <p className="text-[#a0a0a0] text-lg">
            EmBldの使い方やよくある質問についてご確認いただけます。
          </p>
        </div>

        {/* よくある質問 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">よくある質問</h2>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* 利用規約 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">利用規約</h2>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-medium text-[#e0e0e0] mb-4">第1条（適用）</h3>
              <p className="text-[#c0c0c0] mb-4">
                本利用規約は、本サービスの利用に関して、当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。
              </p>
              
              <h3 className="text-xl font-medium text-[#e0e0e0] mb-4">第2条（定義）</h3>
              <p className="text-[#c0c0c0] mb-4">
                本規約において使用する用語の定義は、次の各号のとおりとします：
              </p>
              <ul className="text-[#c0c0c0] mb-4 list-disc pl-6">
                <li>「サービス」とは、当社が運営するEmBldというサービスをいいます</li>
                <li>「ユーザー」とは、本サービスを利用する全ての個人をいいます</li>
                <li>「アイデア」とは、ユーザーが本サービスに投稿するアプリケーションの企画・構想をいいます</li>
              </ul>

              <h3 className="text-xl font-medium text-[#e0e0e0] mb-4">第3条（収益分配）</h3>
              <p className="text-[#c0c0c0] mb-4">
                アイデア投稿者は、そのアイデアに基づいて開発・販売されたアプリケーションの売上の30%を受け取る権利を有します。
              </p>

              <h3 className="text-xl font-medium text-[#e0e0e0] mb-4">第4条（禁止行為）</h3>
              <p className="text-[#c0c0c0] mb-4">
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
              </p>
              <ul className="text-[#c0c0c0] mb-4 list-disc pl-6">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>他のユーザーまたは第三者の知的財産権を侵害する行為</li>
                <li>サービスの運営を妨害する行為</li>
              </ul>

              <p className="text-[#a0a0a0] text-sm mt-6">
                詳細な利用規約については、
                <a href="/legal/terms" className="text-blue-400 hover:text-blue-300 underline">
                  こちら
                </a>
                をご覧ください。
              </p>
            </div>
          </div>
        </section>

        {/* プライバシーポリシー */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">プライバシーポリシー</h2>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-medium text-[#e0e0e0] mb-4">個人情報の取得</h3>
              <p className="text-[#c0c0c0] mb-4">
                当社は、以下の個人情報を取得いたします：
              </p>
              <ul className="text-[#c0c0c0] mb-4 list-disc pl-6">
                <li>氏名、メールアドレス等の連絡先情報</li>
                <li>サービス利用履歴</li>
                <li>Cookie等の技術的情報</li>
              </ul>

              <h3 className="text-xl font-medium text-[#e0e0e0] mb-4">個人情報の利用目的</h3>
              <p className="text-[#c0c0c0] mb-4">
                取得した個人情報は、以下の目的で利用いたします：
              </p>
              <ul className="text-[#c0c0c0] mb-4 list-disc pl-6">
                <li>本サービスの提供・運営</li>
                <li>ユーザーサポート</li>
                <li>サービス改善のための分析</li>
                <li>重要なお知らせの配信</li>
              </ul>

              <h3 className="text-xl font-medium text-[#e0e0e0] mb-4">個人情報の管理</h3>
              <p className="text-[#c0c0c0] mb-4">
                当社は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
              </p>

              <p className="text-[#a0a0a0] text-sm mt-6">
                詳細なプライバシーポリシーについては、
                <a href="/legal/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  こちら
                </a>
                をご覧ください。
              </p>
            </div>
          </div>
        </section>

        {/* お問い合わせ */}
        <section>
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">お問い合わせ</h2>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <p className="text-[#c0c0c0] mb-4">
              ご不明な点やお困りのことがございましたら、お気軽にお問い合わせください。
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              お問い合わせフォーム
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}