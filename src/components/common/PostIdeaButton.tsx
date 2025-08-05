'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// コンポーネントの外で一度だけクライアントを作成
const supabase = createClient()

export function PostIdeaButton({ className, children }: { className?: string, children?: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    if (isAuthenticated === false) {
      e.preventDefault()
      router.push('/auth/login')
    }
  }

  return (
    <Link
      href="/ideas/new"
      onClick={handleClick}
      className={`inline-flex items-center justify-center bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors ${className || 'px-4 py-2'}`}
    >
      {children || 'アイデアを投稿'}
    </Link>
  )
}