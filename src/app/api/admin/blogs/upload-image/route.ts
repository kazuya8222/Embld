import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '対応していないファイル形式です。JPEG、PNG、GIF、WebPのみ対応しています。' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (5MB制限)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。' },
        { status: 400 }
      );
    }

    // ファイル名を生成（重複を避けるためにタイムスタンプとランダム文字列を追加）
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `blog-image-${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `blog-images/${fileName}`;

    try {
      // Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('アップロードエラー:', uploadError);
        return NextResponse.json(
          { error: 'ファイルのアップロードに失敗しました' },
          { status: 500 }
        );
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return NextResponse.json(
          { error: 'ファイルURLの取得に失敗しました' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        fileName: fileName,
        filePath: filePath
      });

    } catch (storageError) {
      console.error('Storage エラー:', storageError);
      return NextResponse.json(
        { error: 'ストレージエラーが発生しました' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}