import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('embld_products')
      .select(`
        id,
        title,
        description,
        images,
        like_count,
        category,
        user_id,
        demo_url,
        github_url,
        tags,
        created_at
      `)
      .eq('is_public', true)
      .eq('approval_status', 'approved')
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching embld products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}