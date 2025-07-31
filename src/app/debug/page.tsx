import { DebugSupabase } from '@/components/debug/DebugSupabase'
import { GoogleAuthDebug } from '@/components/debug/GoogleAuthDebug'

export default function DebugPage() {
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