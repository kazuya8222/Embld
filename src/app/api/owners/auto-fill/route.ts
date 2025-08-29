import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      // URLからWebサイト情報を取得
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EMBLD/1.0; +https://embld.com)',
        },
      });

      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch website' }, { status: 400 });
      }

      const html = await response.text();
      
      // HTML parsing for meta information
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descriptionMatch = html.match(/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i) ||
                              html.match(/<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i);
      
      const keywordsMatch = html.match(/<meta[^>]+name=["\']keywords["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i);
      const ogImageMatch = html.match(/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"']+)["\'][^>]*>/i);

      // Extract information
      const title = titleMatch ? titleMatch[1].trim() : '';
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';
      const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];
      const ogImage = ogImageMatch ? ogImageMatch[1] : '';


      // Try to detect platform
      const platform = ['Web']; // Default to Web
      if (html.includes('app-store') || html.includes('App Store')) platform.push('iOS');
      if (html.includes('google-play') || html.includes('Google Play')) platform.push('Android');

      // Simple category detection based on keywords and content
      let category = 'その他';
      const content = html.toLowerCase();
      
      if (content.includes('ecommerce') || content.includes('shop') || content.includes('store')) {
        category = 'ショッピング';
      } else if (content.includes('social') || content.includes('chat') || content.includes('message')) {
        category = 'ソーシャルネットワーキング';
      } else if (content.includes('game') || content.includes('gaming')) {
        category = 'ゲーム';
      } else if (content.includes('productivity') || content.includes('task') || content.includes('todo')) {
        category = '仕事効率化';
      } else if (content.includes('health') || content.includes('fitness') || content.includes('medical')) {
        category = 'ヘルスケア/フィットネス';
      } else if (content.includes('finance') || content.includes('money') || content.includes('payment')) {
        category = 'ファイナンス';
      } else if (content.includes('education') || content.includes('learning') || content.includes('course')) {
        category = '教育';
      } else if (content.includes('photo') || content.includes('video') || content.includes('camera')) {
        category = '写真/ビデオ';
      } else if (content.includes('music') || content.includes('audio') || content.includes('sound')) {
        category = 'ミュージック';
      } else if (content.includes('news') || content.includes('article')) {
        category = 'ニュース';
      } else if (content.includes('travel') || content.includes('trip') || content.includes('hotel')) {
        category = 'トラベル';
      } else if (content.includes('food') || content.includes('recipe') || content.includes('restaurant')) {
        category = 'フード/ドリンク';
      } else if (content.includes('business') || content.includes('corporate') || content.includes('enterprise')) {
        category = 'ビジネス';
      } else if (content.includes('utility') || content.includes('tool') || content.includes('calculator')) {
        category = 'ユーティリティ';
      } else if (content.includes('entertainment') || content.includes('fun') || content.includes('leisure')) {
        category = 'エンタメ';
      } else if (content.includes('lifestyle') || content.includes('daily')) {
        category = 'ライフスタイル';
      }

      return NextResponse.json({
        title: title.substring(0, 100), // Limit title length
        description: description.substring(0, 500), // Limit description length
        category,
        platform: platform,
        images: ogImage ? [ogImage] : [],
      });

    } catch (fetchError) {
      console.error('Error fetching website:', fetchError);
      return NextResponse.json({ error: 'Failed to analyze website' }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}