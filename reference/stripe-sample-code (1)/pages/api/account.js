import {stripe} from '../../lib/utils';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: {
            type: "express",
          },
          fees: {
            payer: "application"
          },
          losses: {
            payments: "application"
          },
        },
      });

      res.json({account: account.id});
    } catch (error) {
      console.error('An error occurred when calling the Stripe API to create an account:', error);
      res.status(500);
      res.json({error: error.message});
    }
  }
}