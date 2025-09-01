import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Create Stripe Connect account and generate onboarding link
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a Stripe account
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id, stripe_onboarding_completed')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    let accountId = userData?.stripe_account_id

    // Create new Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: {
            type: "express",
          },
          fees: {
            payer: "application"
          },
          losses: {
            payments: "application"
          },
        },
        country: 'JP',
        email: user.email,
        metadata: {
          user_id: user.id
        }
      })

      accountId = account.id

      // Save account ID to database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          stripe_account_id: accountId,
          stripe_account_created_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        // Delete the Stripe account if DB update fails
        await stripe.accounts.del(accountId)
        return NextResponse.json({ error: 'Failed to save account' }, { status: 500 })
      }
    }

    // Generate onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    console.log('Base URL for redirect:', baseUrl)
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/dashboard/settings/stripe?refresh=true`,
      return_url: `${baseUrl}/dashboard/settings/stripe?success=true`,
      type: 'account_onboarding'
    })

    return NextResponse.json({ 
      url: accountLink.url,
      account_id: accountId 
    })
  } catch (error) {
    console.error('Stripe Connect error:', error)
    
    // More detailed error response for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error && 'type' in error ? (error as any).type : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      type: errorDetails,
      fullError: error
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to create Stripe Connect account',
        details: errorMessage,
        type: errorDetails
      },
      { status: 500 }
    )
  }
}

// Get Stripe Connect account status
export async function GET(request: NextRequest) {
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
      .select('stripe_account_id, stripe_onboarding_completed')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.stripe_account_id) {
      return NextResponse.json({ 
        connected: false,
        onboarding_completed: false 
      })
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(userData.stripe_account_id)

    // Check if onboarding is complete
    const isComplete = account.charges_enabled && account.payouts_enabled

    // Update database if status changed
    if (isComplete !== userData.stripe_onboarding_completed) {
      await supabase
        .from('users')
        .update({ stripe_onboarding_completed: isComplete })
        .eq('id', user.id)
    }

    return NextResponse.json({
      connected: true,
      onboarding_completed: isComplete,
      account: {
        id: account.id,
        email: account.email,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted
      }
    })
  } catch (error) {
    console.error('Stripe Connect status error:', error)
    return NextResponse.json(
      { error: 'Failed to get account status' },
      { status: 500 }
    )
  }
}