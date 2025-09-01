import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

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

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!userData.stripe_account_id) {
      return NextResponse.json({ 
        balance: {
          available: [],
          pending: [],
          instant_available: []
        },
        error: 'No Stripe account connected' 
      }, { status: 200 })
    }

    if (!userData.stripe_onboarding_completed) {
      return NextResponse.json({ 
        balance: {
          available: [],
          pending: [],
          instant_available: []
        },
        error: 'Stripe onboarding not completed' 
      }, { status: 200 })
    }

    // Get balance from Stripe Connect account
    const balance = await stripe.balance.retrieve({
      stripeAccount: userData.stripe_account_id
    })

    // Get recent transactions (optional - for transaction history)
    const transactions = await stripe.balanceTransactions.list({
      limit: 10
    }, {
      stripeAccount: userData.stripe_account_id
    })

    return NextResponse.json({
      balance: {
        available: balance.available,
        pending: balance.pending,
        instant_available: balance.instant_available || []
      },
      transactions: transactions.data,
      currency: 'jpy'
    })
  } catch (error) {
    console.error('Balance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}