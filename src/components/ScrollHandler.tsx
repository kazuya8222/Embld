'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function ScrollHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo')
    
    if (scrollTo) {
      // Wait for the page to fully render
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollTo)
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return null // This component doesn't render anything
}