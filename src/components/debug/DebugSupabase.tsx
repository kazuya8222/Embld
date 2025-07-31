'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { directSupabase } from '@/lib/supabase/direct-client'

export function DebugSupabase() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // 1. 基本的な接続テスト (fetch使用)
      testResults.basicConnection = { status: 'Testing basic HTTP connection...' }
      setResults({...testResults})
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          signal: AbortSignal.timeout(5000)
        })
        
        testResults.basicConnection = {
          status: response.ok ? '✅ HTTP Success' : '❌ HTTP Failed',
          statusCode: response.status,
          statusText: response.statusText
        }
      } catch (fetchError: any) {
        testResults.basicConnection = { 
          status: '❌ HTTP Error', 
          error: fetchError.name === 'TimeoutError' ? 'HTTP Timeout (5秒)' : fetchError.message 
        }
      }
      setResults({...testResults})

      // 2. 新しいSupabaseクライアント作成テスト
      testResults.clientCreation = { status: 'Creating fresh Supabase client...' }
      setResults({...testResults})
      
      try {
        // 新しいクライアントインスタンスを作成
        const freshClient = createClient()
        testResults.clientCreation = { status: '✅ Fresh Client Created', info: 'New client instance ready' }
      } catch (clientError: any) {
        testResults.clientCreation = { status: '❌ Client Creation Failed', error: clientError.message }
      }
      setResults({...testResults})

      // 3. 直接クライアント接続テスト
      testResults.directConnection = { status: 'Testing direct client...' }
      setResults({...testResults})
      
      try {
        const { data: directData, error: directError } = await directSupabase.select('users', 'id', {})
        
        testResults.directConnection = directError 
          ? { status: '❌ Direct Failed', error: directError.message }
          : { status: '✅ Direct Success', data: 'Direct client working', recordCount: directData?.length || 0 }
      } catch (directConnError: any) {
        testResults.directConnection = { status: '❌ Direct Error', error: directConnError.message }
      }
      setResults({...testResults})

      // 4. Supabaseクライアント接続テスト
      testResults.supabaseConnection = { status: 'Testing Supabase client...' }
      setResults({...testResults})
      
      const connectionPromise = supabase
        .from('users')
        .select('id')
        .limit(1)
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabaseクライアントタイムアウト (10秒)')), 10000)
      )
      
      try {
        const { data: healthCheck, error: healthError } = await Promise.race([
          connectionPromise,
          timeoutPromise
        ]) as any
        
        testResults.supabaseConnection = healthError 
          ? { status: '❌ Client Failed', error: healthError.message, details: healthError }
          : { status: '✅ Client Success', data: 'Supabase client working', recordCount: healthCheck?.length || 0 }
      } catch (timeoutError: any) {
        testResults.supabaseConnection = { status: '❌ Client Timeout', error: timeoutError.message }
      }

      // 5. Auth設定テスト
      testResults.auth = { status: 'Testing...' }
      setResults({...testResults})
      
      try {
        const authPromise = supabase.auth.getSession()
        const authTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('認証チェックタイムアウト')), 3000)
        )
        
        const { data: { session } } = await Promise.race([
          authPromise,
          authTimeoutPromise
        ]) as any
        
        testResults.auth = { 
          status: '✅ Checked', 
          session: session ? `Active: ${session.user?.email}` : 'No active session' 
        }
      } catch (authError: any) {
        testResults.auth = { status: '❌ Auth Error', error: authError.message }
      }

      // 6. テーブル構造確認
      testResults.tables = { status: 'Testing...' }
      setResults({...testResults})
      
      try {
        // ideasテーブルの存在確認
        const { data: ideasTest, error: ideasError } = await supabase
          .from('ideas')
          .select('id')
          .limit(1)
        
        // usersテーブルの存在確認  
        const { data: usersTest, error: usersError } = await supabase
          .from('users')
          .select('id')
          .limit(1)
          
        testResults.tables = {
          status: '✅ Checked',
          ideas: ideasError ? `❌ ${ideasError.message}` : '✅ Accessible',
          users: usersError ? `❌ ${usersError.message}` : '✅ Accessible'
        }
      } catch (tableError: any) {
        testResults.tables = { status: '❌ Error', error: tableError.message }
      }

      // 7. 環境変数の詳細チェック
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      testResults.env = {
        status: '✅ Environment Check',
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✅ Set' : '❌ Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? '✅ Set' : '❌ Not set',
        URL_Preview: supabaseUrl?.substring(0, 50) + '...' || 'Not set',
        Key_Preview: supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'Not set',
        URL_Valid: supabaseUrl?.includes('supabase.co') ? '✅ Valid' : '❌ Invalid format',
        Key_Valid: supabaseKey?.startsWith('eyJ') ? '✅ Valid JWT' : '❌ Invalid format'
      }
      
      setResults({...testResults})

    } catch (error: any) {
      testResults.error = { status: '❌ Critical Error', message: error.message }
    }

    // 診断結果とアドバイス
    const hasTimeouts = Object.values(testResults).some((result: any) => 
      result.error?.includes('タイムアウト') || result.error?.includes('Timeout')
    )
    
    testResults.diagnosis = {
      status: '診断結果',
      issue: hasTimeouts ? '接続タイムアウトが発生しています' : '接続は正常です',
      recommendations: hasTimeouts ? [
        '1. 開発サーバーを再起動してください: npm run dev',
        '2. ブラウザのキャッシュをクリアしてください',
        '3. ネットワーク接続を確認してください',
        '4. .env.localファイルの設定を再確認してください'
      ] : ['接続は正常に動作しています']
    }

    // 最終結果
    testResults.summary = {
      status: 'Test Completed',
      timestamp: new Date().toLocaleTimeString(),
      totalTests: Object.keys(testResults).length - 2 // diagnosis と summary を除く
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