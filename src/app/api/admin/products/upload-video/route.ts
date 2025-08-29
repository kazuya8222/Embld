import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Invalid file type. Only videos are allowed.' }, { status: 400 });
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 100MB.' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const fileName = `product-video-${timestamp}-${randomString}.${extension}`;
    const filePath = `product-videos/${fileName}`;

    // Upload to Supabase Storage with proper headers for streaming
    const { data, error } = await supabase.storage
      .from('product-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        duplex: 'half'
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-videos')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}