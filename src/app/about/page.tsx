'use client'

import React from 'react';
import { Users, Lightbulb, Target, Rocket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#e0e0e0] mb-4">私たちについて</h1>
          <p className="text-[#a0a0a0] text-lg">
            EmBldは、革新的なアイデアを持つあなたと、それを実現できる開発者をつなぐプラットフォームです。
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-12">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-8">
            <div className="flex items-center mb-6">
              <Target className="w-8 h-8 text-blue-400 mr-4" />
              <h2 className="text-2xl font-bold text-[#e0e0e0]">私たちのミッション</h2>
            </div>
            <p className="text-[#c0c0c0] leading-relaxed">
              誰もが持つ素晴らしいアイデアが、技術的な壁や資金不足によって実現されないまま埋もれてしまう現状を変えたい。
              EmBldは、アイデアを持つ人と実現する人をつなぎ、新しい価値を生み出すエコシステムを構築します。
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">EmBldの仕組み</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 text-center">
              <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#e0e0e0] mb-3">1. アイデアを投稿</h3>
              <p className="text-[#c0c0c0]">
                あなたのアイデアをAIエージェントと対話しながら具体的な企画書に仕上げます。
              </p>
            </div>
            
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 text-center">
              <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#e0e0e0] mb-3">2. 開発者とマッチング</h3>
              <p className="text-[#c0c0c0]">
                スキルとプロジェクトの適性を分析し、最適な開発者チームとマッチングします。
              </p>
            </div>
            
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 text-center">
              <Rocket className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#e0e0e0] mb-3">3. アプリを実現</h3>
              <p className="text-[#c0c0c0]">
                開発完了後、あなたは収益の30%を受け取ります。継続的な成長をサポートします。
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">私たちのビジョン</h2>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-8">
            <p className="text-[#c0c0c0] leading-relaxed text-center text-lg">
              テクノロジーの力で、世界中の革新的なアイデアが実現される未来を創造する。
              EmBldは、アイデアと技術の橋渡しをすることで、より良い社会の実現に貢献します。
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#e0e0e0] mb-6">お問い合わせ</h2>
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 space-y-4">
            <p className="text-[#c0c0c0]">
              サービスについてのご質問やご相談は、<Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">お問い合わせフォーム</Link>よりお気軽にご連絡ください。
            </p>
            <p className="text-[#c0c0c0]">
              よくある質問については、<Link href="/help" className="text-blue-400 hover:text-blue-300 underline">ヘルプページ</Link>もご確認ください。
            </p>
            <div className="pt-4">
              <Link href="/home">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  サービスを始める
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}