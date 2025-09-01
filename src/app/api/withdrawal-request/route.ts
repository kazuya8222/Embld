import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import Stripe from 'stripe'

const resend = new Resend(process.env.RESEND_API_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, stripe_account_id, stripe_onboarding_completed')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!userData.stripe_account_id || !userData.stripe_onboarding_completed) {
      return NextResponse.json({ 
        error: 'Stripe Connect設定が完了していません' 
      }, { status: 400 })
    }

    // Get current Stripe balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: userData.stripe_account_id
    })

    const availableBalance = balance.available.find(b => b.currency === 'jpy')?.amount || 0
    const requestAmount = amount || availableBalance

    if (requestAmount <= 0) {
      return NextResponse.json({ 
        error: '出金可能な残高がありません' 
      }, { status: 400 })
    }

    if (amount && amount > availableBalance) {
      return NextResponse.json({ 
        error: `残高不足です。利用可能: ¥${availableBalance}` 
      }, { status: 400 })
    }

    // Check for pending requests
    const { data: pendingRequests } = await supabase
      .from('withdrawal_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (pendingRequests) {
      return NextResponse.json({ 
        error: '既に処理待ちの出金リクエストがあります' 
      }, { status: 400 })
    }

    // Create withdrawal request
    const { data: withdrawalRequest, error: insertError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount: requestAmount,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create withdrawal request:', insertError)
      return NextResponse.json({ 
        error: '出金リクエストの作成に失敗しました' 
      }, { status: 500 })
    }

    // Send email notification to admin
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL!,
        to: process.env.ADMIN_EMAIL!,
        subject: '新しい出金リクエスト',
        html: `
          <h2>新しい出金リクエストが届きました</h2>
          <p><strong>ユーザー:</strong> ${userData.email}</p>
          <p><strong>金額:</strong> ¥${requestAmount.toLocaleString()}</p>
          <p><strong>リクエストID:</strong> ${withdrawalRequest.id}</p>
          <br>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/transfers">管理画面で確認</a></p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      request: withdrawalRequest
    })
  } catch (error) {
    console.error('Withdrawal request error:', error)
    return NextResponse.json(
      { error: '出金リクエストの処理に失敗しました' },
      { status: 500 }
    )
  }
}

// GET method to fetch user's withdrawal requests
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's withdrawal requests
    const { data: requests, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })

    if (fetchError) {
      console.error('Failed to fetch withdrawal requests:', fetchError)
      return NextResponse.json({ 
        error: 'リクエストの取得に失敗しました' 
      }, { status: 500 })
    }

    return NextResponse.json({
      requests: requests || []
    })
  } catch (error) {
    console.error('Get withdrawal requests error:', error)
    return NextResponse.json(
      { error: 'リクエストの取得に失敗しました' },
      { status: 500 }
    )
  }
}