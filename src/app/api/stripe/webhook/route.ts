import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateUserSubscription, grantCreditsToUser, updateSubscriptionStatus } from '@/lib/webhook-operations';

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

    // Handle the event
    console.log('Processing event type:', event.type);
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        
        // Update user's subscription status (no credits on initial setup)
        console.log('Checkout session metadata:', checkoutSession.metadata);
        
        if (checkoutSession.metadata?.userId && checkoutSession.metadata?.planName && checkoutSession.customer) {
          const success = await updateUserSubscription({
            userId: checkoutSession.metadata.userId,
            planName: checkoutSession.metadata.planName,
            customerId: checkoutSession.customer as string,
            status: 'active'
          });

          if (success) {
            console.log('Initial subscription setup complete. Credits will be granted on first invoice payment.');
          } else {
            console.error('Failed to update subscription for user:', checkoutSession.metadata.userId);
          }
        } else {
          console.log('Missing required metadata in checkout session');
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        
        if (updatedSubscription.metadata?.userId) {
          const success = await updateSubscriptionStatus(
            updatedSubscription.metadata.userId,
            updatedSubscription.status as 'active' | 'inactive' | 'canceled' | 'past_due'
          );
          
          if (!success) {
            console.error('Failed to update subscription status for user:', updatedSubscription.metadata.userId);
          }
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        if (deletedSubscription.metadata?.userId) {
          const success = await updateSubscriptionStatus(
            deletedSubscription.metadata.userId,
            'canceled'
          );
          
          if (!success) {
            console.error('Failed to update subscription status for user:', deletedSubscription.metadata.userId);
          }
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
            
            if (subscription.metadata?.userId && subscription.metadata?.planName) {
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
              
              if (creditsToGrant > 0) {
                const success = await grantCreditsToUser({
                  userId,
                  amount: creditsToGrant,
                  transactionType: 'monthly_subscription',
                  description: `月額プラン支払い: ${planName}`,
                  metadata: {
                    plan: planName,
                    stripe_invoice_id: paidInvoice.id,
                    stripe_subscription_id: subscription.id,
                    amount_paid: paidInvoice.amount_paid,
                    billing_period_start: new Date(paidInvoice.period_start * 1000).toISOString(),
                    billing_period_end: new Date(paidInvoice.period_end * 1000).toISOString()
                  }
                });
                
                if (success) {
                  console.log(`Successfully granted ${creditsToGrant} credits to user ${userId} for monthly payment`);
                } else {
                  console.error('Failed to grant monthly credits for user:', userId);
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
          const success = await updateSubscriptionStatus(
            failedInvoice.subscription_details.metadata.userId,
            'past_due'
          );
          
          if (!success) {
            console.error('Failed to update subscription status for user:', failedInvoice.subscription_details.metadata.userId);
          }
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