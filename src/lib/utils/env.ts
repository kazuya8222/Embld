// 環境に応じた設定を取得するユーティリティ
export const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    // クライアントサイド
    return window.location.origin
  }
  
  // サーバーサイド
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development'
}

export const isProduction = () => {
  return process.env.NODE_ENV === 'production'
}

export const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!
}

export const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
}