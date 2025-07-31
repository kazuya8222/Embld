// Supabaseクライアントライブラリがタイムアウトする問題の代替実装
// 直接REST APIを使用してデータベース操作を行う

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface SupabaseError {
  message: string
  details: string
  hint: string
  code: string
}

export class DirectSupabaseClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = `${supabaseUrl}/rest/v1`
    this.headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }

  // テーブルから選択
  async select(table: string, columns = '*', filters?: Record<string, any>) {
    try {
      let url = `${this.baseUrl}/${table}?select=${columns}`
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          url += `&${key}=eq.${value}`
        })
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        const error: SupabaseError = await response.json()
        throw new Error(`${error.message}: ${error.details}`)
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  // テーブルに挿入
  async insert(table: string, data: Record<string, any>) {
    try {
      const response = await fetch(`${this.baseUrl}/${table}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        const error: SupabaseError = await response.json()
        throw new Error(`${error.message}: ${error.details}`)
      }

      const result = await response.json()
      return { data: result[0] || result, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  // テーブルを更新
  async update(table: string, data: Record<string, any>, filters: Record<string, any>) {
    try {
      let url = `${this.baseUrl}/${table}?`
      Object.entries(filters).forEach(([key, value], index) => {
        if (index > 0) url += '&'
        url += `${key}=eq.${value}`
      })

      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        const error: SupabaseError = await response.json()
        throw new Error(`${error.message}: ${error.details}`)
      }

      const result = await response.json()
      return { data: result, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  // 認証: パスワードでログイン
  async signInWithPassword(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error_description || error.message || 'ログインに失敗しました')
      }

      const result = await response.json()
      
      // セッションをローカルストレージに保存
      if (result.access_token) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(result))
      }

      return { data: { user: result.user, session: result }, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  // 現在のセッションを取得
  async getSession() {
    try {
      const storedSession = localStorage.getItem('supabase.auth.token')
      if (!storedSession) {
        return { data: { session: null }, error: null }
      }

      const session = JSON.parse(storedSession)
      
      // トークンの有効期限をチェック
      if (session.expires_at && Date.now() / 1000 > session.expires_at) {
        localStorage.removeItem('supabase.auth.token')
        return { data: { session: null }, error: null }
      }
      
      return { data: { session }, error: null }
    } catch (error: any) {
      return { data: { session: null }, error: { message: error.message } }
    }
  }

  // 現在のユーザーを取得
  async getUser() {
    try {
      const { data } = await this.getSession()
      if (!data.session) {
        return { data: { user: null }, error: null }
      }

      return { data: { user: data.session.user }, error: null }
    } catch (error: any) {
      return { data: { user: null }, error: { message: error.message } }
    }
  }

  // ログアウト
  async signOut() {
    try {
      localStorage.removeItem('supabase.auth.token')
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  }

  // 認証されたリクエスト用のヘッダーを取得
  private async getAuthHeaders() {
    const { data } = await this.getSession()
    const headers = { ...this.headers }
    
    if (data.session?.access_token) {
      headers['Authorization'] = `Bearer ${data.session.access_token}`
    }
    
    return headers
  }
}

// シングルトンインスタンスをエクスポート
export const directSupabase = new DirectSupabaseClient()