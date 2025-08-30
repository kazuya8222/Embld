import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabase = createClient();

    if (userId) {
      // userIdが指定されている場合、そのユーザーが企画書提出者のプロダクトのみを取得
      const { data: userProducts, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          overview,
          description,
          featured_image,
          video_url,
          app_store_url,
          google_play_url,
          status,
          tech_stack,
          created_at,
          proposals!inner (
            service_name,
            user_id
          )
        `)
        .eq('proposals.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user products:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const formattedProducts = (userProducts || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.overview || p.description,
        images: p.featured_image ? [p.featured_image] : [],
        video_url: p.video_url,
        like_count: 0,
        category: p.status,
        demo_url: p.video_url,
        github_url: null,
        tags: p.tech_stack || [],
        created_at: p.created_at,
        type: 'developed_product',
        status: p.status,
        app_store_url: p.app_store_url,
        google_play_url: p.google_play_url,
        proposal_user_id: (p.proposals as any)?.user_id
      }));

      return NextResponse.json({ data: formattedProducts });
    } else {
      // userIdが指定されていない場合、全ての公開プロダクトを取得（従来の動作）
      const { data: developedProducts, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          overview,
          description,
          featured_image,
          video_url,
          app_store_url,
          google_play_url,
          status,
          tech_stack,
          created_at,
          proposals!inner (
            service_name,
            user_id
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching developed products:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const formattedProducts = (developedProducts || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.overview || p.description,
        images: p.featured_image ? [p.featured_image] : [],
        video_url: p.video_url,
        like_count: 0,
        category: p.status,
        demo_url: p.video_url,
        github_url: null,
        tags: p.tech_stack || [],
        created_at: p.created_at,
        type: 'developed_product',
        status: p.status,
        app_store_url: p.app_store_url,
        google_play_url: p.google_play_url,
        proposal_user_id: (p.proposals as any)?.user_id
      }));

      return NextResponse.json({ data: formattedProducts });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}