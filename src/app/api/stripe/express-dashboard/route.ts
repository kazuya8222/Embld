import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Stripe account ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.stripe_account_id) {
      return NextResponse.json({ error: 'No Stripe account found' }, { status: 404 })
    }

    // Create account session for Express dashboard
    const accountSession = await stripe.accountSessions.create({
      account: userData.stripe_account_id,
      components: {
        account_onboarding: { enabled: true },
        payments: { enabled: true },
        payouts: { enabled: true }
      }
    })

    return NextResponse.json({ 
      client_secret: accountSession.client_secret 
    })
  } catch (error) {
    console.error('Express dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard session' },
      { status: 500 }
    )
  }
}