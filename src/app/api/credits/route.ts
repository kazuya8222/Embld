import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'balance':
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits_balance')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          console.error('Error fetching user credits:', userError);
          return NextResponse.json({ credits: 0 });
        }

        return NextResponse.json({ credits: userData.credits_balance || 0 });
      
      case 'transactions':
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const { data: transactions, error: transError } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (transError) {
          console.error('Error fetching credit transactions:', transError);
          return NextResponse.json({ transactions: [] });
        }

        return NextResponse.json({ transactions: transactions || [] });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in credits API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, amount, transactionType, description, metadata } = body;

    switch (action) {
      case 'deduct':
        // Get current balance
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('credits_balance')
          .eq('id', user.id)
          .single();

        if (fetchError || !currentUser) {
          console.error('Error fetching user credits:', fetchError);
          return NextResponse.json(
            { error: 'Failed to fetch credits' },
            { status: 500 }
          );
        }

        const currentBalance = currentUser.credits_balance || 0;
        
        if (currentBalance < amount) {
          return NextResponse.json(
            { error: 'Insufficient credits', currentBalance },
            { status: 402 }
          );
        }

        const newBalance = currentBalance - amount;

        // Update credits balance
        const { error: updateError } = await supabase
          .from('users')
          .update({
            credits_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating credits:', updateError);
          return NextResponse.json(
            { error: 'Failed to update credits' },
            { status: 500 }
          );
        }

        // Record transaction
        const { error: transactionError } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            amount: -amount, // Negative for deductions
            transaction_type: transactionType,
            description: description,
            metadata: metadata || {}
          });

        if (transactionError) {
          console.error('Error recording transaction:', transactionError);
          // Note: We don't rollback here as the credit deduction was successful
        }

        return NextResponse.json({ 
          success: true, 
          newBalance,
          deductedAmount: amount
        });
      
      case 'add':
        // Get current balance
        const { data: currentUserAdd, error: fetchErrorAdd } = await supabase
          .from('users')
          .select('credits_balance')
          .eq('id', user.id)
          .single();

        if (fetchErrorAdd || !currentUserAdd) {
          console.error('Error fetching user credits:', fetchErrorAdd);
          return NextResponse.json(
            { error: 'Failed to fetch credits' },
            { status: 500 }
          );
        }

        const currentBalanceAdd = currentUserAdd.credits_balance || 0;
        const newBalanceAdd = currentBalanceAdd + amount;

        // Update credits balance
        const { error: updateErrorAdd } = await supabase
          .from('users')
          .update({
            credits_balance: newBalanceAdd,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateErrorAdd) {
          console.error('Error updating credits:', updateErrorAdd);
          return NextResponse.json(
            { error: 'Failed to update credits' },
            { status: 500 }
          );
        }

        // Record transaction
        const { error: transactionErrorAdd } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            amount: amount, // Positive for additions
            transaction_type: transactionType,
            description: description,
            metadata: metadata || {}
          });

        if (transactionErrorAdd) {
          console.error('Error recording transaction:', transactionErrorAdd);
        }

        return NextResponse.json({ 
          success: true, 
          newBalance: newBalanceAdd,
          addedAmount: amount
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in credits API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}