import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// デバッグ用ログ
if (typeof window !== 'undefined') {
  console.log('Supabase client config:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    key: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'MISSING',
    env: process.env.NODE_ENV
  })
}

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
};