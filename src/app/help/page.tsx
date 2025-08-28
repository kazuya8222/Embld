'use client'

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const faqData = [
  {
    question: 'EMBLDはどんなサービスですか？',
    answer: 'EMBLDは、あなたのアイデアを要件定義書に変換するAIエージェントです。作成された要件定義書が承認されれば、EMBLDチームが無償で開発・運用を行い、アプリから生まれる収益の70%をアイデア提供者に還元します。'
  },
  {
    question: '要件定義書の作成に費用はかかりますか？',
    answer: '基本的な要件定義書の作成は無料です。AIエージェントとのチャットには一定のクレジットを消費しますが、初回登録時に無料クレジットが付与されます。'
  },
  {
    question: '要件定義書はどのように審査されますか？',
    answer: 'AIが法務リスク・収益性・実現可能性を自動診断した後、EMBLDチームが市場性や技術的な観点から最終審査を行います。審査結果は通常1週間以内にお知らせします。'
  },
  {
    question: '収益の70%はどのように支払われますか？',
    answer: 'アプリから収益が発生した場合、その70%が毎月自動的にあなたの指定口座に振り込まれます。振込手数料はEMBLDが負担します。最低支払い金額は5,000円からとなります。'
  },
  {
    question: '作成した要件定義書を自分で開発に使うことはできますか？',
    answer: 'はい、可能です。AIが作成した要件定義書は自由にダウンロード・利用できます。自身での開発や、他の開発チームへの依頼にもご活用いただけます。'
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
            EMBLDの使い方やよくある質問についてご確認いただけます。
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
              EMBLDのサービス利用に関する規約については、<a href="/legal/terms" className="text-blue-400 hover:text-blue-300 underline">利用規約</a>をご確認ください。
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