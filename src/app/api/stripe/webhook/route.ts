import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
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
      console.error('Webhook signature verification failed.', err.message);
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
        
        // Update user's subscription status in database
        if (checkoutSession.metadata?.userId) {
          const { error } = await supabase
            .from('user_profiles')
            .update({
              subscription_plan: checkoutSession.metadata.planName,
              stripe_customer_id: checkoutSession.customer,
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', checkoutSession.metadata.userId);

          if (error) {
            console.error('Error updating user subscription:', error);
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

          if (error) {
            console.error('Error updating subscription status:', error);
          }
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

          if (error) {
            console.error('Error updating canceled subscription:', error);
          }
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

          if (error) {
            console.error('Error updating failed payment status:', error);
          }
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}