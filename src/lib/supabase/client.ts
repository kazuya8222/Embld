'use client'

import { createBrowserClient } from '@supabase/ssr'

// シングルトンインスタンスを作成
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient(forceNew = false) {
  if (!supabaseInstance || forceNew) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            if (typeof window !== 'undefined') {
              console.log('Cookie get called for:', name)
              const cookies = document.cookie.split('; ')
              
              // 分割されたauth-tokenを処理
              if (name === 'sb-arnchxwpxpibbhxvdnov-auth-token') {
                const part0 = cookies.find(c => c.startsWith(`${name}.0=`))
                const part1 = cookies.find(c => c.startsWith(`${name}.1=`))
                
                if (part0) {
                  // base64-プレフィックスを除去して結合
                  let value0 = part0.split('=')[1]
                  if (value0.startsWith('base64-')) {
                    value0 = value0.substring(7) // 'base64-'を除去
                  }
                  
                  let fullValue = value0
                  if (part1) {
                    let value1 = part1.split('=')[1]
                    fullValue += value1
                  }
                  
                  // Base64デコード
                  try {
                    const decoded = atob(fullValue)
                    console.log('Cookie decoded successfully for:', name)
                    return decoded
                  } catch (e) {
                    console.error('Failed to decode cookie:', e)
                    return fullValue // デコードできない場合はそのまま返す
                  }
                }
              }
              
              // 通常のCookie取得
              const cookie = cookies.find((row) => row.startsWith(`${name}=`))
              if (cookie) {
                const value = cookie.split('=')[1]
                console.log('Cookie found for:', name, 'length:', value.length)
                return decodeURIComponent(value)
              }
              
              console.log('Cookie not found for:', name)
              return undefined
            }
            return undefined
          },
          set(name: string, value: string, options?: any) {
            if (typeof window !== 'undefined') {
              // 大きなCookieは分割して保存される可能性があるため対応
              document.cookie = `${name}=${encodeURIComponent(value)}; path=/; ${options?.maxAge ? `max-age=${options.maxAge};` : ''} ${options?.sameSite ? `SameSite=${options.sameSite};` : ''}`
            }
          },
          remove(name: string, options?: any) {
            if (typeof window !== 'undefined') {
              document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
              // 分割されたCookieも削除
              document.cookie = `${name}.0=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
              document.cookie = `${name}.1=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            }
          },
        },
      }
    )
  }
  return supabaseInstance
}