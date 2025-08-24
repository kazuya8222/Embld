import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { serviceItems } = await request.json();
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const overview = serviceItems.find((item: any) => item.id === 'overview')?.content || '';
    const problem = serviceItems.find((item: any) => item.id === 'problem')?.content || '';
    const ideal = serviceItems.find((item: any) => item.id === 'ideal')?.content || '';
    const solution = serviceItems.find((item: any) => item.id === 'solution')?.content || '';
    const features = serviceItems.find((item: any) => item.id === 'features')?.content || '';
    const serviceName = serviceItems.find((item: any) => item.id === 'name')?.content || '';

    const description = `
## サービス名
${serviceName}

## サービス概要
${overview}

## 解決する課題
${problem}

## 理想の状態
${ideal}

## 解決策
${solution}

## 機能詳細
${features}
    `.trim();

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .insert({
        title: serviceName.split('\n')[0] || 'New Service',
        description,
        owner_id: user.id,
        category: 'その他',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (ideaError) {
      console.error('Failed to save idea:', ideaError);
      return NextResponse.json(
        { error: 'Failed to save idea' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      ideaId: idea.id 
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}