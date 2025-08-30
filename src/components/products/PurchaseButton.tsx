'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Loader2 } from 'lucide-react'

interface PurchaseButtonProps {
  productId: string
  price: number // Price in JPY (not cents)
  title: string
  disabled?: boolean
  className?: string
}

export function PurchaseButton({ 
  productId, 
  price, 
  title, 
  disabled = false,
  className = ""
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          amount: price * 100 // Convert to cents
        })
      })

      const data = await response.json()

      if (response.ok && data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url
      } else {
        alert('購入処理でエラーが発生しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('購入処理でエラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price)
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={disabled || loading}
      className={`${className}`}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          処理中...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          {formatPrice(price)} で購入
        </>
      )}
    </Button>
  )
}