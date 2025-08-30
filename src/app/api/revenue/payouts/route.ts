import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's payouts
    const { data: payouts, error: payoutsError } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (payoutsError) {
      console.error('Failed to fetch payouts:', payoutsError)
      return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
    }

    // Calculate stats
    const totalEarnings = payouts?.reduce((sum, payout) => sum + payout.amount, 0) || 0
    const pendingPayouts = payouts?.filter(p => p.status === 'pending')
      .reduce((sum, payout) => sum + payout.amount, 0) || 0
    const completedPayouts = payouts?.filter(p => p.status === 'completed')
      .reduce((sum, payout) => sum + payout.amount, 0) || 0

    // Get product count with revenue
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        proposals!inner (
          user_id
        )
      `)
      .eq('proposals.user_id', user.id)

    const productCount = products?.length || 0

    const stats = {
      totalEarnings,
      pendingPayouts,
      completedPayouts,
      productCount
    }

    return NextResponse.json({
      payouts: payouts || [],
      stats
    })
  } catch (error) {
    console.error('Payouts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    )
  }
}