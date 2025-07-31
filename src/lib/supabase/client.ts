import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 開発環境でのデバッグ用ログ
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase client config:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
    key: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'missing'
  })
}

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    })
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      db: {
        schema: 'public'
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'embld-app'
        }
      }
    }
  );
};