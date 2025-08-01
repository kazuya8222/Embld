import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 保護されたルートへのアクセス制御
  // /home と /ideas/[id] は誰でもアクセス可能に変更
  const protectedPaths = ['/profile', '/ideas/new', '/ideas/*/edit']
  const isProtectedPath = protectedPaths.some(path => {
    const pattern = path.replace('*', '[^/]+')
    const regex = new RegExp(`^${pattern}$`)
    return regex.test(request.nextUrl.pathname)
  })

  if (!session && isProtectedPath) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // ログイン済みのユーザーがログインページにアクセスした場合
  if (session && request.nextUrl.pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // ルートページへのアクセス時の処理は削除（ランディングページを表示）

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}