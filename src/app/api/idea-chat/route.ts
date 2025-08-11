import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 503 }
      )
    }

    const { messages, currentFrames, mode } = await request.json()

    if (mode === 'analyze_and_update') {
      // ユーザーの入力を分析して3枠を更新するモード
      const systemPrompt = `
あなたは収益性を重視するビジネス企画のエキスパートです。ユーザーの入力を分析して、以下の3つの要素を最適化する役割があります：

1. **ペルソナ**: 具体的で収益性の高いターゲットユーザー
2. **課題**: そのペルソナが抱える深刻で市場性のある課題  
3. **サービス内容**: 課題を効果的に解決し、高い収益性を持つサービス

現在の状態：
- ペルソナ: ${currentFrames.persona || '未設定'}
- 課題: ${currentFrames.problem || '未設定'}
- サービス内容: ${currentFrames.service || '未設定'}

## あなたの役割

1. **入力内容を分析**して、ペルソナ・課題・サービス内容のどの要素に関連するかを判断
2. **既存の3枠を改善**する提案を行う（入力内容を踏まえて、より収益性の高い方向にアップデート）
3. **相互関連性を考慮**して、一つの要素が変わったら他の要素も最適化する
4. **市場性・収益性・実現可能性**を重視した改善案を提示

## 応答形式

まず、ユーザーの入力に対する共感的な応答を行い、その後で改善提案があれば以下のJSONを最後に含めてください：

\`\`\`json
{
  "persona": "改善されたペルソナ（変更がない場合は null）",
  "problem": "改善された課題（変更がない場合は null）", 
  "service": "改善されたサービス内容（変更がない場合は null）"
}
\`\`\`

改善提案がない場合は、質問を投げかけて対話を深めてください。
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 1200,
      })

      const response = completion.choices[0]?.message?.content || 'すみません、応答を生成できませんでした。'
      
      // JSONを抽出してupdatesとして返す
      let updates: { persona?: string; problem?: string; service?: string } | null = null
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        try {
          const parsedUpdates = JSON.parse(jsonMatch[1])
          // null値を除去
          const tempUpdates: { persona?: string; problem?: string; service?: string } = {}
          if (parsedUpdates.persona) tempUpdates.persona = parsedUpdates.persona
          if (parsedUpdates.problem) tempUpdates.problem = parsedUpdates.problem
          if (parsedUpdates.service) tempUpdates.service = parsedUpdates.service
          
          // 空のupdatesの場合はnullに
          if (Object.keys(tempUpdates).length === 0) {
            updates = null
          } else {
            updates = tempUpdates
          }
        } catch (e) {
          console.error('JSON parsing error:', e)
        }
      }

      // JSONブロックを除去したレスポンスを返す
      const cleanResponse = response.replace(/```json\n[\s\S]*?\n```/g, '').trim()

      return NextResponse.json({ 
        response: cleanResponse,
        updates 
      })

    } else if (mode === 'generate_plan') {
      // 企画書生成モード
      const systemPrompt = `
あなたは実績豊富なビジネス企画書作成のエキスパートです。以下の3つの要素から、収益性と実現可能性を重視した詳細な企画書を作成してください。

現在の要素：
- ペルソナ: ${currentFrames.persona}
- 課題: ${currentFrames.problem}  
- サービス内容: ${currentFrames.service}

## 企画書作成の方針

1. **収益性重視**: 明確な収益モデルと市場性を示す
2. **実現可能性**: 技術的・事業的に実現可能な内容
3. **差別化**: 競合に対する明確な優位性
4. **成長性**: 将来的な拡張可能性を示す
5. **具体性**: 曖昧な表現を避け、具体的な数値や事例を含む

## 出力形式

以下の形式で企画書を作成してください：

# 🚀 [サービス名]

## 📝 サービス概要
[3-4行で簡潔に]

## 🎯 ターゲットペルソナ
[具体的な人物像と市場規模]

## ⚡ 解決する課題
[課題の深刻さと市場性]

## 💡 価値提案・解決策
[独自性のある解決方法]

## 🏆 競合分析・差別化ポイント
[3-5つの競合と明確な差別化]

## 📊 市場規模・収益性
[TAM/SAM/収益予測]

## 🎪 MVP（最小実用プロダクト）
[最初にリリースする機能]

## 💰 ビジネスモデル
[価格設定・収益構造・コスト]

## 🚀 将来展開・成長戦略
[段階的な拡張計画]

## 📈 成功指標・KPI
[測定可能な目標値]

各セクションは具体的で実用的な内容を記載し、投資家や開発チームが納得できるレベルの企画書を作成してください。
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-3) // 最新の3メッセージのみ使用
        ],
        temperature: 0.7,
        max_tokens: 3000,
      })

      const response = completion.choices[0]?.message?.content || '企画書の生成に失敗しました。'

      return NextResponse.json({ response })

    } else {
      return NextResponse.json(
        { error: 'Invalid mode specified' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'AI応答の生成に失敗しました' },
      { status: 500 }
    )
  }
}