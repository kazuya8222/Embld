import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/owners'

  if (code) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      console.log('OAuth callback successful for user:', data.user.email)
      
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        console.log('Creating new user profile for OAuth user')
        // Create user profile for OAuth users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            username: null, // Will be set later
            avatar_url: data.user.user_metadata?.avatar_url,
            google_avatar_url: data.user.user_metadata?.avatar_url,
            auth_provider: 'google',
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      // Check if username is set
      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', data.user.id)
        .single()

      if (!profile?.username) {
        return NextResponse.redirect(`${origin}/owners/profile/edit`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  console.error('OAuth callback error or no code provided')
  return NextResponse.redirect(`${origin}/owners/auth/login?error=認証に失敗しました`)
}