'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOwnerPost } from '@/app/actions/ownerPosts';
import { ArrowLeft, Sparkles, Wand2, RefreshCw, Check, Edit } from 'lucide-react';

interface AIAssistedPostFormProps {
  userId: string;
  onBack: () => void;
}

interface AIGeneratedContent {
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
}

export function AIAssistedPostForm({ userId, onBack }: AIAssistedPostFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'generating' | 'review' | 'submitting'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 基本情報入力
  const [basicInfo, setBasicInfo] = useState({
    projectName: '',
    projectUrl: '',
    keyFeatures: '',
    targetUsers: '',
    problemSolved: '',
    techStack: '',
    additionalInfo: '',
  });

  // AI生成コンテンツ
  const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);
  
  // 最終フォームデータ
  const [finalFormData, setFinalFormData] = useState({
    title: '',
    description: '',
    content: '',
    project_url: '',
    github_url: '',
    demo_url: '',
    tech_stack: [] as string[],
    tags: [] as string[],
    category: 'その他',
    pricing_model: 'free' as 'free' | 'paid' | 'freemium' | 'subscription',
    platform: [] as string[],
    is_public: true,
  });

  const generateAIContent = async () => {
    setIsGenerating(true);
    setStep('generating');

    try {
      // OpenAI APIを使ってコンテンツを生成
      const response = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicInfo),
      });

      if (!response.ok) {
        throw new Error('AI生成に失敗しました');
      }

      const generatedContent: AIGeneratedContent = await response.json();
      setAiContent(generatedContent);
      
      // 最終フォームデータに反映
      setFinalFormData({
        ...finalFormData,
        title: generatedContent.title,
        description: generatedContent.description,
        content: generatedContent.content,
        tags: generatedContent.tags,
        category: generatedContent.category,
        project_url: basicInfo.projectUrl,
        tech_stack: basicInfo.techStack ? basicInfo.techStack.split(',').map(s => s.trim()) : [],
      });
      
      setStep('review');
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('AI生成中にエラーが発生しました。もう一度お試しください。');
      setStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateContent = async () => {
    await generateAIContent();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStep('submitting');

    try {
      const result = await createOwnerPost({
        ...finalFormData,
        user_id: userId,
      });

      if (result.success && result.data) {
        router.push(`/owners/${result.data.id}`);
      } else {
        alert('投稿の作成に失敗しました');
        setStep('review');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('エラーが発生しました');
      setStep('review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 基本情報入力ステップ
  if (step === 'input') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI補助で投稿
            </h2>
            <p className="text-gray-600 text-sm">基本情報を入力すると、AIが魅力的な投稿を自動生成します</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              プロジェクトの基本情報
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロジェクト名 *
              </label>
              <input
                type="text"
                required
                value={basicInfo.projectName}
                onChange={(e) => setBasicInfo({ ...basicInfo, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例：TaskMaster"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プロジェクトURL
              </label>
              <input
                type="url"
                value={basicInfo.projectUrl}
                onChange={(e) => setBasicInfo({ ...basicInfo, projectUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主な機能 *
              </label>
              <textarea
                required
                rows={3}
                value={basicInfo.keyFeatures}
                onChange={(e) => setBasicInfo({ ...basicInfo, keyFeatures: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="このプロジェクトの主な機能や特徴を教えてください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ターゲットユーザー *
              </label>
              <input
                type="text"
                required
                value={basicInfo.targetUsers}
                onChange={(e) => setBasicInfo({ ...basicInfo, targetUsers: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例：忙しいビジネスパーソン、学生、フリーランサー"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                解決する問題 *
              </label>
              <textarea
                required
                rows={3}
                value={basicInfo.problemSolved}
                onChange={(e) => setBasicInfo({ ...basicInfo, problemSolved: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="このプロジェクトが解決する問題や課題について教えてください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用技術
              </label>
              <input
                type="text"
                value={basicInfo.techStack}
                onChange={(e) => setBasicInfo({ ...basicInfo, techStack: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例：React, Next.js, TypeScript, Supabase（カンマ区切り）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                その他の情報
              </label>
              <textarea
                rows={3}
                value={basicInfo.additionalInfo}
                onChange={(e) => setBasicInfo({ ...basicInfo, additionalInfo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="開発の背景、こだわりポイント、今後の予定など、追加で伝えたいことがあれば入力してください"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
            <button
              onClick={generateAIContent}
              disabled={!basicInfo.projectName || !basicInfo.keyFeatures || !basicInfo.targetUsers || !basicInfo.problemSolved}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AIで生成する
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AI生成中ステップ
  if (step === 'generating') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              AI補助で投稿
            </h2>
            <p className="text-gray-600 text-sm">AIが魅力的な投稿を生成しています...</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Wand2 className="w-8 h-8 text-purple-600 animate-bounce" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">AIが投稿を生成中です</h3>
            <p className="text-gray-600">
              あなたの入力を基に、魅力的なタイトル、説明文、タグを自動生成しています。<br />
              少々お待ちください...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // レビュー・編集ステップ
  if (step === 'review') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep('input')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              生成完了！内容を確認・編集
            </h2>
            <p className="text-gray-600 text-sm">AIが生成した内容を確認し、必要に応じて編集してください</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">AI生成コンテンツ</h3>
            <button
              onClick={regenerateContent}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              再生成
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル
              </label>
              <input
                type="text"
                value={finalFormData.title}
                onChange={(e) => setFinalFormData({ ...finalFormData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                概要
              </label>
              <textarea
                rows={3}
                value={finalFormData.description}
                onChange={(e) => setFinalFormData({ ...finalFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                詳細説明
              </label>
              <textarea
                rows={8}
                value={finalFormData.content}
                onChange={(e) => setFinalFormData({ ...finalFormData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={finalFormData.category}
                onChange={(e) => setFinalFormData({ ...finalFormData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="AI・機械学習">AI・機械学習</option>
                <option value="生産性向上">生産性向上</option>
                <option value="ソーシャル">ソーシャル</option>
                <option value="ゲーム">ゲーム</option>
                <option value="Eコマース">Eコマース</option>
                <option value="メディア">メディア</option>
                <option value="開発ツール">開発ツール</option>
                <option value="デザイン">デザイン</option>
                <option value="ヘルスケア">ヘルスケア</option>
                <option value="ファイナンス">ファイナンス</option>
                <option value="教育">教育</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグ
              </label>
              <div className="flex flex-wrap gap-2">
                {finalFormData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="is_public" className="block text-sm font-medium text-gray-700 mb-2">
                公開設定
              </label>
              <select
                id="is_public"
                value={finalFormData.is_public.toString()}
                onChange={(e) => setFinalFormData({ ...finalFormData, is_public: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="true">公開</option>
                <option value="false">非公開</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setStep('input')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              入力に戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '投稿中...' : '投稿する'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 投稿中ステップ
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">投稿中...</h3>
          <p className="text-gray-600">
            あなたのプロジェクトを投稿しています。少々お待ちください。
          </p>
        </div>
      </div>
    </div>
  );
}