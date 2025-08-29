import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// ブログ投稿用のAPI
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      tags,
      status,
      published_at
    } = body;

    // バリデーション
    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと本文は必須です' },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'スラッグは必須です' },
        { status: 400 }
      );
    }

    // スラッグのフォーマット検証
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { error: 'スラッグは英数字とハイフンのみ使用できます' },
        { status: 400 }
      );
    }

    // スラッグの重複チェック
    const { data: existingBlog } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingBlog) {
      return NextResponse.json(
        { error: 'このスラッグは既に使用されています' },
        { status: 400 }
      );
    }

    // ブログデータの準備
    const blogData = {
      title,
      slug,
      excerpt: excerpt || content.substring(0, 200) + '...',
      content,
      featured_image: featured_image || null,
      author_id: user.id,
      category: 'ブログ',
      tags: tags || [],
      status: status || 'draft',
      published_at: status === 'published' ? (published_at || new Date().toISOString()) : null,
    };

    // ブログを挿入
    const { data, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select()
      .single();

    if (error) {
      console.error('ブログ挿入エラー:', error);
      return NextResponse.json(
        { error: 'ブログの保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blog: data
    });

  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ブログ更新用のAPI
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      tags,
      status,
      published_at
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ブログIDが必要です' },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと本文は必須です' },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'スラッグは必須です' },
        { status: 400 }
      );
    }

    // スラッグのフォーマット検証
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { error: 'スラッグは英数字とハイフンのみ使用できます' },
        { status: 400 }
      );
    }

    // スラッグの重複チェック（自分以外）
    const { data: existingBlog } = await supabase
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingBlog) {
      return NextResponse.json(
        { error: 'このスラッグは既に使用されています' },
        { status: 400 }
      );
    }

    // ブログデータの準備
    const updateData: any = {
      title,
      slug,
      excerpt,
      content,
      featured_image: featured_image || null,
      category: 'ブログ',
      tags,
      status,
      updated_at: new Date().toISOString()
    };

    // 公開状態に変更する場合、published_atを設定
    if (status === 'published') {
      // 既存のpublished_atを取得
      const { data: existingBlog } = await supabase
        .from('blogs')
        .select('published_at')
        .eq('id', id)
        .single();

      // 初回公開の場合のみpublished_atを設定
      if (!existingBlog?.published_at) {
        updateData.published_at = published_at || new Date().toISOString();
      }
    }

    // ブログを更新
    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('ブログ更新エラー:', error);
      return NextResponse.json(
        { error: 'ブログの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blog: data
    });

  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}