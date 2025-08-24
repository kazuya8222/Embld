import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceItems } = body;

    if (!serviceItems || !Array.isArray(serviceItems)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // serviceItemsから各項目を抽出
    const overview = serviceItems.find(item => item.id === 'overview')?.content || '';
    const problem = serviceItems.find(item => item.id === 'problem')?.content || '';
    const ideal = serviceItems.find(item => item.id === 'ideal')?.content || '';
    const solution = serviceItems.find(item => item.id === 'solution')?.content || '';
    const features = serviceItems.find(item => item.id === 'features')?.content || '';
    const serviceName = serviceItems.find(item => item.id === 'name')?.content || '';

    // 企画書をデータベースに保存
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        service_overview: overview,
        problem: problem,
        ideal: ideal,
        solution: solution,
        features: features,
        service_name: serviceName
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save proposal' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      proposalId: proposal.id,
      message: '企画書を保存しました'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}