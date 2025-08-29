import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// ブログ一覧取得用のAPI
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 管理者権限チェック
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userProfile?.is_admin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    // ブログ一覧を取得
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('ブログ取得エラー:', error);
      return NextResponse.json(
        { error: 'ブログの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blogs: blogs || []
    });

  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}