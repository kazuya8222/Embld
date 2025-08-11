import { NextRequest, NextResponse } from 'next/server'
// 認証必須にすると生成が止まるケースがあるため、ここではチェックしない（保存時に認証）
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

# サービス概要

# ターゲットユーザー／ペルソナ

# 課題 (Problem Statement)

# 解決策・価値提案 (Value Proposition)

# 競合・代替手段と差別化ポイント

# 市場規模イメージ（TAM／SAM／概算の潜在ユーザー数）

# 最小実用プロダクト (MVP) の提供価値

# ビジネスモデル（価格設定・収益の流れ・コスト概算）

# 将来の拡張／収益拡大シナリオ

各項目について具体的で実用的な内容を記載してください。`
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