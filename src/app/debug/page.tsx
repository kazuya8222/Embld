import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createSupabaseServerClient()
  
  let user = null
  let session = null
  let error = null
  
  try {
    const { data: { user: userData }, error: userError } = await supabase.auth.getUser()
    user = userData
    error = userError
    
    const { data: { session: sessionData } } = await supabase.auth.getSession()
    session = sessionData
  } catch (e) {
    error = e
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-bold">User (from getUser())</h2>
          <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="font-bold">Session (from getSession())</h2>
          <pre className="text-sm">{JSON.stringify(session, null, 2)}</pre>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="font-bold">Error</h2>
          <pre className="text-sm">{JSON.stringify(error, null, 2)}</pre>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="font-bold">Environment</h2>
          <pre className="text-sm">
            NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
            NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}
          </pre>
        </div>
      </div>
    </div>
  )
}