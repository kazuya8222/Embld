import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEVELOPMENT_REQUEST_CREDIT_COST = 50;

export async function POST(req: NextRequest) {
  try {
    console.log('=== Development Requests API - POST Request ===');
    
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
    const { productId, title, description } = body;
    console.log('Request body:', { productId, title, description });

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
    
    if (currentCredits < DEVELOPMENT_REQUEST_CREDIT_COST) {
      console.log('Insufficient credits:', { required: DEVELOPMENT_REQUEST_CREDIT_COST, current: currentCredits });
      return NextResponse.json(
        { 
          error: 'クレジットが不足しています', 
          required: DEVELOPMENT_REQUEST_CREDIT_COST,
          current: currentCredits 
        },
        { status: 402 } // Payment Required
      );
    }

    // Create new development request
    console.log('Creating development request...');
    const { data: request, error: requestError } = await supabase
      .from('development_requests')
      .insert([{
        product_id: productId,
        user_id: user.id,
        title: title,
        description: description,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    console.log('Request creation result:', { request: !!request, requestError });

    if (requestError) {
      console.error('Failed to create request:', requestError);
      return NextResponse.json(
        { error: 'Failed to create development request' },
        { status: 500 }
      );
    }

    // Deduct credits for submitting the request
    const newBalance = currentCredits - DEVELOPMENT_REQUEST_CREDIT_COST;

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
      // Rollback request creation if credit deduction fails
      await supabase
        .from('development_requests')
        .delete()
        .eq('id', request.id);

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
        amount: -DEVELOPMENT_REQUEST_CREDIT_COST, // Negative for deductions
        transaction_type: 'development_request',
        description: '追加開発依頼の提出',
        metadata: {
          request_id: request.id,
          product_id: productId,
          title: title
        }
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // Note: We don't rollback here as the credit deduction was successful
    }

    console.log('Development request created successfully:', request.id);
    console.log('Credits deducted:', DEVELOPMENT_REQUEST_CREDIT_COST, 'Remaining:', newBalance);

    return NextResponse.json({
      request,
      creditsDeducted: DEVELOPMENT_REQUEST_CREDIT_COST,
      remainingCredits: newBalance
    });

  } catch (error) {
    console.error('Error creating development request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}