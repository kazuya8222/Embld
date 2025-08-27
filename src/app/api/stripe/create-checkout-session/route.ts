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

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const { priceId, planName } = await request.json();
    
    if (!priceId || !planName) {
      return NextResponse.json(
        { error: 'Price ID and plan name are required' },
        { status: 400 }
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

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/home`,
      metadata: {
        userId: user.id,
        planName: planName,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planName: planName,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    
    // Provide more specific error information
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