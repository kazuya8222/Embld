import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const createCheckoutSession = async (
  customerId?: string,
  userEmail?: string
) => {
  const sessionParams: any = {
    billing_address_collection: 'required',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
    subscription_data: {
      metadata: {
        user_email: userEmail,
      },
    },
  }
  
  if (customerId) {
    sessionParams.customer = customerId
  } else if (userEmail) {
    sessionParams.customer_email = userEmail
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  return session
}

export const createPortalSession = async (customerId: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
  })

  return session
}