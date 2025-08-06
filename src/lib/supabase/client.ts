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
    
    // initializePromiseの状態をデバッグ用に確認
    if (typeof window !== 'undefined') {
      const authClient = (supabaseClient as any).auth;
      if (authClient && authClient.initializePromise) {
        console.log('initializePromise exists, checking state...');
        // Promiseの状態を確認（非同期）
        Promise.race([
          authClient.initializePromise.then(() => console.log('initializePromise: resolved')),
          new Promise(resolve => setTimeout(() => {
            console.log('initializePromise: still pending after 100ms');
            resolve('pending');
          }, 100))
        ]);
      }
    }
    
    return supabaseClient
  }
  
  console.log('Creating new Supabase client with options...')
  
  // isSingletonオプションを明示的にtrueに設定
  // これにより、クライアントがブラウザ全体で共有され、
  // 初期化が一度だけ行われる
  supabaseClient = createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      // シングルトンを強制
      isSingleton: true
    } as any
  );
  
  console.log('Supabase client created:', supabaseClient)
  
  // 初期化後、すぐにinitializePromiseの状態を確認
  if (typeof window !== 'undefined') {
    const authClient = (supabaseClient as any).auth;
    if (authClient && authClient.initializePromise) {
      console.log('New client initializePromise found, resolving it immediately...');
      // initializePromiseを即座に解決するために、getSessionを呼び出す
      authClient.getSession().then((result: any) => {
        console.log('Initial getSession called:', { 
          hasSession: !!result.data?.session,
          error: result.error 
        });
      }).catch((err: any) => {
        console.error('Error calling getSession:', err);
      });
    }
  }
  
  return supabaseClient;
};