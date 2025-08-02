'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { LoadingScreen } from '@/components/loading/LoadingScreen'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
})

export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // ページ遷移開始時にローディングを表示
    setIsLoading(true)
    
    // 少し遅延を入れてからローディングを非表示に
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // 初回ロード時のローディング表示
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingScreen />}
      {children}
    </LoadingContext.Provider>
  )
}