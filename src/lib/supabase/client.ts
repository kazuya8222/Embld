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

// グローバルスコープでクライアントを作成（一度だけ）
const supabaseClient = (() => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    })
    throw new Error('Missing Supabase environment variables')
  }
  
  console.log('Creating Supabase client at module load time...')
  
  const client = createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
  
  console.log('Supabase client created:', client)
  
  // クライアント作成直後に初期化を強制的に開始
  if (typeof window !== 'undefined') {
    console.log('Browser environment detected, forcing initialization...');
    
    // 1. まずgetSessionを呼んで初期化を開始
    client.auth.getSession().then((result) => {
      console.log('Initial getSession completed:', { 
        hasSession: !!result.data?.session,
        error: result.error 
      });
    }).catch((err) => {
      console.error('Initial getSession error:', err);
    });
    
    // 2. initializePromiseが存在する場合、それも待つ
    const authClient = (client as any).auth;
    if (authClient && authClient.initializePromise) {
      console.log('Waiting for initializePromise...');
      authClient.initializePromise.then(() => {
        console.log('initializePromise resolved successfully');
      }).catch((err: any) => {
        console.error('initializePromise error:', err);
      });
    }
  }
  
  return client;
})();

// エクスポートする関数は単にクライアントを返すだけ
export const createClient = () => {
  // initializePromiseの現在の状態をチェック（デバッグ用）
  if (typeof window !== 'undefined') {
    const authClient = (supabaseClient as any).auth;
    if (authClient && authClient.initializePromise) {
      // Promiseの状態を非同期でチェック
      Promise.race([
        authClient.initializePromise.then(() => 'resolved'),
        new Promise(resolve => setTimeout(() => resolve('pending'), 10))
      ]).then(state => {
        console.log(`createClient called, initializePromise state: ${state}`);
      });
    }
  }
  
  return supabaseClient;
};