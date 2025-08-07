import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, step } = await request.json()

    let systemPrompt = ''
    
    switch (step) {
      case 'service_overview':
        systemPrompt = 'あなたはアイデアを具体化するための質問をするアシスタントです。ユーザーからサービスの概要を聞いた後、そのサービスを使うペルソナを明確にするための質問を1つだけ簡潔に投げかけてください。'
        break
      case 'persona':
        systemPrompt = 'あなたはアイデアを具体化するためのアシスタントです。ペルソナが決まったので、次はそのペルソナがどのような課題を抱えているかを明確にするための質問を1つだけ簡潔に投げかけてください。'
        break
      case 'problem':
        systemPrompt = 'あなたはアイデアを具体化するためのアシスタントです。課題が明確になったので、次はその課題の解決策を明確にするための質問を1つだけ簡潔に投げかけてください。'
        break
      case 'solution':
        systemPrompt = 'あなたはアイデアを具体化するためのアシスタントです。解決策が明確になったので、これまでのやり取りから、ビジネス性を考慮した上で以下の形式でペルソナ、課題、解決策をまとめて提示してください。\n\n【ペルソナ】\n具体的な人物像\n\n【課題】\nそのペルソナが抱える具体的な課題\n\n【解決策】\n課題を解決する具体的な方法\n\n最後に「この内容に齟齬はありませんか？」と質問してください。'
        break
      case 'confirmation':
        // confirmationステップは実際にはユーザーが2択ボタンで回答するため、AIメッセージは生成されない
        systemPrompt = ''
        break
      case 'revise':
        systemPrompt = 'ユーザーの指摘に基づいて、ペルソナ、課題、解決策を修正し、再度同じ形式で提示してください。最後に「この内容で問題ありませんか？」と質問してください。'
        break
      case 'generate_plan':
        systemPrompt = `あなたはビジネス企画書作成のエキスパートです。これまでのやり取りを基に、以下の形式で詳細な企画書を生成してください：

## サービス概要
サービスの全体像を3-4行で簡潔に説明

## ターゲットユーザー／ペルソナ
具体的な人物像（年齢、職業、趣味、悩み等）を詳細に

## 課題 (Problem Statement)
ターゲットユーザーが抱える具体的な課題・問題点

## 解決策・価値提案 (Value Proposition)
サービスがどのように課題を解決し、どんな価値を提供するか

## 競合・代替手段と差別化ポイント
既存サービスとの比較、このサービスならではの特徴

## 市場規模イメージ（TAM／SAM／概算の潜在ユーザー数）
市場の大きさと潜在ユーザー数の概算

## 最小実用プロダクト (MVP) の提供価値
最初にリリースする機能で提供できる価値

## ビジネスモデル（価格設定・収益の流れ・コスト概算）
収益化の方法、価格設定、主要なコスト要素

## 将来の拡張／収益拡大シナリオ
サービス拡大の方向性と収益向上の戦略

各項目について具体的で実用的な内容を記載してください。最後に「企画書のドラフトが完成しました。この内容でよろしいでしょうか？」と質問してください。`
        break
      case 'plan_revision':
        systemPrompt = `ユーザーの修正要求に基づいて、企画書を修正してください。同じ形式で再度企画書を生成し、最後に「修正版の企画書です。この内容でよろしいでしょうか？」と質問してください。`
        break
      default:
        systemPrompt = 'あなたはフレンドリーなアシスタントです。ユーザーの質問に答えてください。'
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || 'すみません、応答を生成できませんでした。'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'AI応答の生成に失敗しました' },
      { status: 500 }
    )
  }
}