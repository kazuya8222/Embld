'use client';

import { useState } from 'react';
import { Edit3, Sparkles, ArrowRight, Clock, Zap } from 'lucide-react';
import { ManualPostForm } from './ManualPostForm';
import { AIAssistedPostForm } from './AIAssistedPostForm';

interface PostModeSelectionProps {
  userId: string;
}

export function PostModeSelection({ userId }: PostModeSelectionProps) {
  const [selectedMode, setSelectedMode] = useState<'selection' | 'manual' | 'ai'>('selection');

  if (selectedMode === 'manual') {
    return <ManualPostForm userId={userId} onBack={() => setSelectedMode('selection')} />;
  }

  if (selectedMode === 'ai') {
    return <AIAssistedPostForm userId={userId} onBack={() => setSelectedMode('selection')} />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">投稿方法を選択してください</h2>
        <p className="text-gray-600">あなたに合った方法でプロジェクトを投稿しましょう</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 手動投稿モード */}
        <div 
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => setSelectedMode('manual')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Edit3 className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">手動で投稿</h3>
          <p className="text-gray-600 text-sm mb-4">
            全ての項目を自分で入力してプロジェクトを投稿します。細かい調整や独自の表現をしたい方におすすめです。
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>5-10分</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>完全制御</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-500">含まれる機能：</div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• プロジェクト詳細の手動入力</li>
              <li>• カスタムタグ・技術スタック</li>
              <li>• 画像アップロード</li>
              <li>• 詳細な説明文</li>
            </ul>
          </div>
        </div>

        {/* AI補助投稿モード */}
        <div 
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
          onClick={() => setSelectedMode('ai')}
        >
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              AI搭載
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI補助で投稿</h3>
          <p className="text-gray-600 text-sm mb-4">
            AIがプロジェクトの説明文やタグを自動生成します。簡単な情報を入力するだけで魅力的な投稿が完成します。
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>2-3分</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>AI最適化</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-500">AI機能：</div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 魅力的な説明文の自動生成</li>
              <li>• 適切なタグの提案</li>
              <li>• SEO最適化されたタイトル</li>
              <li>• プロジェクトカテゴリの自動分類</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">投稿のヒント</h4>
            <p className="text-blue-800 text-sm">
              どちらのモードを選んでも、投稿後に編集・修正が可能です。まずは気軽に投稿してみて、後から詳細を調整することもできます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}