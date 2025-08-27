import { createSupabaseWebhookClient } from '@/lib/supabase/server';

/**
 * Webhook-specific database operations with strict validation
 * These functions should only be called from verified webhook endpoints
 */

export interface SubscriptionUpdateData {
  userId: string;
  planName: string;
  customerId: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
}

export interface CreditGrantData {
  userId: string;
  amount: number;
  transactionType: 'monthly_subscription' | 'plan_purchase';
  description: string;
  metadata: Record<string, any>;
}

/**
 * Update user subscription information (webhook only)
 */
export async function updateUserSubscription(data: SubscriptionUpdateData): Promise<boolean> {
  console.log('=== Webhook: Updating User Subscription ===');
  console.log('Data:', data);
  
  // Validate input
  if (!data.userId || !data.planName || !data.customerId) {
    console.error('Invalid subscription update data:', data);
    return false;
  }
  
  const supabase = createSupabaseWebhookClient();
  
  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_plan: data.planName,
        stripe_customer_id: data.customerId,
        subscription_status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.userId);

    if (error) {
      console.error('Subscription update failed:', error);
      return false;
    }

    console.log('Subscription updated successfully for user:', data.userId);
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
}

/**
 * Grant credits to user (webhook only)
 */
export async function grantCreditsToUser(data: CreditGrantData): Promise<boolean> {
  console.log('=== Webhook: Granting Credits ===');
  console.log('Data:', data);
  
  // Validate input
  if (!data.userId || data.amount <= 0 || !data.transactionType) {
    console.error('Invalid credit grant data:', data);
    return false;
  }
  
  const supabase = createSupabaseWebhookClient();
  
  try {
    // Get current credits from users table
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', data.userId)
      .single();

    console.log('Current credits fetch result:', { currentUser, fetchError });

    if (fetchError) {
      console.error('Failed to fetch current user credits:', fetchError);
      return false;
    }

    const newBalance = (currentUser?.credits_balance || 0) + data.amount;
    console.log('New balance will be:', newBalance);

    // Update credits balance in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.userId);

    if (updateError) {
      console.error('Credits update failed:', updateError);
      return false;
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: data.userId,
        amount: data.amount,
        transaction_type: data.transactionType,
        description: data.description,
        metadata: data.metadata || {}
      });

    if (transactionError) {
      console.error('Transaction record failed:', transactionError);
      return false;
    }

    console.log(`Successfully granted ${data.amount} credits to user ${data.userId}`);
    return true;
  } catch (error) {
    console.error('Error granting credits:', error);
    return false;
  }
}

/**
 * Update subscription status only (webhook only)
 */
export async function updateSubscriptionStatus(
  userId: string, 
  status: 'active' | 'inactive' | 'canceled' | 'past_due'
): Promise<boolean> {
  console.log('=== Webhook: Updating Subscription Status ===');
  console.log('UserId:', userId, 'Status:', status);
  
  if (!userId || !status) {
    console.error('Invalid status update data');
    return false;
  }
  
  const supabase = createSupabaseWebhookClient();
  
  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Status update failed:', error);
      return false;
    }

    console.log('Subscription status updated successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return false;
  }
}