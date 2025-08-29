import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const {
      title,
      overview,
      description,
      icon_url,
      category,
      demo_url,
      github_url,
      video_url,
      tags,
      is_public,
      approval_status
    } = body;

    if (!title || !overview || !description || !category) {
      return NextResponse.json(
        { error: 'Title, overview, description, and category are required' },
        { status: 400 }
      );
    }

    // Get current user for user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('embld_products')
      .insert({
        title,
        overview,
        description,
        icon_url: icon_url || null,
        category,
        demo_url: demo_url || null,
        github_url: github_url || null,
        video_url: video_url || null,
        tags: tags || [],
        like_count: 0,
        user_id: user.id,
        is_public: is_public !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { id, is_public } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('embld_products')
      .update({
        is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}