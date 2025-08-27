import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { addCredits } from '@/lib/credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Debug webhook secret
console.log('Webhook secret configured:', !!webhookSecret, webhookSecret?.substring(0, 10) + '...');

export async function POST(request: NextRequest) {
  console.log('=== Stripe Webhook Received ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    console.log('Body length:', body.length);
    console.log('Has signature:', !!signature);

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Event type:', event.type);
      console.log('Event ID:', event.id);
    } catch (err: any) {
      console.log('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Handle the event
    console.log('Processing event type:', event.type);
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        
        // Update user's subscription status (no credits on initial setup)
        console.log('Checkout session metadata:', checkoutSession.metadata);
        
        if (checkoutSession.metadata?.userId && checkoutSession.metadata?.planName) {
          const userId = checkoutSession.metadata.userId;
          const planName = checkoutSession.metadata.planName;
          
          console.log('Processing initial subscription for userId:', userId, 'planName:', planName);
          
          // Update subscription status only
          const { error } = await supabase
            .from('users')
            .update({
              subscription_plan: planName,
              stripe_customer_id: checkoutSession.customer,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          console.log('Subscription update result:', { error });
          console.log('Initial subscription setup complete. Credits will be granted on first invoice payment.');
        } else {
          console.log('Missing metadata - userId:', checkoutSession.metadata?.userId, 'planName:', checkoutSession.metadata?.planName);
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        
        if (updatedSubscription.metadata?.userId) {
          const { error } = await supabase
            .from('users')
            .update({
              subscription_status: updatedSubscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', updatedSubscription.metadata.userId);
            
          console.log('Subscription update result:', { error });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        if (deletedSubscription.metadata?.userId) {
          const { error } = await supabase
            .from('users')
            .update({
              subscription_plan: 'free',
              subscription_status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', deletedSubscription.metadata.userId);
            
          console.log('Subscription cancellation result:', { error });
        }
        break;

      case 'invoice.payment_succeeded':
        const paidInvoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', paidInvoice.id);
        
        // Get subscription details to access metadata
        if (paidInvoice.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              paidInvoice.subscription as string
            );
            
            if (subscription.metadata?.userId) {
              const userId = subscription.metadata.userId;
              const planName = subscription.metadata.planName;
              
              console.log('Processing monthly payment for userId:', userId, 'planName:', planName);
              
              // Grant credits based on plan for each successful monthly payment
              let creditsToGrant = 0;
              if (planName === 'Embld Basic') {
                creditsToGrant = 200;
              } else if (planName === 'Embld Plus') {
                creditsToGrant = 600;
              }
              
              console.log('Monthly credits to grant:', creditsToGrant);
              
              if (creditsToGrant > 0) {
                try {
                  const creditResult = await addCredits(
                    userId,
                    creditsToGrant,
                    'monthly_subscription',
                    `月額プラン支払い: ${planName}`,
                    {
                      plan: planName,
                      stripe_invoice_id: paidInvoice.id,
                      stripe_subscription_id: subscription.id,
                      amount_paid: paidInvoice.amount_paid,
                      billing_period_start: new Date(paidInvoice.period_start * 1000).toISOString(),
                      billing_period_end: new Date(paidInvoice.period_end * 1000).toISOString()
                    }
                  );
                  console.log('Monthly credit granting result:', creditResult);
                  
                  if (!creditResult) {
                    console.error('Failed to grant monthly credits for user:', userId);
                  } else {
                    console.log(`Successfully granted ${creditsToGrant} credits to user ${userId} for monthly payment`);
                  }
                } catch (creditError) {
                  console.error('Error during monthly credit granting:', creditError);
                }
              }
            }
          } catch (subscriptionError) {
            console.error('Error retrieving subscription details:', subscriptionError);
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        
        if (failedInvoice.subscription_details?.metadata?.userId) {
          const { error } = await supabase
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', failedInvoice.subscription_details.metadata.userId);
            
          console.log('Payment failed update result:', { error });
        }
        break;

      default:
        // Unhandled event type - silently ignore
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}