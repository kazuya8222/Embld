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

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // Calculate 70% for the user
    const userAmount = Math.floor(amount * 0.7)
    
    // Create transfer to Connect account
    const transfer = await stripe.transfers.create({
      amount: userAmount,
      currency: 'jpy',
      destination: targetUser.stripe_account_id,
      description: description || `Revenue share for user ${targetUser.email}`,
      metadata: {
        user_id: userId,
        original_amount: amount,
        share_percentage: 70
      }
    })

    // Record the distribution in database
    const { error: insertError } = await supabase
      .from('revenue_distributions')
      .insert({
        user_id: userId,
        original_amount: amount,
        distributed_amount: userAmount,
        stripe_transfer_id: transfer.id,
        status: 'completed',
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to record distribution:', insertError)
    }

    // Also create a payout record
    const { error: payoutError } = await supabase
      .from('payouts')
      .insert({
        user_id: userId,
        amount: userAmount,
        currency: 'jpy',
        status: 'completed',
        transaction_id: transfer.id,
        created_at: new Date().toISOString(),
        transferred_at: new Date().toISOString()
      })

    if (payoutError) {
      console.error('Failed to create payout record:', payoutError)
    }

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        amount: userAmount,
        original_amount: amount,
        destination: targetUser.stripe_account_id,
        created: transfer.created
      }
    })
  } catch (error: any) {
    console.error('Transfer API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create transfer' },
      { status: 500 }
    )
  }
}

// GET method to list all users with their pending amounts
export async function GET(request: NextRequest) {
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

    // Get all users with Stripe accounts
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        stripe_account_id,
        stripe_onboarding_completed,
        created_at
      `)
      .not('stripe_account_id', 'is', null)
      .eq('stripe_onboarding_completed', true)

    if (usersError) {
      console.error('Failed to fetch users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Get pending revenue for each user (this is a simplified example)
    // In production, you'd calculate based on actual sales/transactions
    const usersWithRevenue = await Promise.all(users.map(async (user) => {
      // Get total payouts for this user
      const { data: payouts } = await supabase
        .from('payouts')
        .select('amount')
        .eq('user_id', user.id)
      
      const totalPaid = payouts?.reduce((sum, p) => sum + p.amount, 0) || 0

      // Get Stripe balance if available
      let stripeBalance = null
      try {
        const balance = await stripe.balance.retrieve({
          stripeAccount: user.stripe_account_id
        })
        stripeBalance = balance.available.find(b => b.currency === 'jpy')?.amount || 0
      } catch (err) {
        console.error(`Failed to get balance for ${user.email}:`, err)
      }

      return {
        ...user,
        total_paid: totalPaid,
        stripe_balance: stripeBalance,
        pending_amount: 0 // This should be calculated based on actual sales
      }
    }))

    return NextResponse.json({
      users: usersWithRevenue
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}