import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const endpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log('🔔 Connect webhook received at:', new Date().toISOString())
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    console.log('✅ Webhook signature verified. Event type:', event.type, 'Event ID:', event.id)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
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
        
        console.log(`🔄 Processing account.updated for ID: ${account.id}`)
        
        // Check if user exists with this account ID
        const { data: existingUser, error: findError } = await supabase
          .from('users')
          .select('id, email, stripe_account_id')
          .eq('stripe_account_id', account.id)
          .single()

        if (findError) {
          console.error('❌ User not found for account ID:', account.id, 'Error:', findError)
          console.log('📋 Available users with stripe_account_id:')
          const { data: allUsers } = await supabase
            .from('users')
            .select('id, email, stripe_account_id')
            .not('stripe_account_id', 'is', null)
          console.log(allUsers)
          return NextResponse.json({ received: true })
        }

        console.log(`✅ Found user: ${existingUser.email} for account: ${account.id}`)
        
        // Check if onboarding is complete
        const isComplete = account.charges_enabled && account.payouts_enabled
        
        // Update user in database with detailed information
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_onboarding_completed: isComplete,
            stripe_account_updated_at: new Date().toISOString(),
            stripe_connect_details_submitted: account.details_submitted || false,
            stripe_connect_payouts_enabled: account.payouts_enabled || false,
            stripe_connect_capabilities: account.capabilities || {},
            stripe_connect_requirements: account.requirements || {}
          })
          .eq('stripe_account_id', account.id)

        if (updateError) {
          console.error('❌ Failed to update user:', updateError)
          return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
          )
        }

        console.log(`✅ Account ${account.id} updated successfully. Complete: ${isComplete}, Details: ${account.details_submitted}, Payouts: ${account.payouts_enabled}`)
        break
      }

      case 'person.updated': {
        const person = event.data.object as any
        const accountId = person.account
        
        console.log(`Person updated for account ${accountId}`)
        
        // Get account details to check onboarding status
        try {
          const account = await stripe.accounts.retrieve(accountId)
          const isComplete = account.charges_enabled && account.payouts_enabled
          
          // Update user in database with detailed information
          const { error: updateError } = await supabase
            .from('users')
            .update({
              stripe_onboarding_completed: isComplete,
              stripe_account_updated_at: new Date().toISOString(),
              stripe_connect_details_submitted: account.details_submitted || false,
              stripe_connect_payouts_enabled: account.payouts_enabled || false,
              stripe_connect_capabilities: account.capabilities || {},
              stripe_connect_requirements: account.requirements || {}
            })
            .eq('stripe_account_id', accountId)

          if (updateError) {
            console.error('Failed to update user after person update:', updateError)
          } else {
            console.log(`User updated after person change. Account: ${accountId}, Complete: ${isComplete}, Details: ${account.details_submitted}, Payouts: ${account.payouts_enabled}`)
          }
        } catch (stripeError) {
          console.error('Failed to retrieve account details:', stripeError)
        }
        break
      }

      case 'account.external_account.updated': {
        const accountId = event.account as string // Connect アカウントのIDは event.account にある
        
        console.log(`🏦 External account (bank account) updated for account ${accountId}`)
        
        // Check if user exists with this account ID
        const { data: existingUser, error: findError } = await supabase
          .from('users')
          .select('id, email, stripe_account_id')
          .eq('stripe_account_id', accountId)
          .single()

        if (findError) {
          console.error('❌ User not found for external account update. Account ID:', accountId, 'Error:', findError)
          return NextResponse.json({ received: true })
        }

        console.log(`✅ Found user: ${existingUser.email} for external account update`)
        
        // Get full account details to check onboarding status
        try {
          const account = await stripe.accounts.retrieve(accountId)
          const isComplete = account.charges_enabled && account.payouts_enabled
          
          // Update user in database
          const { error: updateError } = await supabase
            .from('users')
            .update({
              stripe_onboarding_completed: isComplete,
              stripe_account_updated_at: new Date().toISOString(),
              stripe_connect_details_submitted: account.details_submitted || false,
              stripe_connect_payouts_enabled: account.payouts_enabled || false,
              stripe_connect_capabilities: account.capabilities || {},
              stripe_connect_requirements: account.requirements || {}
            })
            .eq('stripe_account_id', accountId)

          if (updateError) {
            console.error('❌ Failed to update user after external account update:', updateError)
          } else {
            console.log(`✅ External account update processed. Account: ${accountId}, Complete: ${isComplete}, Payouts: ${account.payouts_enabled}`)
          }
        } catch (stripeError) {
          console.error('Failed to retrieve account details after external account update:', stripeError)
        }
        break
      }

      case 'account.application.deauthorized': {
        const application = event.data.object as any
        const accountId = application.account
        
        // Clear Stripe account data when disconnected
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_account_id: null,
            stripe_onboarding_completed: false,
            stripe_account_created_at: null,
            stripe_account_updated_at: null
          })
          .eq('stripe_account_id', accountId)

        if (updateError) {
          console.error('Failed to clear user Stripe data:', updateError)
        }

        console.log(`Account ${accountId} deauthorized`)
        break
      }

      default:
        console.log(`⚠️  Unhandled event type: ${event.type}`)
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