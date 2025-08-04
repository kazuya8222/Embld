// アイデアの収益データ（デモ用 - 実際のデータはデータベースから取得）
export const revenueData: Record<string, number> = {
  'e99ede83-271b-4a52-b541-8b04df43ac02': 100000000, // ハモリAI
}

export function getIdeaRevenue(ideaId: string): number {
  return revenueData[ideaId] || 0
}

export function formatRevenue(revenue: number | undefined | null): string {
  if (!revenue || revenue === 0) {
    return '¥0'
  }
  
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(revenue)
}