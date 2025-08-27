import { createClient, createSupabaseWebhookClient } from '@/lib/supabase/server';

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string, useAdminClient: boolean = false): Promise<number> {
  const supabase = useAdminClient ? createSupabaseWebhookClient() : (await createClient());
  
  const { data, error } = await supabase
    .from('users')
    .select('credits_balance')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user credits:', error);
    return 0;
  }

  return data.credits_balance || 0;
}

/**
 * Initialize user credits (usually called on first login)
 */
export async function initializeUserCredits(userId: string, useAdminClient: boolean = false): Promise<void> {
  const supabase = useAdminClient ? createSupabaseWebhookClient() : (await createClient());
  
  await supabase
    .from('users')
    .update({
      credits_balance: 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string, 
  amount: number, 
  transactionType: string,
  description?: string,
  metadata?: Record<string, any>,
  useAdminClient: boolean = false
): Promise<boolean> {
  console.log('=== Adding Credits ===');
  console.log('UserId:', userId);
  console.log('Amount:', amount);
  console.log('Transaction Type:', transactionType);
  console.log('Description:', description);
  
  const supabase = useAdminClient ? createSupabaseWebhookClient() : (await createClient());
  
  try {
    // Get current balance from users table
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single();

    console.log('Current credits fetch result:', { currentUser, fetchError });

    const newBalance = (currentUser?.credits_balance || 0) + amount;
    console.log('New balance will be:', newBalance);

    // Update credits balance in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    console.log('Credits update result:', { updateError });

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: transactionType,
        description: description,
        metadata: metadata || {}
      });

    console.log('Transaction record result:', { transactionError });

    if (transactionError) throw transactionError;

    console.log('Credits added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding credits:', error);
    return false;
  }
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  amount: number,
  transactionType: string,
  description?: string,
  metadata?: Record<string, any>,
  useAdminClient: boolean = false
): Promise<boolean> {
  const supabase = useAdminClient ? createSupabaseWebhookClient() : (await createClient());
  
  try {
    // Check current balance from users table
    const { data: currentUser } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single();

    const currentBalance = currentUser?.credits_balance || 0;
    
    if (currentBalance < amount) {
      return false; // Insufficient credits
    }

    const newBalance = currentBalance - amount;

    // Update credits balance in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount, // Negative for deductions
        transaction_type: transactionType,
        description: description,
        metadata: metadata || {}
      });

    if (transactionError) throw transactionError;

    return true;
  } catch (error) {
    console.error('Error deducting credits:', error);
    return false;
  }
}

/**
 * Get user's credit transaction history
 */
export async function getCreditTransactions(
  userId: string,
  limit: number = 50,
  useAdminClient: boolean = false
): Promise<CreditTransaction[]> {
  const supabase = useAdminClient ? createSupabaseWebhookClient() : (await createClient());
  
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching credit transactions:', error);
    return [];
  }

  return data || [];
}