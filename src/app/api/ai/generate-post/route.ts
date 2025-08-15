import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BasicInfo {
  projectName: string;
  projectUrl: string;
  keyFeatures: string;
  targetUsers: string;
  problemSolved: string;
  techStack: string;
  additionalInfo: string;
}

export async function POST(request: NextRequest) {
  try {
    const basicInfo: BasicInfo = await request.json();

    const prompt = `
あなたは個人開発プロジェクトの投稿を最適化するAIアシスタントです。
以下の情報を基に、魅力的で分かりやすいプロジェクト投稿を生成してください。

# 入力情報
- プロジェクト名: ${basicInfo.projectName}
- プロジェクトURL: ${basicInfo.projectUrl || 'なし'}
- 主な機能: ${basicInfo.keyFeatures}
- ターゲットユーザー: ${basicInfo.targetUsers}
- 解決する問題: ${basicInfo.problemSolved}
- 使用技術: ${basicInfo.techStack || 'なし'}
- その他の情報: ${basicInfo.additionalInfo || 'なし'}

# 出力要件
以下のJSON形式で回答してください：

{
  "title": "魅力的なタイトル（30文字以内、プロジェクト名を含む）",
  "description": "簡潔で魅力的な概要（100文字以内）",
  "content": "詳細な説明文（500-800文字）",
  "tags": ["関連するタグ1", "関連するタグ2", "関連するタグ3", "関連するタグ4", "関連するタグ5"],
  "category": "最適なカテゴリ"
}

# ガイドライン
1. タイトルは魅力的で検索されやすく、プロジェクトの価値を伝える
2. 概要は一目で理解できる簡潔さを重視
3. 詳細説明は以下を含む：
   - 解決する問題の背景
   - 主な機能・特徴
   - ターゲットユーザーへのメリット
   - 技術的な特徴（あれば）
   - 今後の展望（あれば）
4. タグは検索されやすく、プロジェクトの特徴を表現
5. カテゴリは以下から最適なものを選択：
   - AI・機械学習
   - 生産性向上
   - ソーシャル
   - ゲーム
   - Eコマース
   - メディア
   - 開発ツール
   - デザイン
   - ヘルスケア
   - ファイナンス
   - 教育
   - その他

JSON以外の文字は含めず、有効なJSONのみを返してください。
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたは個人開発プロジェクトの投稿を最適化する専門のAIアシスタントです。魅力的で分かりやすい投稿コンテンツを生成することが得意です。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const generatedContent = completion.choices[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error('AI生成に失敗しました');
    }

    try {
      const parsedContent = JSON.parse(generatedContent);
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Generated content:', generatedContent);
      
      // フォールバック: 手動でパースを試行
      const fallbackContent = {
        title: `${basicInfo.projectName} - ${basicInfo.keyFeatures.substring(0, 20)}...`,
        description: basicInfo.keyFeatures.substring(0, 100),
        content: `## ${basicInfo.projectName}について\n\n${basicInfo.problemSolved}\n\n## 主な機能\n${basicInfo.keyFeatures}\n\n## ターゲットユーザー\n${basicInfo.targetUsers}\n\n${basicInfo.additionalInfo ? `## その他\n${basicInfo.additionalInfo}` : ''}`,
        tags: ["個人開発", "Webアプリ", "ツール"],
        category: "その他"
      };
      
      return NextResponse.json(fallbackContent);
    }

  } catch (error) {
    console.error('Error generating AI content:', error);
    
    // エラー時のフォールバック
    const basicInfo: BasicInfo = await request.json().catch(() => ({
      projectName: '',
      projectUrl: '',
      keyFeatures: '',
      targetUsers: '',
      problemSolved: '',
      techStack: '',
      additionalInfo: ''
    }));

    const fallbackContent = {
      title: basicInfo.projectName || 'プロジェクト投稿',
      description: basicInfo.keyFeatures || 'プロジェクトの概要',
      content: `${basicInfo.problemSolved || 'このプロジェクトについて'}\n\n主な機能：\n${basicInfo.keyFeatures || '機能の説明'}\n\nターゲットユーザー：\n${basicInfo.targetUsers || 'ユーザーの説明'}`,
      tags: ["個人開発"],
      category: "その他"
    };

    return NextResponse.json(fallbackContent, { status: 500 });
  }
}