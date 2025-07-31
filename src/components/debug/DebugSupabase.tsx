'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function DebugSupabase() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // 1. Supabase接続テスト
      testResults.connection = { status: 'Testing...' }
      const { data: healthCheck, error: healthError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      testResults.connection = healthError 
        ? { status: '❌ Failed', error: healthError.message }
        : { status: '✅ Success', data: 'Connected to Supabase' }

      // 2. Auth設定テスト
      testResults.auth = { status: 'Testing...' }
      const { data: { session } } = await supabase.auth.getSession()
      testResults.auth = { 
        status: '✅ Checked', 
        session: session ? 'Active session found' : 'No active session' 
      }

      // 3. RLSポリシーテスト
      testResults.rls = { status: 'Testing...' }
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: 'test-id-that-should-fail',
          email: 'test@test.com',
          username: 'test'
        })
      
      testResults.rls = insertError
        ? { status: '✅ RLS is active', error: insertError.message }
        : { status: '⚠️ Warning', message: 'RLS might not be properly configured' }

      // 4. 環境変数チェック
      testResults.env = {
        status: '✅ Checked',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set',
      }

    } catch (error: any) {
      testResults.error = { status: '❌ Error', message: error.message }
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Supabase Debug Tool</h2>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Running Tests...' : 'Run Diagnostic Tests'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold capitalize mb-2">{key}</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}