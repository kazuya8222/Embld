import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { message, previousRequirements } = await request.json()

    const systemPrompt = `あなたはユーザーの要望を明確化する専門のAIアシスタントです。
ユーザーが欲しいアプリやサービスについて、要件を整理するための質問を生成してください。

以下の観点から質問を考えてください：
- 使用場面・シチュエーション
- ターゲットユーザー
- 必須機能
- デバイス・プラットフォーム
- 既存サービスとの違い
- 予算・時間的制約

質問は1つだけにして、回答しやすいように具体的で明確にしてください。
日本語で自然な質問文を作成してください。

これまでの会話内容：
${previousRequirements.join('\n')}

最新のユーザー入力：
${message}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const question = completion.choices[0]?.message?.content || 
      'どのような場面で使用することを想定していますか？'

    return NextResponse.json({ question })

  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // フォールバック質問
    const fallbackQuestions = [
      'どのような場面で使用することを想定していますか？',
      '主なユーザーは誰になりますか？',
      '似たようなサービスで気に入らない点はありますか？',
      '必須の機能はありますか？',
      'どのようなデバイスで使いたいですか？'
    ]
    
    const randomQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]
    
    return NextResponse.json({ question: randomQuestion })
  }
}