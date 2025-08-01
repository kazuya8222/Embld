'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function PostIdeaButton({ className, children }: { className?: string, children?: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
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
      className={className}
    >
      {children || 'アイデアを投稿'}
    </Link>
  )
}