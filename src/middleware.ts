import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/lib/supabase/database.types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (!session && req.nextUrl.pathname.startsWith('/ideas/new')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (!session && req.nextUrl.pathname.startsWith('/premium')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/profile/:path*', '/ideas/new', '/premium/:path*']
}