import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const endpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServerClient()

  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        
        // Check if onboarding is complete
        const isComplete = account.charges_enabled && account.payouts_enabled
        
        // Update user in database
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_onboarding_completed: isComplete,
            stripe_account_updated_at: new Date().toISOString()
          })
          .eq('stripe_account_id', account.id)

        if (updateError) {
          console.error('Failed to update user:', updateError)
          return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
          )
        }

        console.log(`Account ${account.id} updated. Onboarding complete: ${isComplete}`)
        break
      }

      case 'account.application.deauthorized': {
        const account = event.data.object as Stripe.Account
        
        // Clear Stripe account data when disconnected
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_account_id: null,
            stripe_onboarding_completed: false,
            stripe_account_created_at: null,
            stripe_account_updated_at: null
          })
          .eq('stripe_account_id', account.id)

        if (updateError) {
          console.error('Failed to clear user Stripe data:', updateError)
        }

        console.log(`Account ${account.id} deauthorized`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}