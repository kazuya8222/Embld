import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get cancellation reason and description from request body
    const { reason, description } = await request.json();

    // Get current user subscription info from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_status, subscription_plan')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User subscription information not found' },
        { status: 404 }
      );
    }

    if (!userData.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Get active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    const subscription = subscriptions.data[0];

    // Cancel the subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
      metadata: {
        ...subscription.metadata,
        cancel_reason: reason || 'user_requested',
        cancel_description: description || '',
        canceled_at: new Date().toISOString(),
      }
    });

    // Update user status and plan in database - immediately change to free plan
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_plan: 'free',
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user subscription status:', updateError);
      // Continue since Stripe cancellation was successful
    }

    // Log the cancellation for analytics/debugging
    console.log(`Subscription canceled for user ${user.id}:`, {
      subscriptionId: subscription.id,
      customerId: userData.stripe_customer_id,
      reason,
      description,
      canceledAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      cancel_at: canceledSubscription.cancel_at,
      current_period_end: canceledSubscription.current_period_end,
    });

  } catch (error) {
    console.error('Subscription cancellation failed:', error);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Stripe.errors.StripeError) {
      switch (error.type) {
        case 'StripeInvalidRequestError':
          errorMessage = `Invalid request: ${error.message}`;
          statusCode = 400;
          break;
        case 'StripeAPIError':
          errorMessage = 'Stripe API error occurred';
          statusCode = 502;
          break;
        case 'StripeConnectionError':
          errorMessage = 'Connection to Stripe failed';
          statusCode = 503;
          break;
        case 'StripeAuthenticationError':
          errorMessage = 'Stripe authentication failed - check API keys';
          statusCode = 401;
          break;
        default:
          errorMessage = `Stripe error: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}