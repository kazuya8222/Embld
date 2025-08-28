import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CHAT_START_CREDIT_COST = 10;

export async function POST(req: NextRequest) {
  try {
    console.log('=== Chat Sessions API - POST Request ===');
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth result:', { user: !!user, authError });
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, initialMessage } = body;
    console.log('Request body:', { title, initialMessage });

    // Check user's credit balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', user.id)
      .single();

    console.log('User credit fetch result:', { userData, userError });

    if (userError || !userData) {
      console.error('Error fetching user credits:', userError);
      return NextResponse.json(
        { error: 'Failed to check credit balance' },
        { status: 500 }
      );
    }

    const currentCredits = userData.credits_balance || 0;
    console.log('Current credits:', currentCredits);
    
    if (currentCredits < CHAT_START_CREDIT_COST) {
      console.log('Insufficient credits:', { required: CHAT_START_CREDIT_COST, current: currentCredits });
      return NextResponse.json(
        { 
          error: 'クレジットが不足しています', 
          required: CHAT_START_CREDIT_COST,
          current: currentCredits 
        },
        { status: 402 } // Payment Required
      );
    }

    // Create new chat session
    console.log('Creating chat session...');
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert([{
        user_id: user.id,
        title: title || 'New Chat',
        initial_message: initialMessage,
        metadata: {
          created_at: new Date().toISOString(),
          credits_deducted: CHAT_START_CREDIT_COST
        }
      }])
      .select('*')
      .single();

    console.log('Session creation result:', { session: !!session, sessionError });

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create chat session' },
        { status: 500 }
      );
    }

    // Deduct credits for starting the chat
    const newBalance = currentCredits - CHAT_START_CREDIT_COST;

    // Update credits balance in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      // Rollback session creation if credit deduction fails
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', session.id);

      return NextResponse.json(
        { error: 'クレジット処理に失敗しました' },
        { status: 500 }
      );
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -CHAT_START_CREDIT_COST, // Negative for deductions
        transaction_type: 'agent_chat_start',
        description: 'AIエージェントチャット開始',
        metadata: {
          session_id: session.id,
          title: session.title
        }
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // Note: We don't rollback here as the credit deduction was successful
    }

    console.log('Chat session created successfully:', session.id);
    console.log('Credits deducted:', CHAT_START_CREDIT_COST, 'Remaining:', newBalance);

    return NextResponse.json({
      session,
      creditsDeducted: CHAT_START_CREDIT_COST,
      remainingCredits: newBalance
    });

  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check credit cost before starting
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

    const { data: userData } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', user.id)
      .single();

    const currentCredits = userData?.credits_balance || 0;
    
    return NextResponse.json({
      creditCost: CHAT_START_CREDIT_COST,
      currentCredits,
      canStart: currentCredits >= CHAT_START_CREDIT_COST
    });

  } catch (error) {
    console.error('Error checking credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}