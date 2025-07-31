import { DebugSupabase } from '@/components/debug/DebugSupabase'
import { GoogleAuthDebug } from '@/components/debug/GoogleAuthDebug'
import { notFound } from 'next/navigation'

export default function DebugPage() {
  // 本番環境では404を返す
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Debug Tools</h1>
      <div className="space-y-8">
        <DebugSupabase />
        <GoogleAuthDebug />
      </div>
    </div>
  )
}