import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, one_liner, bio, location, website, x_account, instagram_account, tiktok_account, youtube_account } = body;

    // ユーザープロフィールを更新
    const { error } = await supabase
      .from('users')
      .update({
        username,
        one_liner,
        bio,
        location,
        website,
        x_account,
        instagram_account,
        tiktok_account,
        youtube_account,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: 'Profile update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}