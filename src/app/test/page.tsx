'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [user, setUser] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
  const [ideasCount, setIdeasCount] = useState<number | null>(null)
  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [testResults, setTestResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [testIdea, setTestIdea] = useState<any>(null)
  const [isWanted, setIsWanted] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<any[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  // Supabase接続テスト
  useEffect(() => {
    const testConnection = async () => {
      try {
        addTestResult('Supabase接続テスト開始')
        
        // 1. 認証状態を確認
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) {
          addTestResult(`認証エラー: ${authError.message}`)
        } else {
          setUser(user)
          addTestResult(user ? `ログイン済み: ${user.email}` : 'ログインしていません')
        }

        // 2. 簡単なクエリでデータベース接続確認
        const { data, error } = await supabase
          .from('ideas')
          .select('count', { count: 'exact', head: true })
        
        if (error) {
          addTestResult(`データベースエラー: ${error.message}`)
          setError(error.message)
          setConnectionStatus('error')
        } else {
          setIdeasCount(data as any)
          addTestResult(`ideasテーブルへのアクセス成功`)
          setConnectionStatus('connected')
        }

        // 3. usersテーブルのカウント取得
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true })
        
        if (usersError) {
          addTestResult(`usersテーブルエラー: ${usersError.message}`)
        } else {
          setUsersCount(usersData as any)
          addTestResult(`usersテーブルへのアクセス成功`)
        }

      } catch (err) {
        addTestResult(`予期しないエラー: ${err}`)
        setConnectionStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    testConnection()
  }, [])

  // 新しいテストアイデアを作成
  const testCreateIdea = async () => {
    if (!user) {
      addTestResult('エラー: ログインが必要です')
      return
    }

    try {
      const testIdea = {
        user_id: user.id,
        title: `テストアイデア ${new Date().toLocaleTimeString()}`,
        problem: 'テスト用の課題です',
        solution: 'テスト用の解決策です',
        target_users: 'テストユーザー',
        category: 'テスト',
        tags: ['test'],
        sketch_urls: []
      }

      const { data, error } = await supabase
        .from('ideas')
        .insert(testIdea)
        .select()
        .single()

      if (error) {
        addTestResult(`アイデア作成エラー: ${error.message}`)
      } else {
        addTestResult(`アイデア作成成功: ID ${data.id}`)
        setTestIdea(data)
        // カウントを更新
        const { data: newCount } = await supabase
          .from('ideas')
          .select('count', { count: 'exact', head: true })
        setIdeasCount(newCount as any)
      }
    } catch (err) {
      addTestResult(`アイデア作成で予期しないエラー: ${err}`)
    }
  }

  // 最新のアイデア5件を取得
  const testReadIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          id,
          title,
          problem,
          created_at,
          user:users(username, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        addTestResult(`アイデア読み取りエラー: ${error.message}`)
      } else {
        addTestResult(`アイデア読み取り成功: ${data.length}件取得`)
        setTables(data)
      }
    } catch (err) {
      addTestResult(`アイデア読み取りで予期しないエラー: ${err}`)
    }
  }

  // いいね機能のテスト
  const testToggleWant = async () => {
    if (!testIdea) {
      addTestResult('エラー: テストアイデアが必要です')
      return
    }

    try {
      // セッションを取得
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        addTestResult('エラー: ログインが必要です')
        return
      }
      
      const userId = session.user.id

      // 既存のwantをチェック
      const { data: existingWant } = await supabase
        .from('wants')
        .select('*')
        .eq('idea_id', testIdea.id)
        .eq('user_id', userId)
        .maybeSingle()

      if (existingWant) {
        // wantを削除
        const { error } = await supabase
          .from('wants')
          .delete()
          .eq('id', existingWant.id)
        
        if (error) throw error
        setIsWanted(false)
        addTestResult('いいね削除成功')
      } else {
        // wantを追加
        const { error } = await supabase
          .from('wants')
          .insert({
            idea_id: testIdea.id,
            user_id: userId,
          })
        
        if (error) throw error
        setIsWanted(true)
        addTestResult('いいね追加成功')
      }
    } catch (err) {
      addTestResult(`いいねテストでエラー: ${err}`)
    }
  }

  // コメント機能のテスト
  const testAddComment = async () => {
    if (!testIdea || !newComment.trim()) {
      addTestResult('エラー: テストアイデア、コメント内容が必要です')
      return
    }

    try {
      // セッションを取得
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        addTestResult('エラー: ログインが必要です')
        return
      }
      
      const userId = session.user.id

      const { data, error } = await supabase
        .from('comments')
        .insert({
          idea_id: testIdea.id,
          user_id: userId,
          content: newComment.trim(),
        })
        .select(`
          *,
          user:users(username, email)
        `)
        .single()

      if (error) throw error

      setComments(prev => [data, ...prev])
      setNewComment('')
      addTestResult(`コメント追加成功: "${data.content}"`)
    } catch (err) {
      addTestResult(`コメントテストでエラー: ${err}`)
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ 接続成功'
      case 'error': return '❌ 接続エラー'
      default: return '🔄 接続テスト中...'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Supabase接続テスト
          </h1>

          {/* 接続状態 */}
          <div className={`p-4 rounded-lg mb-6 ${getStatusColor()}`}>
            <h2 className="text-lg font-semibold mb-2">接続状態</h2>
            <p className="text-sm">{getStatusText()}</p>
            {error && (
              <p className="text-sm mt-2 text-red-600">エラー詳細: {error}</p>
            )}
          </div>

          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">認証状態</h3>
              <p className="text-sm text-blue-700">
                {user ? `ログイン済み (${user.email})` : 'ログインしていません'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Ideas数</h3>
              <p className="text-sm text-green-700">
                {ideasCount !== null ? `${ideasCount}件` : '取得中...'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Users数</h3>
              <p className="text-sm text-purple-700">
                {usersCount !== null ? `${usersCount}件` : '取得中...'}
              </p>
            </div>
          </div>

          {/* ローカルストレージ デバッグ情報 */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">ローカルストレージ デバッグ</h3>
              <button
                onClick={() => {
                  const keys = Object.keys(localStorage)
                  const supabaseKeys = keys.filter(key => key.includes('supabase'))
                  addTestResult(`ローカルストレージキー: 全${keys.length}件, Supabase関連: ${supabaseKeys.length}件`)
                  supabaseKeys.forEach(key => {
                    const value = localStorage.getItem(key)
                    addTestResult(`${key}: ${value ? `存在 (${value.length}文字)` : 'null'}`)
                  })
                }}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                ストレージ確認
              </button>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• セッション情報がローカルストレージに保存されているか確認</p>
              <p>• Googleログイン後にクライアントサイドでアクセス可能かチェック</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={async () => {
                    try {
                      const { data: { session }, error } = await supabase.auth.getSession()
                      addTestResult(`セッション取得結果: ${session ? `ユーザー ${session.user.email}` : '未ログイン'}`)
                      if (error) {
                        addTestResult(`セッション取得エラー: ${error.message}`)
                      }
                    } catch (err) {
                      addTestResult(`セッション取得例外: ${err}`)
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  セッション確認
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Supabase関連のローカルストレージをクリア
                      const keys = Object.keys(localStorage).filter(key => key.includes('supabase'))
                      keys.forEach(key => localStorage.removeItem(key))
                      
                      // Supabaseからサインアウト
                      await supabase.auth.signOut()
                      
                      addTestResult(`認証情報をクリアしました (${keys.length}件のキーを削除)`)
                      
                      // ページをリロード
                      setTimeout(() => window.location.reload(), 1000)
                    } catch (err) {
                      addTestResult(`クリアエラー: ${err}`)
                    }
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  認証クリア
                </button>
              </div>
            </div>
          </div>

          {/* 認証テストボタン */}
          {!user && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">認証テスト</h3>
              <button
                onClick={async () => {
                  try {
                    addTestResult('Googleログインテスト開始')
                    const { data, error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${location.origin}/auth/callback`,
                      },
                    })

                    if (error) {
                      throw error
                    }
                    
                    if (data.url) {
                      addTestResult('Google OAuth URLに移動中...')
                      window.location.href = data.url
                    }
                  } catch (error: any) {
                    addTestResult(`Googleログインエラー: ${error.message}`)
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Googleログインテスト
              </button>
            </div>
          )}

          {/* テストボタン */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              onClick={testReadIdeas}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              アイデア読み取り
            </button>
            <button
              onClick={testCreateIdea}
              disabled={!user}
              className={`px-4 py-2 rounded-md transition-colors ${
                user 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              アイデア作成
            </button>
            <button
              onClick={testToggleWant}
              disabled={!user || !testIdea}
              className={`px-4 py-2 rounded-md transition-colors ${
                user && testIdea
                  ? isWanted 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isWanted ? 'いいね解除' : 'いいねテスト'}
            </button>
            <button
              onClick={testAddComment}
              disabled={!user || !testIdea || !newComment.trim()}
              className={`px-4 py-2 rounded-md transition-colors ${
                user && testIdea && newComment.trim()
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              コメント投稿
            </button>
          </div>

          {/* テストアイデア情報 */}
          {testIdea && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">現在のテストアイデア</h3>
              <p className="text-sm text-gray-600 mb-2">ID: {testIdea.id}</p>
              <p className="text-sm text-gray-700">{testIdea.title}</p>
            </div>
          )}

          {/* コメント入力欄 */}
          {user && testIdea && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">コメントテスト</h4>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="テスト用のコメントを入力してください..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* テスト結果ログ */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">テスト結果ログ</h3>
            <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">テスト結果がここに表示されます</p>
              ) : (
                <ul className="space-y-1">
                  {testResults.map((result, index) => (
                    <li key={index} className="text-sm font-mono text-gray-700">
                      {result}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 取得したデータ */}
          {tables.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                最新のアイデア (最大5件)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        タイトル
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        課題
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        作成者
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        作成日時
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tables.map((idea) => (
                      <tr key={idea.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {idea.id}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {idea.title}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                          {idea.problem}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {idea.user?.username || idea.user?.email || '不明'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(idea.created_at).toLocaleString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 追加されたコメント */}
          {comments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                テスト用コメント ({comments.length}件)
              </h3>
              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <div key={comment.id || index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">
                        {comment.user?.username || comment.user?.email || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">注意事項</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• このページはSupabaseクライアントのテスト用です</li>
              <li>• <strong>重要:</strong> クライアントサイドGoogleログインでローカルストレージにセッション保存</li>
              <li>• ログイン後は「ストレージ確認」でセッション情報を確認してください</li>
              <li>• アイデア作成、いいね、コメントテストはログインが必要です</li>
              <li>• いいね・コメントテストは先にアイデアを作成してください</li>
              <li>• 「認証クリア」でローカルストレージとセッションを完全にリセット</li>
              <li>• テストデータが実際のデータベースに追加されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}