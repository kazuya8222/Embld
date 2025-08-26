import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const AGENT_PROMPTS = {
  service_builder: `あなたはサービス構築の専門家です。ユーザーのアイデアを実現可能なサービスとして具体化し、技術的な実装方法や必要な機能を提案します。
以下の観点で支援してください：
- サービスの概要と価値提案
- 解決する課題と理想の状態
- 具体的な解決策と実装方法
- 必要な機能とその優先順位
- サービス名の提案`,
  
  code_assistant: `あなたはプログラミングの専門家です。コードの作成、デバッグ、最適化を支援します。
以下の観点で支援してください：
- 効率的で保守性の高いコード実装
- ベストプラクティスの適用
- エラー処理とセキュリティ考慮
- パフォーマンス最適化
- テストコードの作成`,
  
  business_advisor: `あなたはビジネス戦略の専門家です。ビジネスモデル、市場分析、収益化戦略を提案します。
以下の観点で支援してください：
- 市場分析と競合調査
- ビジネスモデルの構築
- 収益化戦略とプライシング
- マーケティング戦略
- 成長戦略とKPI設定`
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message, sessionId, agentType, history } = await req.json();

    if (!message || !sessionId || !agentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Build conversation history for context
    const messages: any[] = [
      {
        role: 'system',
        content: AGENT_PROMPTS[agentType as keyof typeof AGENT_PROMPTS] || AGENT_PROMPTS.service_builder
      }
    ];

    // Add conversation history (limit to last 10 messages for context)
    if (history && history.length > 0) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content || 'エラーが発生しました。';

    // Parse response for structured data if service_builder agent
    let metadata = {};
    if (agentType === 'service_builder') {
      // Extract structured information from response
      metadata = extractServiceBuilderMetadata(responseContent);
    }

    return NextResponse.json({
      content: responseContent,
      metadata,
      agentType
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractServiceBuilderMetadata(content: string): any {
  // Simple extraction logic - can be enhanced with more sophisticated parsing
  const metadata: any = {};
  
  // Try to extract service name
  const nameMatch = content.match(/サービス名[:：]\s*(.+?)[\n\r]/);
  if (nameMatch) {
    metadata.serviceName = nameMatch[1].trim();
  }
  
  // Try to extract key features
  const featuresMatch = content.match(/機能[:：]\s*([\s\S]+?)(?:\n\n|$)/);
  if (featuresMatch) {
    const features = featuresMatch[1]
      .split(/[・\-\n]/)
      .filter(f => f.trim())
      .map(f => f.trim());
    metadata.features = features;
  }
  
  return metadata;
}