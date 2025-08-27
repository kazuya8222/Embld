import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseWebhookClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * サブスクリプション型クレジット累積システム
 * 
 * 主な特徴:
 * 1. Idempotency保証 - 同じイベントを2度処理しない
 * 2. サブスクリプション開始時に即座にクレジット付与
 * 3. 月次更新時にクレジットを累積追加（リセットではない）
 * 4. プラン変更時の差分計算と即座反映
 * 5. クレジットは永続的に累積され、使用するまで保持
 */

// プランごとのクレジット数定義
const PLAN_CREDITS = {
  'Embld Basic': 200,
  'Embld Plus': 600,
  'free': 0
} as const;

// イベントの冪等性をチェック
async function checkEventProcessed(eventId: string): Promise<boolean> {
  const supabase = createSupabaseWebhookClient();
  
  const { data, error } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single();
  
  return !!data && !error;
}

// イベント処理を記録
async function recordEventProcessed(eventId: string, eventType: string, metadata?: any): Promise<void> {
  const supabase = createSupabaseWebhookClient();
  
  await supabase
    .from('webhook_events')
    .insert({
      stripe_event_id: eventId,
      event_type: eventType,
      metadata: metadata || {}
    });
}

// ユーザーの現在のプランを取得
async function getUserCurrentPlan(userId: string): Promise<string | null> {
  const supabase = createSupabaseWebhookClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('subscription_plan')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  return data.subscription_plan;
}

// クレジットを追加（累積方式）
async function addUserCredits(userId: string, creditsToAdd: number, reason: string): Promise<boolean> {
  const supabase = createSupabaseWebhookClient();
  
  console.log(`=== ADDING CREDITS ===`);
  console.log(`User ID: ${userId}`);
  console.log(`Credits to add: ${creditsToAdd}`);
  console.log(`Reason: ${reason}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    // 現在のクレジットを取得
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('credits_balance, email')
      .eq('id', userId)
      .single();
    
    console.log('Fetch current credits result:', { currentUser, fetchError });
    
    if (fetchError) {
      console.error('Failed to fetch current credits:', fetchError);
      return false;
    }
    
    if (!currentUser) {
      console.error('User not found in database:', userId);
      return false;
    }
    
    const currentCredits = currentUser.credits_balance || 0;
    const newBalance = currentCredits + creditsToAdd;
    
    console.log(`User: ${currentUser.email}`);
    console.log(`Current credits: ${currentCredits}`);
    console.log(`Credits to add: ${creditsToAdd}`);
    console.log(`New balance: ${newBalance}`);
    
    // クレジットを更新
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        credits_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('credits_balance');
    
    console.log('Credits update result:', { updateData, updateError });
    
    if (updateError) {
      console.error('Failed to update credits:', updateError);
      return false;
    }
    
    if (!updateData || updateData.length === 0) {
      console.error('No rows updated - user may not exist or update failed silently');
      return false;
    }
    
    console.log(`Credits successfully updated to: ${updateData[0].credits_balance}`);
    
    // トランザクション記録
    const { data: transactionData, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: creditsToAdd, // 追加分のみ記録
        transaction_type: 'subscription',
        description: reason,
        metadata: { 
          timestamp: new Date().toISOString(),
          previous_balance: currentCredits,
          new_balance: newBalance
        }
      })
      .select('id');
    
    console.log('Transaction record result:', { transactionData, transactionError });
    
    if (transactionError) {
      console.error('Failed to record transaction (but credits were updated):', transactionError);
      // Don't return false here since credits were updated successfully
    } else {
      console.log(`Transaction recorded with ID: ${transactionData?.[0]?.id}`);
    }
    
    console.log('=== CREDITS ADDED SUCCESSFULLY ===');
    return true;
  } catch (error) {
    console.error('Exception during credit addition:', error);
    return false;
  }
}

// サブスクリプション情報を更新
async function updateSubscription(
  userId: string,
  planName: string,
  status: string,
  customerId: string
): Promise<boolean> {
  const supabase = createSupabaseWebhookClient();
  
  const { error } = await supabase
    .from('users')
    .update({
      subscription_plan: planName,
      subscription_status: status,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  return !error;
}

export async function POST(request: NextRequest) {
  console.log('=== Stripe Webhook Received ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Event type:', event.type);
      console.log('Event ID:', event.id);
    } catch (err: any) {
      console.log('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Idempotency check - 既に処理済みのイベントはスキップ
    const isProcessed = await checkEventProcessed(event.id);
    if (isProcessed) {
      console.log('Event already processed, skipping:', event.id);
      return NextResponse.json({ received: true, skipped: true });
    }

    // ChatGPT/Claude方式のイベント処理
    switch (event.type) {
      
      /**
       * サブスクリプション作成時（初回契約）
       * ChatGPT Plus方式: 即座にクレジット付与
       */
      case 'customer.subscription.created':
        const newSubscription = event.data.object as Stripe.Subscription;
        console.log('New subscription created:', newSubscription.id);
        
        if (newSubscription.metadata?.userId && newSubscription.metadata?.planName) {
          const userId = newSubscription.metadata.userId;
          const planName = newSubscription.metadata.planName;
          const credits = PLAN_CREDITS[planName as keyof typeof PLAN_CREDITS] || 0;
          
          // サブスクリプション情報を更新
          await updateSubscription(
            userId,
            planName,
            newSubscription.status,
            newSubscription.customer as string
          );
          
          // 即座にクレジット付与
          if (credits > 0) {
            await addUserCredits(userId, credits, `${planName} subscription started`);
            console.log(`Granted ${credits} credits to user ${userId} for new ${planName} subscription`);
          }
          
          // イベント処理を記録
          await recordEventProcessed(event.id, event.type, {
            userId,
            planName,
            credits,
            subscriptionId: newSubscription.id
          });
        }
        break;

      /**
       * サブスクリプション更新時（プラン変更含む）
       * ChatGPT Plus方式: 変更を即座に反映
       */
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        const previousAttributes = (event.data as any).previous_attributes || {};
        
        console.log('Subscription updated:', updatedSubscription.id);
        console.log('Previous attributes:', previousAttributes);
        
        if (updatedSubscription.metadata?.userId && updatedSubscription.metadata?.planName) {
          const userId = updatedSubscription.metadata.userId;
          const newPlanName = updatedSubscription.metadata.planName;
          const oldPlanName = await getUserCurrentPlan(userId);
          
          // プラン変更の場合
          if (oldPlanName && oldPlanName !== newPlanName) {
            console.log(`Plan changed from ${oldPlanName} to ${newPlanName}`);
            
            const oldCredits = PLAN_CREDITS[oldPlanName as keyof typeof PLAN_CREDITS] || 0;
            const newCredits = PLAN_CREDITS[newPlanName as keyof typeof PLAN_CREDITS] || 0;
            const creditDifference = newCredits - oldCredits;
            
            // サブスクリプション情報を更新
            await updateSubscription(
              userId,
              newPlanName,
              updatedSubscription.status,
              updatedSubscription.customer as string
            );
            
            // アップグレードの場合は差分を追加
            if (creditDifference > 0) {
              await addUserCredits(userId, creditDifference, `Upgraded from ${oldPlanName} to ${newPlanName}`);
              console.log(`Added ${creditDifference} credits for plan upgrade`);
            }
            // ダウングレードの場合はクレジットはそのまま（減らさない）
            else {
              console.log(`Plan downgraded from ${oldPlanName} to ${newPlanName}, credits unchanged`);
            }
          }
          // ステータスのみの変更
          else if (previousAttributes.status) {
            await updateSubscription(
              userId,
              newPlanName,
              updatedSubscription.status,
              updatedSubscription.customer as string
            );
          }
          
          // イベント処理を記録
          await recordEventProcessed(event.id, event.type, {
            userId,
            oldPlanName,
            newPlanName,
            subscriptionId: updatedSubscription.id
          });
        }
        break;

      /**
       * サブスクリプション削除時（解約）
       * ChatGPT Plus方式: クレジットは期限まで維持
       */
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', deletedSubscription.id);
        
        if (deletedSubscription.metadata?.userId) {
          const userId = deletedSubscription.metadata.userId;
          
          // サブスクリプションステータスのみ更新（クレジットは維持）
          const supabase = createSupabaseWebhookClient();
          await supabase
            .from('users')
            .update({
              subscription_status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          console.log(`Subscription canceled for user ${userId}, credits maintained until expiry`);
          
          // イベント処理を記録
          await recordEventProcessed(event.id, event.type, {
            userId,
            subscriptionId: deletedSubscription.id
          });
        }
        break;

      /**
       * 月次請求成功時
       * 累積方式: 月次更新でクレジットを追加（累積）
       */
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        
        // 初回請求はスキップ（customer.subscription.createdで処理済み）
        if (invoice.billing_reason === 'subscription_create') {
          console.log('Skipping initial invoice (handled by subscription.created)');
          break;
        }
        
        // 月次更新の場合のみクレジットをリセット
        if (invoice.billing_reason === 'subscription_cycle' && invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          if (subscription.metadata?.userId && subscription.metadata?.planName) {
            const userId = subscription.metadata.userId;
            const planName = subscription.metadata.planName;
            const credits = PLAN_CREDITS[planName as keyof typeof PLAN_CREDITS] || 0;
            
            // 月次更新でクレジットを追加
            await addUserCredits(userId, credits, `Monthly renewal - ${planName}`);
            console.log(`Added ${credits} credits for monthly renewal for user ${userId}`);
            
            // イベント処理を記録
            await recordEventProcessed(event.id, event.type, {
              userId,
              planName,
              credits,
              invoiceId: invoice.id,
              billingReason: invoice.billing_reason
            });
          }
        }
        break;

      /**
       * 支払い失敗時
       * ChatGPT Plus方式: ステータスを更新
       */
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        
        if (failedInvoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(failedInvoice.subscription as string);
          
          if (subscription.metadata?.userId) {
            const userId = subscription.metadata.userId;
            
            const supabase = createSupabaseWebhookClient();
            await supabase
              .from('users')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
            
            console.log(`Payment failed for user ${userId}, status set to past_due`);
            
            // イベント処理を記録
            await recordEventProcessed(event.id, event.type, {
              userId,
              invoiceId: failedInvoice.id
            });
          }
        }
        break;

      /**
       * チェックアウト完了時（Stripe Checkoutを使用する場合）
       * 注: customer.subscription.createdが送信されない場合があるため、ここで処理
       */
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('=== CHECKOUT SESSION COMPLETED ===');
        console.log('Session ID:', session.id);
        console.log('Session mode:', session.mode);
        console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));
        console.log('Session customer:', session.customer);
        console.log('Session subscription:', session.subscription);
        
        // サブスクリプションモードの場合、クレジット付与処理
        if (session.mode === 'subscription') {
          console.log('Processing subscription checkout session...');
          
          if (!session.metadata?.userId || !session.metadata?.planName) {
            console.error('Missing required metadata in checkout session:', {
              userId: session.metadata?.userId,
              planName: session.metadata?.planName,
              allMetadata: session.metadata
            });
            
            // If metadata is missing from session, try to get it from the subscription
            if (session.subscription) {
              console.log('Attempting to retrieve subscription metadata...');
              try {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                console.log('Subscription metadata:', JSON.stringify(subscription.metadata, null, 2));
                
                if (subscription.metadata?.userId && subscription.metadata?.planName) {
                  const userId = subscription.metadata.userId;
                  const planName = subscription.metadata.planName;
                  const credits = PLAN_CREDITS[planName as keyof typeof PLAN_CREDITS] || 0;
                  
                  console.log(`Found metadata in subscription: user ${userId}, plan ${planName}, credits ${credits}`);
                  
                  // サブスクリプション情報を更新
                  const updated = await updateSubscription(
                    userId,
                    planName,
                    'active',
                    session.customer as string
                  );
                  
                  if (updated) {
                    console.log('Subscription updated successfully via subscription metadata');
                    
                    // クレジット付与
                    if (credits > 0) {
                      const creditAdded = await addUserCredits(userId, credits, `${planName} subscription started via checkout`);
                      if (creditAdded) {
                        console.log(`Successfully added ${credits} credits to user ${userId} via subscription metadata`);
                      } else {
                        console.error(`Failed to add credits for user ${userId} via subscription metadata`);
                      }
                    }
                  }
                } else {
                  console.error('No metadata found in subscription either');
                }
              } catch (subError) {
                console.error('Failed to retrieve subscription:', subError);
              }
            }
          } else {
            // Original logic when session has metadata
            const userId = session.metadata.userId;
            const planName = session.metadata.planName;
            const credits = PLAN_CREDITS[planName as keyof typeof PLAN_CREDITS] || 0;
            
            console.log(`Processing with session metadata: user ${userId}, plan ${planName}, credits ${credits}`);
            
            // サブスクリプション情報を更新
            const updated = await updateSubscription(
              userId,
              planName,
              'active',
              session.customer as string
            );
            
            if (updated) {
              console.log('Subscription updated successfully via session metadata');
              
              // クレジット付与
              if (credits > 0) {
                const creditAdded = await addUserCredits(userId, credits, `${planName} subscription started via checkout`);
                if (creditAdded) {
                  console.log(`Successfully added ${credits} credits to user ${userId} via session metadata`);
                } else {
                  console.error(`Failed to add credits for user ${userId} via session metadata`);
                }
              }
            }
          }
        } else {
          console.log(`Non-subscription mode: ${session.mode}, skipping credit processing`);
        }
        
        // イベント処理を記録
        await recordEventProcessed(event.id, event.type, {
          sessionId: session.id,
          mode: session.mode,
          userId: session.metadata?.userId,
          planName: session.metadata?.planName,
          customer: session.customer,
          subscription: session.subscription
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}