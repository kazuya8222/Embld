import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { requirements } = await request.json()

    // OpenAIで検索キーワードを生成
    const systemPrompt = `以下のユーザー要求から、アプリ検索に適した日本語キーワードを抽出してください。
カンマ区切りで5個以下のキーワードを返してください。

ユーザー要求：
${requirements.join('\n')}

例：
- タスク管理, 生産性, 効率化
- 写真, 整理, ギャラリー, アルバム
- 家計簿, 収支, 節約, 金額管理`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: requirements.join('\n') }
      ],
      max_tokens: 100,
      temperature: 0.3,
    })

    const keywordsText = completion.choices[0]?.message?.content || ''
    const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k.length > 0)

    // Supabaseでアプリを検索
    const supabase = createSupabaseServerClient()
    
    // 基本的なテキスト検索を実行
    let searchQuery = supabase
      .from('owner_posts')
      .select('id, title, description, category, image_url, profiles(full_name)')
      .eq('status', 'published')
      .limit(5)

    // キーワードで検索 (title, description, categoryに対して)
    if (keywords.length > 0) {
      const searchTerm = keywords.join(' | ')
      searchQuery = searchQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
    }

    const { data: posts, error } = await searchQuery

    if (error) {
      console.error('Supabase search error:', error)
      return NextResponse.json({ apps: [] })
    }

    // レスポンス形式に変換
    const apps = posts?.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      category: post.category,
      image_url: post.image_url,
      owner_name: (post.profiles as any)?.full_name || '不明'
    })) || []

    return NextResponse.json({ apps })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ apps: [] })
  }
}