import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// デバッグ用ログ（常に表示）
console.log('Supabase client config check:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
  key: supabaseKey ? `${supabaseKey.substring(0, 30)}...` : 'missing',
  urlType: typeof supabaseUrl,
  keyType: typeof supabaseKey
})

// シングルトンパターンでクライアントを保持
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    })
    throw new Error('Missing Supabase environment variables')
  }
  
  // 既存のクライアントがあればそれを返す
  if (supabaseClient) {
    console.log('Returning existing Supabase client')
    return supabaseClient
  }
  
  console.log('Creating new Supabase client with options...')
  
  supabaseClient = createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      // fetch関数をカスタマイズ
      global: {
        fetch: async (url, options = {}) => {
          console.log('Supabase fetch:', url)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒
          
          try {
            const response = await fetch(url, {
              ...options,
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            return response
          } catch (error) {
            clearTimeout(timeoutId)
            console.error('Fetch error:', error)
            throw error
          }
        }
      }
    }
  );
  
  console.log('Supabase client created:', supabaseClient)
  
  return supabaseClient;
};