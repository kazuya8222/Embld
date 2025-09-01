import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, amount, description } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get target user's Stripe account
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id, stripe_onboarding_completed, email')
      .eq('id', userId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    if (!targetUser.stripe_account_id || !targetUser.stripe_onboarding_completed) {
      return NextResponse.json({ 
        error: 'Target user has not completed Stripe onboarding' 
      }, { status: 400 })
    }

    // Check Connect account balance before creating payout
    const balance = await stripe.balance.retrieve({
      stripeAccount: targetUser.stripe_account_id
    })

    const availableBalance = balance.available.find(b => b.currency === 'jpy')?.amount || 0

    // Use specified amount or full available balance
    const payoutAmount = amount || availableBalance

    if (payoutAmount <= 0) {
      return NextResponse.json({ 
        error: 'No available balance to payout' 
      }, { status: 400 })
    }

    if (amount && amount > availableBalance) {
      return NextResponse.json({ 
        error: `Insufficient balance. Available: ¥${availableBalance}, Requested: ¥${amount}` 
      }, { status: 400 })
    }

    // Create payout from Connect account to their bank
    const payout = await stripe.payouts.create({
      amount: payoutAmount,
      currency: 'jpy',
      description: description || `Payout for ${targetUser.email}`,
      metadata: {
        user_id: userId,
        admin_initiated: 'true'
      }
    }, {
      stripeAccount: targetUser.stripe_account_id
    })

    // Record the payout in database
    const { error: insertError } = await supabase
      .from('payouts')
      .insert({
        user_id: userId,
        amount: payoutAmount,
        currency: 'jpy',
        status: payout.status,
        stripe_payout_id: payout.id,
        transaction_id: payout.id,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to record payout:', insertError)
    }

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payoutAmount,
        status: payout.status,
        arrival_date: payout.arrival_date,
        created: payout.created
      }
    })
  } catch (error: any) {
    console.error('Payout API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payout' },
      { status: 500 }
    )
  }
}