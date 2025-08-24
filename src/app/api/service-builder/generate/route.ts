import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { step, initialIdea, previousData, currentItems, userModifications, userFeedback } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let prompt = '';
    const userFeedbackText = userFeedback && userFeedback.length > 0 
      ? `\n\nユーザーからのフィードバック:\n${userFeedback.join('\n')}` 
      : '';
    
    switch (step) {
      case 'overview':
        prompt = `以下のアイデアから、詳細なサービス概要を生成してください。
        
ユーザーのアイデア: ${initialIdea}${userFeedbackText}

サービス概要には以下を含めてください：
- サービスの目的と価値提案
- ターゲットユーザー
- 主要な機能の概要
- ユーザーにとってのメリット

200文字程度で簡潔にまとめてください。`;
        break;

      case 'problem':
        prompt = `以下のサービス概要から、解決すべき課題を明確に定義してください。

サービス概要: ${currentItems.find((item: any) => item.id === 'overview')?.content}${userFeedbackText}

課題には以下を含めてください：
- 現状の問題点
- ユーザーが抱える不満や困りごと
- 既存の解決策の不足点

150文字程度で簡潔にまとめてください。`;
        break;

      case 'ideal':
        prompt = `以下の情報から、理想的な状態を描写してください。

サービス概要: ${currentItems.find((item: any) => item.id === 'overview')?.content}
課題: ${currentItems.find((item: any) => item.id === 'problem')?.content}${userFeedbackText}

理想の状態には以下を含めてください：
- 課題が解決された後の状態
- ユーザーが得られる体験
- 実現したい世界観

150文字程度で簡潔にまとめてください。`;
        break;

      case 'solution':
        prompt = `以下の情報から、具体的な解決策を提案してください。

サービス概要: ${currentItems.find((item: any) => item.id === 'overview')?.content}
課題: ${currentItems.find((item: any) => item.id === 'problem')?.content}
理想: ${currentItems.find((item: any) => item.id === 'ideal')?.content}${userFeedbackText}

解決策には以下を含めてください：
- 技術的なアプローチ
- 主要な機能の実装方法
- 差別化要因

200文字程度で簡潔にまとめてください。`;
        break;

      case 'features':
        prompt = `以下の情報から、具体的な機能詳細をリストアップしてください。

サービス概要: ${currentItems.find((item: any) => item.id === 'overview')?.content}
解決策: ${currentItems.find((item: any) => item.id === 'solution')?.content}${userFeedbackText}

機能詳細には以下を含めてください：
- 主要機能（3-5個）
- 各機能の簡単な説明
- ユーザーインターフェースの特徴

箇条書きで整理してください。`;
        break;

      case 'name':
        prompt = `以下の情報から、キャッチーなサービス名を3つ提案してください。

サービス概要: ${currentItems.find((item: any) => item.id === 'overview')?.content}
主要機能: ${currentItems.find((item: any) => item.id === 'features')?.content}${userFeedbackText}

サービス名の条件：
- 覚えやすい
- サービスの特徴を表現
- ユニークで印象的

各名前に簡単な説明を添えてください。`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid step' },
          { status: 400 }
        );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'あなたは優秀なプロダクトマネージャーです。ユーザーのアイデアを具体化し、実現可能なサービス企画を作成します。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}