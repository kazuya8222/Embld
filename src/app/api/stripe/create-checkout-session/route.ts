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
      if (process.env.NODE_ENV === 'development') {
        console.error('STRIPE_SECRET_KEY is not set');
      }
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      if (process.env.NODE_ENV === 'development') {
        console.error('NEXT_PUBLIC_APP_URL is not set');
      }
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

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating checkout session for:', { priceId, planName });
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
    console.error('Error creating checkout session:', error);
    
    // Provide more specific error information
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe Error Type:', error.type);
      console.error('Stripe Error Code:', error.code);
      console.error('Stripe Error Message:', error.message);
      
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
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            type: error instanceof Error ? error.constructor.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      },
      { status: statusCode }
    );
  }
}