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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month' // day, week, month, year
    const productId = searchParams.get('product_id')
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'day':
        startDate.setDate(endDate.getDate() - 30) // Last 30 days
        break
      case 'week':
        startDate.setDate(endDate.getDate() - 84) // Last 12 weeks
        break
      case 'month':
        startDate.setMonth(endDate.getMonth() - 12) // Last 12 months
        break
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 5) // Last 5 years
        break
    }

    // Build query
    let query = supabase
      .from('revenue_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data: analytics, error } = await query

    if (error) {
      console.error('Failed to fetch analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Aggregate data by period
    const aggregatedData = aggregateByPeriod(analytics || [], period)

    // Calculate totals
    const totals = {
      totalRevenue: analytics?.reduce((sum, item) => sum + item.revenue, 0) || 0,
      totalPayout: analytics?.reduce((sum, item) => sum + item.payout_amount, 0) || 0,
      totalTransactions: analytics?.reduce((sum, item) => sum + item.transaction_count, 0) || 0,
      averageRevenue: analytics?.length ? 
        Math.round((analytics.reduce((sum, item) => sum + item.revenue, 0) / analytics.length)) : 0
    }

    return NextResponse.json({
      analytics: aggregatedData,
      totals,
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

function aggregateByPeriod(data: any[], period: string) {
  const aggregated: { [key: string]: any } = {}

  data.forEach(item => {
    const date = new Date(item.date)
    let key: string

    switch (period) {
      case 'day':
        key = item.date
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = String(date.getFullYear())
        break
      default:
        key = item.date
    }

    if (!aggregated[key]) {
      aggregated[key] = {
        date: key,
        revenue: 0,
        payout_amount: 0,
        transaction_count: 0
      }
    }

    aggregated[key].revenue += item.revenue
    aggregated[key].payout_amount += item.payout_amount
    aggregated[key].transaction_count += item.transaction_count
  })

  return Object.values(aggregated).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}