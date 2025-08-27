import { createClient } from '@/lib/supabase/server';

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
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // If no credits record exists, create one with 0 credits
    await initializeUserCredits(userId);
    return 0;
  }

  return data.credits;
}

/**
 * Initialize user credits (usually called on first login)
 */
export async function initializeUserCredits(userId: string): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('user_credits')
    .upsert({
      user_id: userId,
      credits: 0,
      updated_at: new Date().toISOString()
    });
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string, 
  amount: number, 
  transactionType: string,
  description?: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  console.log('=== Adding Credits ===');
  console.log('UserId:', userId);
  console.log('Amount:', amount);
  console.log('Transaction Type:', transactionType);
  console.log('Description:', description);
  
  const supabase = await createClient();
  
  try {
    // Start transaction
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    console.log('Current credits fetch result:', { currentCredits, fetchError });

    const newBalance = (currentCredits?.credits || 0) + amount;
    console.log('New balance will be:', newBalance);

    // Update credits balance
    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        credits: newBalance,
        updated_at: new Date().toISOString()
      });

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
  metadata?: Record<string, any>
): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    // Check current balance
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    const currentBalance = currentCredits?.credits || 0;
    
    if (currentBalance < amount) {
      return false; // Insufficient credits
    }

    const newBalance = currentBalance - amount;

    // Update credits balance
    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        credits: newBalance,
        updated_at: new Date().toISOString()
      });

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
  limit: number = 50
): Promise<CreditTransaction[]> {
  const supabase = await createClient();
  
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