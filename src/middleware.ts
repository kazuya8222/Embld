import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // Refresh session if expired - required for Server Components
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protected routes that require username to be set
    const protectedRoutes = ['/ideas/new']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Profile pages require auth but settings page doesn't require username
    const isProfilePage = request.nextUrl.pathname.startsWith('/profile')
    const isProfileSettings = request.nextUrl.pathname.startsWith('/profile/settings')

    // If accessing protected route or profile without auth, redirect to login
    if ((isProtectedRoute || isProfilePage) && !user) {
      const redirectUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has completed profile setup (has username)
    if (user && !isProfileSettings) {
      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single()

      // If username is not set and not on profile settings page, redirect to profile settings
      if (!profile?.username && 
          !request.nextUrl.pathname.startsWith('/profile/settings') &&
          !request.nextUrl.pathname.startsWith('/auth/login') &&
          !request.nextUrl.pathname.startsWith('/auth/register') &&
          !request.nextUrl.pathname.startsWith('/auth/callback')) {
        const redirectUrl = new URL('/profile/settings', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If authenticated user with username tries to access auth pages, redirect to home
    if (user && (request.nextUrl.pathname.startsWith('/auth/login') || 
                 request.nextUrl.pathname.startsWith('/auth/register'))) {
      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single()
      
      if (profile?.username) {
        const redirectUrl = new URL('/home', request.url)
        return NextResponse.redirect(redirectUrl)
      }
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