'use client'

import { Navigation } from '@/components/common/Navigation'
import { Footer } from '@/components/common/Footer'
import { useState, useEffect } from 'react'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showLayout, setShowLayout] = useState(true)

  useEffect(() => {
    const handleLayoutToggle = (event: CustomEvent) => {
      setShowLayout(event.detail.show)
    }

    window.addEventListener('toggleHomeLayout' as any, handleLayoutToggle)
    
    return () => {
      window.removeEventListener('toggleHomeLayout' as any, handleLayoutToggle)
    }
  }, [])

  if (!showLayout) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}