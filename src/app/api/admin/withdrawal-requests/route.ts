import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

// GET all withdrawal requests for admin
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

    // Get all withdrawal requests with user info
    const { data: requests, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        users!withdrawal_requests_user_id_fkey (
          id,
          email,
          stripe_account_id
        )
      `)
      .order('requested_at', { ascending: false })

    if (fetchError) {
      console.error('Failed to fetch withdrawal requests:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch withdrawal requests' 
      }, { status: 500 })
    }

    return NextResponse.json({
      requests: requests || []
    })
  } catch (error) {
    console.error('Admin withdrawal requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal requests' },
      { status: 500 }
    )
  }
}

// Process withdrawal request (approve/reject)
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
    const { requestId, action, rejectionReason } = body

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the withdrawal request
    const { data: withdrawalRequest, error: requestError } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        users!withdrawal_requests_user_id_fkey (
          id,
          email,
          stripe_account_id,
          stripe_onboarding_completed
        )
      `)
      .eq('id', requestId)
      .single()

    if (requestError || !withdrawalRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (withdrawalRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Request has already been processed' 
      }, { status: 400 })
    }

    if (action === 'reject') {
      // Reject the request
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          rejection_reason: rejectionReason || 'Admin rejected'
        })
        .eq('id', requestId)

      if (updateError) {
        console.error('Failed to reject request:', updateError)
        return NextResponse.json({ 
          error: 'Failed to reject request' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Request rejected'
      })
    }

    if (action === 'approve') {
      // Verify Stripe account
      if (!withdrawalRequest.users.stripe_account_id || !withdrawalRequest.users.stripe_onboarding_completed) {
        return NextResponse.json({ 
          error: 'User has not completed Stripe onboarding' 
        }, { status: 400 })
      }

      // Update status to processing
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'processing',
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', requestId)

      try {
        // Create payout in Stripe
        const payout = await stripe.payouts.create({
          amount: withdrawalRequest.amount,
          currency: 'jpy',
          description: `Payout for ${withdrawalRequest.users.email}`,
          metadata: {
            user_id: withdrawalRequest.user_id,
            request_id: requestId
          }
        }, {
          stripeAccount: withdrawalRequest.users.stripe_account_id
        })

        // Update request with payout ID
        const { error: finalUpdateError } = await supabase
          .from('withdrawal_requests')
          .update({
            status: 'completed',
            stripe_payout_id: payout.id
          })
          .eq('id', requestId)

        if (finalUpdateError) {
          console.error('Failed to update request after payout:', finalUpdateError)
        }

        // Also create a payout record
        await supabase
          .from('payouts')
          .insert({
            user_id: withdrawalRequest.user_id,
            amount: withdrawalRequest.amount,
            currency: 'jpy',
            status: 'completed',
            stripe_payout_id: payout.id,
            transaction_id: payout.id,
            created_at: new Date().toISOString(),
            transferred_at: new Date().toISOString()
          })

        return NextResponse.json({
          success: true,
          payout: {
            id: payout.id,
            amount: payout.amount,
            status: payout.status
          }
        })
      } catch (stripeError: any) {
        console.error('Stripe payout error:', stripeError)
        
        // Revert status to pending on error
        await supabase
          .from('withdrawal_requests')
          .update({
            status: 'pending',
            processed_at: null,
            processed_by: null,
            notes: `Payout failed: ${stripeError.message}`
          })
          .eq('id', requestId)

        return NextResponse.json({ 
          error: stripeError.message || 'Failed to create payout' 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })
  } catch (error) {
    console.error('Process withdrawal request error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}