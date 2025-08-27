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
    <div className="py-8">
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

        {/* その他の情報 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">その他の情報</h2>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 space-y-4">
            <p className="text-[#c0c0c0]">
              EmBldのサービス利用に関する規約については、<a href="/legal/terms" className="text-blue-400 hover:text-blue-300 underline">利用規約</a>をご確認ください。
            </p>
            <p className="text-[#c0c0c0]">
              個人情報の取り扱いについては、<a href="/legal/privacy" className="text-blue-400 hover:text-blue-300 underline">プライバシーポリシー</a>をご覧ください。
            </p>
            <p className="text-[#c0c0c0]">
              ご不明な点やお困りのことがございましたら、<a href="/contact" className="text-blue-400 hover:text-blue-300 underline">お問い合わせフォーム</a>よりご連絡ください。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}