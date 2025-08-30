import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: NextRequest) {
  try {
    const { product_id, price_id, amount } = await request.json()
    
    if (!product_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()
    
    // Get product details with owner information
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        proposals (
          user_id,
          users (
            id,
            email,
            stripe_account_id
          )
        )
      `)
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate platform fee and owner share
    const platformFeePercent = 70 // Platform gets 70%
    const ownerSharePercent = 30 // Owner gets 30%
    const platformFee = Math.floor(amount * platformFeePercent / 100)
    const ownerShare = amount - platformFee

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: product.title,
              description: product.overview || undefined,
              images: product.icon_url ? [product.icon_url] : undefined
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/products/${product_id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/products/${product_id}?payment=cancelled`,
      metadata: {
        product_id: product.id,
        owner_user_id: product.proposals?.user_id || '',
        owner_stripe_account: product.proposals?.users?.stripe_account_id || '',
        owner_share: ownerShare.toString(),
        platform_fee: platformFee.toString()
      },
      payment_intent_data: {
        metadata: {
          product_id: product.id,
          owner_user_id: product.proposals?.user_id || '',
          owner_share: ownerShare.toString()
        }
      }
    })

    return NextResponse.json({ 
      checkout_url: session.url,
      session_id: session.id 
    })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}