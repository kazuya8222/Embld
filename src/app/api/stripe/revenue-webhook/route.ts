import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Use service role client for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_REVENUE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Record transaction
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            stripe_payment_intent_id: paymentIntent.id,
            product_id: paymentIntent.metadata.product_id || null,
            buyer_email: paymentIntent.receipt_email || 'unknown',
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            metadata: paymentIntent.metadata
          })
          .select()
          .single()

        if (transactionError) {
          console.error('Failed to record transaction:', transactionError)
          throw transactionError
        }

        // Calculate and create payout record
        const ownerUserId = paymentIntent.metadata.owner_user_id
        const ownerShare = parseInt(paymentIntent.metadata.owner_share || '0')

        if (ownerUserId && ownerShare > 0) {
          // Create payout record (transfer will happen separately)
          const { error: payoutError } = await supabase
            .from('payouts')
            .insert({
              transaction_id: transaction.id,
              user_id: ownerUserId,
              amount: ownerShare,
              currency: paymentIntent.currency,
              percentage: 30, // 30% share
              status: 'pending'
            })

          if (payoutError) {
            console.error('Failed to create payout record:', payoutError)
          }

          // Update revenue analytics
          const today = new Date().toISOString().split('T')[0]
          const { data: existingAnalytics } = await supabase
            .from('revenue_analytics')
            .select('*')
            .eq('user_id', ownerUserId)
            .eq('product_id', paymentIntent.metadata.product_id || null)
            .eq('date', today)
            .single()

          if (existingAnalytics) {
            // Update existing record
            await supabase
              .from('revenue_analytics')
              .update({
                revenue: existingAnalytics.revenue + paymentIntent.amount,
                payout_amount: existingAnalytics.payout_amount + ownerShare,
                transaction_count: existingAnalytics.transaction_count + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingAnalytics.id)
          } else {
            // Create new record
            await supabase
              .from('revenue_analytics')
              .insert({
                user_id: ownerUserId,
                product_id: paymentIntent.metadata.product_id || null,
                date: today,
                revenue: paymentIntent.amount,
                payout_amount: ownerShare,
                transaction_count: 1
              })
          }

          // Create transfer to connected account if they have completed onboarding
          const { data: userData } = await supabase
            .from('users')
            .select('stripe_account_id, stripe_onboarding_completed')
            .eq('id', ownerUserId)
            .single()

          if (userData?.stripe_account_id && userData?.stripe_onboarding_completed) {
            try {
              const transfer = await stripe.transfers.create({
                amount: ownerShare,
                currency: paymentIntent.currency,
                destination: userData.stripe_account_id,
                transfer_group: paymentIntent.id,
                metadata: {
                  payment_intent_id: paymentIntent.id,
                  product_id: paymentIntent.metadata.product_id || '',
                  user_id: ownerUserId
                }
              })

              // Update payout with transfer ID
              await supabase
                .from('payouts')
                .update({
                  stripe_transfer_id: transfer.id,
                  status: 'completed',
                  transferred_at: new Date().toISOString()
                })
                .eq('transaction_id', transaction.id)
                .eq('user_id', ownerUserId)

            } catch (transferError) {
              console.error('Transfer failed:', transferError)
              // Mark payout as failed
              await supabase
                .from('payouts')
                .update({ status: 'failed' })
                .eq('transaction_id', transaction.id)
                .eq('user_id', ownerUserId)
            }
          }
        }

        // Update product revenue if exists
        if (paymentIntent.metadata.product_id) {
          const { data: revenueData } = await supabase
            .from('product_revenue')
            .select('*')
            .eq('product_id', paymentIntent.metadata.product_id)
            .eq('date', new Date().toISOString().split('T')[0])
            .single()

          if (revenueData) {
            // Update existing record
            await supabase
              .from('product_revenue')
              .update({
                revenue: revenueData.revenue + paymentIntent.amount,
                customer_count: revenueData.customer_count + 1,
                user_share: revenueData.user_share + ownerShare
              })
              .eq('id', revenueData.id)
          } else {
            // Create new record
            await supabase
              .from('product_revenue')
              .insert({
                product_id: paymentIntent.metadata.product_id,
                date: new Date().toISOString().split('T')[0],
                revenue: paymentIntent.amount,
                customer_count: 1,
                user_share: ownerShare
              })
          }
        }

        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        
        // Update payout status
        await supabase
          .from('payouts')
          .update({
            status: 'completed',
            transferred_at: new Date().toISOString()
          })
          .eq('stripe_transfer_id', transfer.id)

        break
      }

      // Note: transfer.failed event handling would go here
      // but it's not available in the current Stripe API version

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        
        // Update user's Stripe account status
        const isComplete = account.charges_enabled && account.payouts_enabled
        
        await supabase
          .from('users')
          .update({ stripe_onboarding_completed: isComplete })
          .eq('stripe_account_id', account.id)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}