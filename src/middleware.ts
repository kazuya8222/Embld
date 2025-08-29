import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // Refresh session if expired - required for Server Components
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/help', '/contact', '/auth/login', '/auth/register']
    const isPublicLegalRoute = request.nextUrl.pathname.startsWith('/legal/')
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname) || isPublicLegalRoute

    // If accessing protected route without auth, redirect to login
    if (!isPublicRoute && !user) {
      const redirectUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If authenticated user tries to access auth pages, redirect to home
    if (user && (request.nextUrl.pathname.startsWith('/auth/login') || 
                 request.nextUrl.pathname.startsWith('/auth/register'))) {
      const redirectUrl = new URL('/home', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}