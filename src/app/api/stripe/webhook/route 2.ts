import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { addCredits } from '@/lib/credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        
        // Update user's subscription status and grant credits
        if (checkoutSession.metadata?.userId && checkoutSession.metadata?.planName) {
          const userId = checkoutSession.metadata.userId;
          const planName = checkoutSession.metadata.planName;
          
          // Update subscription status
          const { error } = await supabase
            .from('user_profiles')
            .update({
              subscription_plan: planName,
              stripe_customer_id: checkoutSession.customer,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          // Grant credits based on plan
          let creditsToGrant = 0;
          if (planName === 'Embld Basic') {
            creditsToGrant = 500;
          } else if (planName === 'Embld Plus') {
            creditsToGrant = 2000;
          }

          if (creditsToGrant > 0) {
            await addCredits(
              userId,
              creditsToGrant,
              'plan_purchase',
              `プラン購入: ${planName}`,
              {
                plan: planName,
                stripe_session_id: checkoutSession.id,
                amount_paid: checkoutSession.amount_total
              }
            );
          }
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        
        if (updatedSubscription.metadata?.userId) {
          const { error } = await supabase
            .from('user_profiles')
            .update({
              subscription_status: updatedSubscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', updatedSubscription.metadata.userId);

        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        if (deletedSubscription.metadata?.userId) {
          const { error } = await supabase
            .from('user_profiles')
            .update({
              subscription_plan: 'free',
              subscription_status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', deletedSubscription.metadata.userId);

        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        
        if (failedInvoice.subscription_details?.metadata?.userId) {
          const { error } = await supabase
            .from('user_profiles')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', failedInvoice.subscription_details.metadata.userId);

        }
        break;

      default:
        // Unhandled event type - silently ignore
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}